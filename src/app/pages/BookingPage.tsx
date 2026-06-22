import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useWorkshopCart } from '../contexts/WorkshopCartContext';
import { BookingForm, type BookingPayload } from '../components/BookingForm';

/**
 * BookingPage — Page/Route layer cho /booking/:workshopId
 *
 * Trách nhiệm:
 * - Nhận payload từ BookingForm (UI component)
 * - Xử lý business logic: clear cart, add workshop, lưu localStorage
 * - Quyết định điều hướng: navigate('/checkout?autopay=workshop')
 *
 * BookingForm không biết mình nằm ở đây — nó chỉ thu thập form và emit data.
 */
export function BookingPage() {
  const navigate = useNavigate();
  const { addWorkshop, clearWorkshopCart } = useWorkshopCart();

  const handleBookingSuccess = (payload: BookingPayload) => {
    const { workshop, contact, slotCount } = payload;

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

    // Business logic: lưu contact để CheckoutPage pre-fill
    window.localStorage.setItem(
      'tho-booking-contact',
      JSON.stringify({ ...contact, slotCount }),
    );

    toast.success('Thông tin đã sẵn sàng. Chọn phương thức thanh toán để giữ slot 15 phút.');

    // Flow: quyết định điều hướng ở đây, không phải trong UI component
    navigate('/checkout?autopay=workshop');
  };

  return <BookingForm onSubmitSuccess={handleBookingSuccess} />;
}
