import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useWorkshopCart } from '../contexts/WorkshopCartContext';
import { WorkshopDetailPage as WorkshopDetailUI, type WorkshopBookingPayload } from '../components/WorkshopDetailPage';

/**
 * WorkshopDetailPage — Page/Route layer cho /workshop/:workshopId
 *
 * Trách nhiệm:
 * - Nhận payload booking từ UI component
 * - Xử lý business logic: clear cart, add workshop, lưu localStorage
 * - Quyết định điều hướng
 */
export function WorkshopDetailPage() {
  const navigate = useNavigate();
  const { addWorkshop, clearWorkshopCart } = useWorkshopCart();

  const handleBookingSubmit = (payload: WorkshopBookingPayload) => {
    const { workshop, contact, slotCount } = payload;

    // Business logic: lưu contact để CheckoutPage pre-fill
    window.localStorage.setItem(
      'tho-booking-contact',
      JSON.stringify({
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        note: contact.notes,
        slotCount,
      }),
    );

    // Business logic: cập nhật workshop cart
    clearWorkshopCart();
    addWorkshop({
      id: `workshop-${workshop.id}-${Date.now()}`,
      name: workshop.name,
      date: workshop.fullDate,
      time: workshop.time,
      instructor: workshop.instructor,
      price: workshop.price,
      tickets: slotCount,
      maxTickets: workshop.slots.available,
      package: workshop.package,
    });

    toast.success('Thông tin đã sẵn sàng. Chọn phương thức thanh toán để giữ slot 15 phút.');

    // Flow: điều hướng sang checkout
    navigate('/checkout?autopay=workshop');
  };

  return <WorkshopDetailUI onBookingSubmit={handleBookingSubmit} />;
}
