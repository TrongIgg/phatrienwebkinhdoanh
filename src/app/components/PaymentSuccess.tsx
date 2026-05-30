import { useEffect } from 'react';
import { Link } from 'react-router';
import confetti from 'canvas-confetti';
import { CheckCircle, Mail, QrCode, Search } from 'lucide-react';
import { useCart, type OrderData } from '../contexts/CartContext';
import { AssetImage, CheckoutShell, PlaceholderImage, PolicyBar, products, workshopImages } from './DesignPrimitives';

const fallbackOrder: OrderData = {
  orderCode: 'THO-826491',
  items: [
    {
      type: 'workshop',
      id: 'fallback-ws',
      name: 'Workshop làm gốm - Combo 2 người',
      date: 'Thứ Bảy, 31/05/2026',
      time: '09:00 - 11:30',
      instructor: 'Nghệ nhân Minh Châu',
      price: 490000,
      tickets: 1,
      package: '2 người',
      reservedUntil: Date.now() + 15 * 60 * 1000,
    },
    { type: 'product', id: products[0].id, name: products[0].detailName, price: products[0].price, quantity: 1, image: products[0].image },
    { type: 'product', id: products[1].id, name: products[1].detailName, price: products[1].price, quantity: 2, image: products[1].image },
  ],
  subtotal: 1310000,
  shippingFee: 40000,
  total: 1350000,
  customer: {
    name: 'Nguyễn Văn A',
    phone: '0948558670',
    email: 'anguyen@gmail.com',
    city: 'TP. Hồ Chí Minh',
    district: 'Thủ Đức',
    ward: 'Linh Trung',
    address: '12 Võ Văn Ngân',
    note: '',
    shipping: 'standard',
  },
  createdAt: new Date().toISOString(),
  paymentMethod: 'momo',
};

