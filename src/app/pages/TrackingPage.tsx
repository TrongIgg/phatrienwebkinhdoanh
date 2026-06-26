import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useProductCart } from '../contexts/ProductCartContext';
import { TrackingPage as TrackingUI, type CustomCheckoutPayload } from '../components/TrackingPage';

/**
 * TrackingPage — Page/Route layer cho /tracking
 *
 * Trách nhiệm:
 * - Nhận payload khi user bấm "Thanh toán nếu vừa ý" từ CustomTrackingResult
 * - Thêm custom product vào cart
 * - Ghi sessionStorage checkout product ids
 * - Điều hướng sang /checkout?mode=product
 */
export function TrackingPage() {
  const navigate = useNavigate();
  const { addProduct, productItems } = useProductCart();

  const handleCustomCheckout = (payload: CustomCheckoutPayload) => {
    const { cartItemId, product } = payload;

    // Business logic: thêm vào cart nếu chưa có
    if (!productItems.some((item) => item.id === cartItemId)) {
      addProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        custom: product.custom,
      });
    }

    // Business logic: ghi session để CheckoutPage đọc
    window.sessionStorage.setItem('tho-checkout-product-ids', JSON.stringify([cartItemId]));

    toast.success('Đã chuyển brief custom sang thanh toán.');

    // Flow: điều hướng
    navigate('/checkout?mode=product');
  };

  return <TrackingUI onCustomCheckout={handleCustomCheckout} />;
}
