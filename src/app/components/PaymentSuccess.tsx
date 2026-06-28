import { useEffect } from 'react';
import { Link } from 'react-router';
import confetti from 'canvas-confetti';
import { CheckCircle, Download, Mail, QrCode, Search } from 'lucide-react';
import { useProductCart, type OrderData } from '../contexts/ProductCartContext';
import { AssetImage, CheckoutShell, products, workshopImages } from './DesignPrimitives';
import { formatAddressLine } from './VietnamAddressPicker';

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

function DemoBarcode({ value }: { value: string }) {
  const bars = Array.from(value).flatMap((char, charIndex) => {
    const code = char.charCodeAt(0);
    return [0, 1, 2, 3].map((offset) => ({
      key: `${char}-${charIndex}-${offset}`,
      width: ((code + offset) % 3) + 2,
      height: 58 + ((code + offset * 7) % 30),
      gap: (code + offset) % 2 === 0 ? 2 : 4,
    }));
  });

  return (
    <div className="mx-auto mt-4 max-w-[520px] rounded-lg border border-[#D8C1AE] bg-white px-5 py-4">
      <div className="flex h-16 items-center justify-center gap-[2px] overflow-hidden">
        {bars.map((bar) => (
          <span
            key={bar.key}
            aria-hidden="true"
            className="inline-block rounded-sm bg-[#2C1907]"
            style={{ width: `${bar.width}px`, height: `${Math.round(bar.height * 0.58)}px`, marginRight: `${bar.gap}px` }}
          />
        ))}
      </div>
      <p className="mt-2 text-center font-mono text-sm tracking-[0.18em] text-[#2C1907]">{value}</p>
    </div>
  );
}

