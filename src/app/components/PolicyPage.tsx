import { CalendarCheck, PackageCheck, ShieldCheck, Truck, Undo2, WalletCards } from 'lucide-react';

const policies = [
  {
    icon: WalletCards,
    title: 'Thanh toán',
    copy: 'QR thanh toán có countdown 5 phút. Với workshop, slot vẫn được giữ 15 phút và trả lại ngay nếu khách hủy hoặc hết hạn.',
  },
  {
    icon: Truck,
    title: 'Vận chuyển',
    copy: 'Chỉ dùng vận chuyển tiêu chuẩn 35.000đ cho sản phẩm vật lý. Gốm sau workshop được gửi đi sau 3 ngày; nội thành dự kiến nhận trong khoảng 2 tuần.',
  },
  {
    icon: ShieldCheck,
    title: 'Bảo hiểm hàng dễ vỡ',
    copy: 'Nếu sản phẩm vỡ do vận chuyển, khách gửi video mở hàng và hình ảnh trong 24 giờ để THỔ đổi sản phẩm tương đương hoặc hoàn phần giá trị phù hợp.',
  },
  {
    icon: Undo2,
    title: 'Đổi trả',
    copy: 'Không đổi trả sản phẩm thủ công vì khác vân men tự nhiên. THỔ hỗ trợ khi giao sai mẫu, lỗi sản xuất rõ ràng hoặc vỡ do vận chuyển có bằng chứng.',
  },
];

const orderPolicies = [
  {
    icon: CalendarCheck,
    title: 'Chính sách vé workshop',
    items: [
      'Hủy trước 48h: hoàn 100%.',
      'Hủy trước 24h: hoàn 50%.',
      'Hủy trong ngày: không hoàn tiền.',
      'Đổi lịch miễn phí nếu còn slot và báo trước 24h.',
    ],
  },
  {
    icon: PackageCheck,
    title: 'Chính sách sản phẩm vật lý',
    items: [
      'Đổi trả trong 7 ngày nếu có lỗi sản xuất rõ ràng.',
      'Bảo hiểm vỡ vận chuyển: hoàn 100% hoặc gửi lại sản phẩm tương đương khi đủ bằng chứng mở hàng.',
      'Không đổi trả sản phẩm theo yêu cầu riêng hoặc custom order.',
    ],
  },
];

export function PolicyPage() {
  return (
    <div className="min-h-screen bg-[#FBEEE5] text-[#361F17]">
      <section className="mx-auto max-w-[1200px] px-6 py-16 lg:px-20">
        <h1 className="text-center text-[56px] font-bold leading-tight text-[#643A2A]">Chính sách THỔ Studio</h1>
        <p className="mx-auto mt-4 max-w-3xl text-center text-xl leading-8 text-[#3F3F35]">
          Trang riêng cho thanh toán, vận chuyển, bảo hiểm hàng dễ vỡ và đổi trả để không bị lẫn với About Us.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {policies.map((policy) => {
            const Icon = policy.icon;
            return (
              <article key={policy.title} className="rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-7">
                <Icon className="h-8 w-8 text-[#716942]" />
                <h2 className="mt-4 text-2xl font-bold">{policy.title}</h2>
                <p className="mt-3 leading-8 text-[#6A5D52]">{policy.copy}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {orderPolicies.map((policy) => {
            const Icon = policy.icon;
            return (
              <section key={policy.title} className="rounded-lg border border-[#C0AC8B] bg-[#FFF8F2] p-8">
                <div className="flex items-center gap-3">
                  <Icon className="h-8 w-8 text-[#716942]" />
                  <h2 className="text-2xl font-bold">{policy.title}</h2>
                </div>
                <ul className="mt-6 space-y-3 text-[#6A5D52]">
                  {policy.items.map((item) => (
                    <li key={item} className="flex gap-3 leading-7">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#716942]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
