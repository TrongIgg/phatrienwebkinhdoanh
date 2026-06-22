import { useNavigate } from 'react-router';
import { CartPage as CartUI, type CheckoutSelection } from '../components/CartPage';

/**
 * CartPage — Page/Route layer cho /cart
 *
 * Trách nhiệm:
 * - Nhận selection từ CartPage UI
 * - Quyết định navigate đến route checkout nào dựa trên loại items được chọn
 */
export function CartPage() {
  const navigate = useNavigate();

  const handleCheckout = (selection: CheckoutSelection) => {
    const { selectedProductIds, selectedWorkshopIds } = selection;

    // Flow logic: quyết định route dựa trên loại items
    if (selectedProductIds.length > 0 && selectedWorkshopIds.length > 0) {
      navigate('/checkout?mode=combined');
      return;
    }

    if (selectedWorkshopIds.length > 0) {
      navigate('/checkout?autopay=workshop');
      return;
    }

    navigate('/checkout?mode=product');
  };

  return <CartUI onCheckout={handleCheckout} />;
}
