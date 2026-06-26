import { useNavigate } from 'react-router';
import { saveGiftOrder } from '../lib/customerExperience';
import { ProductDetailPage as ProductDetailUI, type GiftOrderData } from '../components/ProductDetailPage';

/**
 * ProductDetailPage — Page/Route layer cho /product/:productId
 *
 * Trách nhiệm:
 * - Quyết định điều hướng khi user bấm "Mua ngay"
 * - Lưu gift order vào localStorage sau khi user thêm quà
 * - Redirect sang /cart sau khi thêm quà
 */
export function ProductDetailPage() {
  const navigate = useNavigate();

  const handleNavigateToCart = () => {
    navigate('/cart');
  };

  const handleGiftAdded = (giftOrder: GiftOrderData) => {
    // Business logic: lưu gift order trước khi redirect
    saveGiftOrder({
      id: giftOrder.id,
      product_id: giftOrder.product_id,
      product_name: giftOrder.product_name,
      occasion: giftOrder.occasion,
      include_wrapping: giftOrder.include_wrapping,
      gift_note: giftOrder.gift_note,
      created_at: giftOrder.created_at,
    });

    // Flow: điều hướng sang giỏ hàng
    navigate('/cart');
  };

  return (
    <ProductDetailUI
      onNavigateToCart={handleNavigateToCart}
      onGiftAdded={handleGiftAdded}
    />
  );
}