export function PaymentSuccess() {
  const { orderData } = useProductCart();
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
    const itemRows = order.items.map((item) => {
        const quantity = item.type === 'workshop' ? item.tickets : item.quantity;
        return `<tr><td>${item.name}</td><td>x${quantity}</td><td>${(item.price * quantity).toLocaleString('vi-VN')} VND</td></tr>`;
      })
      .join('');
    const html = `<!doctype html>
      <html lang="vi">
        <head>
          <meta charset="utf-8" />
          <title>${order.orderCode}-receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 32px; color: #2B211D; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            td { border-bottom: 1px solid #e5d4c6; padding: 10px 0; }
            td:last-child { text-align: right; }
            .total { font-size: 18px; font-weight: 700; margin-top: 18px; text-align: right; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>THO Studio - Biên lai thanh toán</h1>
          <p>Mã đơn: <strong>${order.orderCode}</strong></p>
          <p>Thời gian: ${createdAt}</p>
          <p>Phương thức: ${order.paymentMethod.toUpperCase()}</p>
          <table>${itemRows}</table>
          <p class="total">Tổng: ${order.total.toLocaleString('vi-VN')} VND</p>
          <button onclick="window.print()">Lưu thành PDF</button>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  return (
    <CheckoutShell active={3}>
      <section className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#D8EFD1]">
            <CheckCircle className="h-12 w-12 text-[#3F7D37]" />
          </div>
          <h1 className="text-2xl font-bold text-black">Đặt hàng thành công</h1>
          <p className="mx-auto mt-3 max-w-[760px] text-sm leading-6 text-[#4F4038]">
            Cảm ơn bạn đã đặt hàng tại THỔ Studio. Mã đơn, vé workshop và thông tin giao hàng đã được tạo để bạn dễ tra cứu lại.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            <div className="rounded-lg border border-[#EFD8C7] bg-[#FFF1E8] p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#716942]">Mã đơn hàng</p>
                  <p className="mt-2 text-3xl font-bold leading-none text-black md:text-4xl">{order.orderCode}</p>
                </div>
                <p className="text-sm font-bold leading-6 text-[#6A5D52] md:text-right">{createdAt}<br />{order.paymentMethod.toUpperCase()}</p>
              </div>

              <DemoBarcode value={order.orderCode} />

              <div className="mt-5 space-y-3 border-t border-dashed border-[#C0AC8B] pt-5 text-sm">
                {order.items.map((item) => {
                  const quantity = item.type === 'workshop' ? item.tickets : item.quantity;
                  const price = item.price * quantity;
                  return (
                    <div key={item.id} className="grid gap-2 md:grid-cols-[1fr_60px_150px]">
                      <span>{item.name}</span>
                      <span>x{quantity}</span>
                      <span className="md:text-right">{price.toLocaleString('vi-VN')}đ</span>
                    </div>
                  );
                })}
                <div className="grid gap-2 border-t border-[#E8D6C9] pt-4 font-bold md:grid-cols-[1fr_60px_150px]">
                  <span>Tổng thanh toán</span>
                  <span />
                  <span className="md:text-right">{order.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button onClick={downloadReceipt} className="mx-auto mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#FBEEE5] px-5 py-2.5 text-sm font-bold transition hover:bg-white" type="button">
                <Download className="h-4 w-4" />
                Tải biên lai PDF
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/" className="rounded-full bg-[#3B2118] px-5 py-2.5 text-center text-sm font-bold text-[#FFF8F2]">Về trang chủ</Link>
              <Link to={`/tracking?code=${order.orderCode}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#3B2118]/25 px-5 py-2.5 text-sm font-bold text-[#3B2118]">
                <Search className="h-4 w-4" />
                Tra cứu tracking
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {workshopItems.length > 0 && (
              <section className="rounded-lg border border-[#EFD8C7] bg-[#FFF1E8] p-5 shadow-sm">
                <h2 className="text-lg font-bold text-black">Vé Workshop của bạn</h2>
                {workshopItems.map((item, index) => (
                  <div key={item.id} className="mt-3">
                    <h3 className="text-sm font-bold">{item.name}</h3>
                    <p className="mt-1 text-sm text-[#6A4A3D]">{item.date} · {item.time}</p>
                    <p className="mt-1 text-sm">Giảng viên: {item.instructor}</p>
                    <div className="mt-3 inline-flex items-center gap-3 rounded-lg bg-white p-3">
                      <QrCode className="h-16 w-16 text-[#361F17]" />
                      <div>
                        <p className="font-mono text-base font-bold">WS-{order.orderCode.slice(-4)}-{String(index + 1).padStart(2, '0')}</p>
                        <p className="mt-1 text-xs text-[#6A4A3D]">Xuất trình khi đến studio</p>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {productItems.length > 0 && (
              <section className="rounded-lg border border-[#EFD8C7] bg-[#FFF1E8] p-5 shadow-sm">
                <h2 className="text-lg font-bold text-black">Thông tin giao hàng</h2>
                <p className="mt-2 text-sm leading-6 text-[#6A4A3D]">
                  {order.customer.name} · {order.customer.phone}<br />
                  {formatAddressLine(order.customer)}
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {productItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.image ? (
                        <AssetImage src={item.image} alt={item.name} className="h-12 w-12 rounded-full" />
                      ) : (
                        <AssetImage src={workshopImages.detailBw} alt={item.name} className="h-12 w-12 rounded-full" />
                      )}
                      <p className="text-sm font-bold">{item.name} · x{item.quantity}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg bg-[#FEF5F2] p-3 text-sm text-red-600">
                  Hàng dễ vỡ / độc bản - giao hàng có bảo hiểm.
                </div>
                <p className="mt-2 text-sm text-[#6A4A3D]">Dự kiến giao: 3-5 ngày làm việc · SMS thông báo khi lấy hàng</p>
              </section>
            )}

            <span className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FFF1E8] px-4 py-3 text-center text-sm text-[#6A5D52]">
              <Mail className="h-4 w-4" />
              Vé và biên lai đã được gửi đến email/SMS của bạn
            </span>
          </div>
        </div>
      </section>
    </CheckoutShell>
  );
}
