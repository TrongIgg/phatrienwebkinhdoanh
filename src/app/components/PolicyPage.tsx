import { ShieldCheck, Truck, Undo2, WalletCards } from 'lucide-react';

const policies = [
  {
    icon: WalletCards,
    title: 'Thanh toán',
    copy: 'QR thanh toán có countdown 5 phút. Với workshop, slot được giữ trong thời gian này và trả lại ngay nếu khách hủy hoặc hết hạn.',
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
      </section>
    </div>
  );
}