export function PaymentSuccess() {
  const { orderData } = useCart();
  const order = orderData ?? fallbackOrder;
  const workshopItems = order.items.filter((item) => item.type === 'workshop');
  const productItems = order.items.filter((item) => item.type === 'product');
  const createdAt = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(order.createdAt));

  useEffect(() => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.18 },
      colors: ['#716942', '#C0AC8B', '#3B2118', '#FBEEE5'],
    });
  }, []);

  const downloadReceipt = () => {
    const lines = [
      'THO Studio Receipt',
      `Order: ${order.orderCode}`,
      `Created at: ${createdAt}`,
      `Payment: ${order.paymentMethod.toUpperCase()}`,
      ...order.items.map((item) => {
        const quantity = item.type === 'workshop' ? item.tickets : item.quantity;
        return `${item.name} x${quantity} = ${(item.price * quantity).toLocaleString('vi-VN')} VND`;
      }),
      `Total: ${order.total.toLocaleString('vi-VN')} VND`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order.orderCode}-receipt.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CheckoutShell active={3}>
      <section className="mx-auto max-w-[1440px] px-6 py-20">
        <div className="text-center">
          <div className="mx-auto mb-8 flex h-[134px] w-[134px] items-center justify-center rounded-full bg-[#D8EFD1]">
            <CheckCircle className="h-20 w-20 text-[#3F7D37]" />
          </div>
          <h1 className="text-[40px] font-extrabold text-black">ĐẶT HÀNG THÀNH CÔNG!</h1>
          <p className="mx-auto mt-6 max-w-[968px] text-[21px] leading-8 text-black">
            Cảm ơn bạn đã đặt hàng tại THỔ Studio. Mã đơn, vé workshop và thông tin giao hàng đã được tạo để bạn dễ tra cứu lại.
          </p>
        </div>

        <div className="mt-20 rounded-[36px] border-[3px] border-[#EFD8C7] bg-[#FFF1E8] p-8 shadow-md md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xl font-bold text-[#2C1907]">MÃ ĐƠN HÀNG</p>
              <p className="mt-8 text-[54px] font-light leading-none text-black md:text-[82px]">{order.orderCode}</p>
            </div>
            <p className="text-center text-base font-bold leading-8">{createdAt}<br />{order.paymentMethod.toUpperCase()}</p>
          </div>

          <PlaceholderImage label="Mã vạch" className="mx-auto mt-8 h-[156px] max-w-[700px] rounded-none" />
          <p className="mt-4 text-center text-base">{order.orderCode}</p>

          <div className="mt-16 space-y-6 border-t border-dashed border-black pt-10 text-2xl md:text-3xl">
            {order.items.map((item) => {
              const quantity = item.type === 'workshop' ? item.tickets : item.quantity;
              const price = item.price * quantity;
              return (
                <div key={item.id} className="grid gap-4 md:grid-cols-[1fr_80px_220px]">
                  <span>{item.name}</span>
                  <span>x{quantity}</span>
                  <span>{price.toLocaleString('vi-VN')}đ</span>
                </div>
              );
            })}
            <div className="grid gap-4 border-t border-[#E8D6C9] pt-6 font-bold md:grid-cols-[1fr_80px_220px]">
              <span>Tổng thanh toán</span>
              <span />
              <span>{order.total.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          <button onClick={downloadReceipt} className="mt-12 w-full rounded-full bg-[#FBEEE5] py-6 text-2xl transition hover:bg-white" type="button">
            Tải biên lai
          </button>
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-2">
          {workshopItems.length > 0 && (
            <section className="rounded-[36px] border-[3px] border-[#EFD8C7] bg-[#FFF1E8] p-10 shadow-md">
              <h2 className="text-[42px] font-light text-black">Vé Workshop của bạn</h2>
              {workshopItems.map((item, index) => (
                <div key={item.id} className="mt-8">
                  <h3 className="text-3xl">{item.name}</h3>
                  <p className="mt-5 text-xl text-[#6A4A3D]">{item.date} · {item.time}</p>
                  <p className="mt-4 text-xl">Giảng viên: {item.instructor}</p>
                  <div className="mt-8 rounded-[32px] bg-white p-8">
                    <QrCode className="h-36 w-36 text-[#361F17]" />
                    <p className="mt-5 text-2xl">WS-{order.orderCode.slice(-4)}-{String(index + 1).padStart(2, '0')}</p>
                    <p className="mt-3 text-lg text-[#6A4A3D]">Xuất trình khi đến studio</p>
                  </div>
                </div>
              ))}
            </section>
          )}

          {productItems.length > 0 && (
            <section className="rounded-[36px] border-[3px] border-[#EFD8C7] bg-[#FFF1E8] p-10 shadow-md">
              <h2 className="text-[42px] font-light text-black">Thông tin giao hàng</h2>
              <p className="mt-6 text-xl leading-8 text-[#6A4A3D]">
                {order.customer.name} · {order.customer.phone}<br />
                {order.customer.address}, {order.customer.ward}, {order.customer.district}, {order.customer.city}
              </p>
              <div className="mt-10 space-y-6">
                {productItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-6">
                    {item.image ? (
                      <AssetImage src={item.image} alt={item.name} className="h-[96px] w-[96px] rounded-full" />
                    ) : (
                      <AssetImage src={workshopImages.detailBw} alt={item.name} className="h-[96px] w-[96px] rounded-full" />
                    )}
                    <p className="text-2xl">{item.name} · x{item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="mt-10 rounded-[32px] bg-[#FEF5F2] p-7 text-xl text-red-600">
                Hàng dễ vỡ / độc bản - giao hàng có bảo hiểm.
              </div>
              <p className="mt-8 text-xl text-[#6A4A3D]">Dự kiến giao: 3-5 ngày làm việc · SMS thông báo khi lấy hàng</p>
            </section>
          )}
        </div>

        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link to="/" className="rounded-full bg-[#3B2118] px-7 py-3 text-center text-[#FFF8F2]">Về trang chủ</Link>
          <Link to={`/tracking?code=${order.orderCode}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#3B2118]/25 px-7 py-3 text-[#3B2118]">
            <Search className="h-4 w-4" />
            Tra cứu tracking
          </Link>
          <span className="inline-flex items-center gap-2 text-[#6A5D52]">
            <Mail className="h-5 w-5" />
            Vé và biên lai đã được gửi đến email/SMS của bạn
          </span>
        </div>
      </section>
      <PolicyBar />
    </CheckoutShell>
  );
}
