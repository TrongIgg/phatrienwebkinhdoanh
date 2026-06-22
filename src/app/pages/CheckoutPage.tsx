import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useProductCart } from '../contexts/ProductCartContext';
import { useWorkshopCart } from '../contexts/WorkshopCartContext';
import { api } from '../lib/api';
import { saveLocalTrackingRecords } from '../lib/trackingStorage';
import { CheckoutPage as CheckoutUI, type OrderPayload } from '../components/CheckoutPage';

const CHECKOUT_PRODUCT_IDS_KEY = 'tho-checkout-product-ids';
const CHECKOUT_WORKSHOP_IDS_KEY = 'tho-checkout-workshop-ids';
const BOOKING_CONTACT_STORAGE_KEY = 'tho-booking-contact';
const ADDRESS_STORAGE_KEY = 'tho-address-suggestions';

/**
 * CheckoutPage — Page/Route layer cho /checkout
 *
 * Trách nhiệm:
 * - Nhận OrderPayload từ CheckoutPage UI sau khi user xác nhận thanh toán
 * - Gọi API tạo tracking records
 * - Lưu tracking records local
 * - Lưu address suggestions
 * - Xóa cart (product + workshop theo selection)
 * - Xóa sessionStorage keys
 * - Navigate đến /success hoặc /payment-failed
 *
 * CheckoutPage UI không biết gì về việc này — nó chỉ thu thập form và hiển thị QR modal.
 */
export function CheckoutPage() {
  const navigate = useNavigate();
  const { productItems, removeProduct, clearProductCart, setOrderData } = useProductCart();
  const { workshopItems, removeWorkshop, clearWorkshopCart } = useWorkshopCart();

  const handlePaymentSuccess = async (payload: OrderPayload) => {
    const {
      orderCode,
      checkoutItems,
      subtotal,
      shippingFee,
      total,
      customer,
      paymentMethod,
      hasProducts,
      hasWorkshopCheckout,
      selectedProductIds,
      selectedWorkshopIds,
      trackingRecords,
    } = payload;

    // 1. Lưu tracking records local ngay (để không mất nếu API lỗi)
    saveLocalTrackingRecords(trackingRecords);

    // 2. Gọi API (không blocking — lỗi thì giữ local records)
    try {
      const persistedRecords = await api.createTrackingRecords(trackingRecords);
      saveLocalTrackingRecords(persistedRecords);
    } catch (error) {
      console.warn('Tracking records kept locally until backend is available.', error);
    }

    // 3. Cập nhật order context để PaymentSuccess page đọc được
    setOrderData({
      orderCode,
      items: checkoutItems.map((item) => ({ ...item })),
      subtotal,
      shippingFee,
      total,
      customer,
      createdAt: new Date().toISOString(),
      paymentMethod,
    });

    // 4. Lưu address suggestion nếu là đơn sản phẩm
    if (hasProducts && customer.address) {
      try {
        const stored = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
        const existing = stored ? JSON.parse(stored) : [];
        const fingerprint = `${customer.address}-${customer.ward}-${customer.district}-${customer.city}`.toLowerCase();
        const next = [customer, ...existing.filter((item: typeof customer) =>
          `${item.address}-${item.ward}-${item.district}-${item.city}`.toLowerCase() !== fingerprint
        )].slice(0, 4);
        window.localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // không quan trọng nếu lỗi
      }
    }

    // 5. Xóa product cart theo selection
    if (hasProducts) {
      if (selectedProductIds.length === productItems.length) {
        clearProductCart();
      } else {
        selectedProductIds.forEach((id) => removeProduct(id));
      }
      window.sessionStorage.removeItem(CHECKOUT_PRODUCT_IDS_KEY);
    }

    // 6. Xóa workshop cart theo selection
    if (hasWorkshopCheckout) {
      if (selectedWorkshopIds.length === workshopItems.length) {
        clearWorkshopCart();
      } else {
        selectedWorkshopIds.forEach((id) => removeWorkshop(id));
      }
      window.sessionStorage.removeItem(CHECKOUT_WORKSHOP_IDS_KEY);
      window.localStorage.removeItem(BOOKING_CONTACT_STORAGE_KEY);
    }

    toast.success(`Đặt hàng thành công! Mã đơn: ${orderCode}`);

    // 7. Điều hướng đến trang thành công
    navigate('/success');
  };

  const handlePaymentCancel = (selectedWorkshopIds: string[]) => {
    // Xóa workshop slot khỏi cart khi hủy
    selectedWorkshopIds.forEach((id) => removeWorkshop(id));
    window.sessionStorage.removeItem(CHECKOUT_WORKSHOP_IDS_KEY);
    window.localStorage.removeItem(BOOKING_CONTACT_STORAGE_KEY);

    // Điều hướng đến trang thanh toán thất bại
    navigate('/payment-failed');
  };

  return (
    <CheckoutUI
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentCancel={handlePaymentCancel}
    />
  );
}
