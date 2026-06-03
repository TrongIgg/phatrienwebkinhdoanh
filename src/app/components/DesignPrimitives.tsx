import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Facebook,
  Heart,
  Home,
  Instagram,
  PackageCheck,
  Search,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';

export const palette = {
  page: '#FBEEE5',
  checkoutPage: '#F7F1EC',
  paper: '#FFF8F2',
  paperWarm: '#FFF1E8',
  olive: '#716942',
  clay: '#C0AC8B',
  bark: '#361F17',
  coffee: '#3B2118',
  ink: '#3F3F35',
  rust: '#643A2A',
  line: '#EFD8C7',
};

export const logoImage = new URL('../../../image/logo/logo.jpg', import.meta.url).href;

export const workshopImages = {
  hero: new URL('../../../image/workshop/workshop_02_Yx0ge-ua.jpg', import.meta.url).href,
  wheelBw: new URL('../../../image/workshop/workshop_03_IMU94a5Q.jpg', import.meta.url).href,
  artisanBw: new URL('../../../image/workshop/workshop_04_zmgDUOX9.jpg', import.meta.url).href,
  handsWarm: new URL('../../../image/workshop/workshop_06_-aebrWVm.jpg', import.meta.url).href,
  largePot: new URL('../../../image/workshop/workshop_07_6MJ0jtzI.jpg', import.meta.url).href,
  detailBw: new URL('../../../image/workshop/workshop_20_aVXIc03K.jpg', import.meta.url).href,
};

export const productImages = {
  cupSet: new URL('../../../image/product/products_15_15yTrDMi.jpg', import.meta.url).href,
  tealVase: new URL('../../../image/product/products_20_jpxDBK5P.jpg', import.meta.url).href,
  crackleBowls: new URL('../../../image/product/products_21_zx4XcOtv.jpg', import.meta.url).href,
  blackVase: new URL('../../../image/product/products_23_BNTfGq5m.jpg', import.meta.url).href,
  patternedVase: new URL('../../../image/product/products_26_S2DsBnRc.jpg', import.meta.url).href,
  decor1: new URL('../../../image/product/products_30_FLCCgXjh.jpg', import.meta.url).href,
  decor2: new URL('../../../image/product/products_33_DQTODkVG.jpg', import.meta.url).href,
  decor3: new URL('../../../image/product/products_49_uheAnGAt.jpg', import.meta.url).href,
};

export const workshops = [
  {
    id: '1',
    name: 'Nặn gốm cơ bản',
    day: 'APR',
    date: '14',
    fullDate: 'Thứ Bảy, 31/05/2026',
    time: '09:00 - 11:30',
    instructor: 'Nghệ nhân Minh Châu',
    price: 490000,
    package: '1 người',
    description: 'Làm quen với đất sét, nặn dáng cơ bản và tạo vân thủ công.',
    slots: { available: 8, total: 12 },
    image: workshopImages.handsWarm,
  },
  {
    id: '2',
    name: 'Trang trí gốm cơ bản',
    day: 'AUG',
    date: '20',
    fullDate: 'Chủ Nhật, 01/06/2026',
    time: '14:00 - 16:30',
    instructor: 'Nghệ nhân Hoài An',
    price: 380000,
    package: '1 người',
    description: 'Tô men, vẽ họa tiết và hoàn thiện sản phẩm đã nung mộc.',
    slots: { available: 4, total: 10 },
    image: workshopImages.detailBw,
  },
  {
    id: '3',
    name: 'Combo “Có đôi có cặp”',
    day: 'SEP',
    date: '18',
    fullDate: 'Thứ Bảy, 07/06/2026',
    time: '09:00 - 12:00',
    instructor: 'Nghệ nhân Minh Châu',
    price: 600000,
    package: '2 người',
    description: 'Gói trải nghiệm cho hai người, cùng tạo hình một cặp đồ gốm.',
    slots: { available: 6, total: 10 },
    image: workshopImages.wheelBw,
  },
];

export const products = [
  {
    id: 'p1',
    name: 'Ly gốm',
    detailName: 'Bình gốm men celadon - Dáng oval S',
    description: 'Cao 18cm, men celadon xanh ngọc, hoàn thiện thủ công.',
    price: 380000,
    quantity: 1,
    stock: 'Còn hàng',
    image: productImages.tealVase,
  },
  {
    id: 'p2',
    name: 'Bộ DIY Kit',
    detailName: 'Bộ DIY Kit - Tô màu men cơ bản',
    description: 'Bộ nguyên liệu, cọ, phôi gốm nhỏ và hướng dẫn video.',
    price: 220000,
    quantity: 2,
    stock: 'Còn hàng',
    image: productImages.cupSet,
  },
  {
    id: 'p3',
    name: 'Đĩa gốm trang trí',
    detailName: 'Đĩa gốm trang trí',
    description: 'Dáng tròn, men kem, phù hợp decor bàn trà.',
    price: 300000,
    quantity: 1,
    stock: 'Sắp hết',
    image: productImages.crackleBowls,
  },
  {
    id: 'p4',
    name: 'Bình hoa mini',
    detailName: 'Bình hoa mini men rạn',
    description: 'Dáng nhỏ, mỗi chiếc có vân men khác nhau.',
    price: 260000,
    quantity: 1,
    stock: 'Còn hàng',
    image: productImages.blackVase,
  },
];

export const reviews = [
  {
    name: 'Nguyễn Thu Hà',
    date: '15/05/2026',
    rating: 5,
    title: 'Rất đáng thử',
    comment: 'Không gian ấm, nghệ nhân chỉ từng bước nên mình không bị ngợp dù lần đầu chạm đất.',
  },
  {
    name: 'Trần Minh Tuấn',
    date: '18/05/2026',
    rating: 5,
    title: 'Đi theo nhóm vui',
    comment: 'Combo đôi hợp để đi cuối tuần, có mã theo dõi thành phẩm sau workshop nên yên tâm.',
  },
  {
    name: 'Lê Phương Anh',
    date: '20/05/2026',
    rating: 4,
    title: 'Men đẹp',
    comment: 'Sản phẩm đóng gói kỹ. Màu men ngoài đời dịu hơn, mình sẽ quay lại làm bộ ly.',
  },
  {
    name: 'Phạm Gia Hân',
    date: '22/05/2026',
    rating: 5,
    title: 'Một món quà rất có hồn',
    comment: 'Chiếc đĩa men kem lên màu mềm, nhìn gần thấy rõ nét cọ nên cảm giác rất riêng.',
  },
  {
    name: 'Đỗ Nhật Nam',
    date: '24/05/2026',
    rating: 5,
    title: 'Workshop vừa đủ chậm',
    comment: 'Buổi nặn gốm không vội. Mình thích nhất đoạn được tự sửa dáng ly cho đến khi đúng tay mình.',
  },
  {
    name: 'Mai Thanh Vân',
    date: '26/05/2026',
    rating: 4,
    title: 'Theo dõi thành phẩm rõ ràng',
    comment: 'Sau workshop có mã tracking, biết món của mình đang phơi khô hay vào lò nên đỡ sốt ruột.',
  },
  {
    name: 'Hoàng Bảo Ngọc',
    date: '27/05/2026',
    rating: 5,
    title: 'Đóng gói rất yên tâm',
    comment: 'Bình nhỏ đến tay nguyên vẹn, lớp men ngoài đời sâu hơn ảnh và hợp đặt cạnh hoa khô.',
  },
];

export function ProgressRule({ className = '', light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={`h-3 w-full flex items-center opacity-70 ${className}`}>
      <div
        className="h-1 w-full rounded-full"
        style={{ background: light ? palette.page : palette.olive }}
      />
    </div>
  );
}

export function PlaceholderImage({
  label = 'Ảnh sẽ bổ sung',
  className = '',
  variant = 'light',
}: {
  label?: string;
  className?: string;
  variant?: 'light' | 'dark' | 'clay';
}) {
  const isDark = variant === 'dark';
  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border flex items-center justify-center ${className}`}
      style={{
        background: isDark ? palette.ink : variant === 'clay' ? palette.clay : '#EFE2D6',
        borderColor: isDark ? '#FBEEE566' : '#D8C1AE',
      }}
    >
      <div
        className="absolute inset-6 rounded-full border"
        style={{ borderColor: isDark ? '#FBEEE555' : '#71694255' }}
      />
      <div
        className="absolute h-24 w-36 rounded-[48%_52%_42%_58%] border-4"
        style={{ borderColor: isDark ? palette.page : palette.olive }}
      />
      <div
        className="absolute h-16 w-10 translate-x-10 border-l-4 border-b-4 rounded-bl-[50px]"
        style={{ borderColor: isDark ? palette.page : palette.olive }}
      />
      <span
        className="relative mt-36 text-sm tracking-[0.18em] uppercase"
        style={{ color: isDark ? palette.page : palette.olive }}
      >
        {label}
      </span>
    </div>
  );
}

export function AssetImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  loading = 'lazy',
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
}) {
  return (
    <div className={`overflow-hidden bg-[#EFE2D6] ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  );
}

export function PillButton({
  children,
  variant = 'filled',
  className = '',
}: {
  children: ReactNode;
  variant?: 'filled' | 'outline' | 'light';
  className?: string;
}) {
  const styles =
    variant === 'filled'
      ? 'bg-[#716942] text-white border-[#716942]'
      : variant === 'light'
        ? 'bg-transparent text-white border-white'
        : 'bg-transparent text-[#716942] border-[#716942]';

  return (
    <span className={`inline-flex h-[58px] items-center justify-center rounded-full border-[1.5px] px-8 text-[22px] font-bold ${styles} ${className}`}>
      {children}
    </span>
  );
}

export type SearchFilterState = {
  query: string;
  category: string;
  price: string;
  sort: string;
};

const emptyFilters: SearchFilterState = {
  query: '',
  category: 'all',
  price: 'all',
  sort: 'recent',
};

export function SearchFilters({
  placeholder = 'Tìm workshop hoặc sản phẩm',
  value,
  onChange,
  resultCount,
  categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'product', label: 'Sản phẩm' },
  ],
}: {
  placeholder?: string;
  value?: SearchFilterState;
  onChange?: (value: SearchFilterState) => void;
  resultCount?: number;
  categories?: Array<{ value: string; label: string }>;
}) {
  const [localValue, setLocalValue] = useState<SearchFilterState>(emptyFilters);
  const filters = value ?? localValue;

  const updateFilters = (patch: Partial<SearchFilterState>) => {
    const next = { ...filters, ...patch };
    setLocalValue(next);
    onChange?.(next);
  };

  const resetFilters = () => updateFilters(emptyFilters);

  return (
    <div className="rounded-[22px] border border-[#C0AC8B] bg-[#FFF8F2] p-4 shadow-[0_12px_30px_rgba(113,105,66,0.08)]">
      <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_180px_150px_170px_auto]">
        <label className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#716942]" />
          <input
            value={filters.query}
            onChange={(event) => updateFilters({ query: event.target.value })}
            className="h-[52px] w-full rounded-full border border-[#C0AC8B] bg-white pl-12 pr-5 text-[#361F17] outline-none transition focus:border-[#716942] focus:ring-2 focus:ring-[#716942]/25"
            placeholder={placeholder}
          />
        </label>

        <select
          value={filters.category}
          onChange={(event) => updateFilters({ category: event.target.value })}
          className="h-[52px] rounded-full border border-[#C0AC8B] bg-white px-5 text-[#361F17] outline-none transition focus:border-[#716942] focus:ring-2 focus:ring-[#716942]/25"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>

        <select
          value={filters.price}
          onChange={(event) => updateFilters({ price: event.target.value })}
          className="h-[52px] rounded-full border border-[#C0AC8B] bg-white px-5 text-[#361F17] outline-none transition focus:border-[#716942] focus:ring-2 focus:ring-[#716942]/25"
        >
          <option value="all">Mức giá</option>
          <option value="under300">Dưới 300k</option>
          <option value="300to500">300k - 500k</option>
          <option value="over500">Trên 500k</option>
        </select>

        <select
          value={filters.sort}
          onChange={(event) => updateFilters({ sort: event.target.value })}
          className="h-[52px] rounded-full border border-[#C0AC8B] bg-white px-5 text-[#361F17] outline-none transition focus:border-[#716942] focus:ring-2 focus:ring-[#716942]/25"
        >
          <option value="recent">Mới nhất</option>
          <option value="priceAsc">Giá thấp</option>
          <option value="priceDesc">Giá cao</option>
          <option value="popular">Phổ biến</option>
        </select>

        <button
          type="button"
          onClick={resetFilters}
          className="h-[52px] rounded-full border border-[#716942]/35 px-5 font-semibold text-[#716942] transition hover:bg-[#716942] hover:text-white"
        >
          Xóa lọc
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#7A6A58]">
        <span>{typeof resultCount === 'number' ? `${resultCount} kết quả phù hợp` : 'Nhập từ khóa hoặc chọn bộ lọc để thu hẹp kết quả'}</span>
        {filters.query && <span className="rounded-full bg-[#EFE2D6] px-3 py-1">“{filters.query}”</span>}
        {filters.category !== 'all' && <span className="rounded-full bg-[#EFE2D6] px-3 py-1">{categories.find((item) => item.value === filters.category)?.label}</span>}
        {filters.price !== 'all' && <span className="rounded-full bg-[#EFE2D6] px-3 py-1">Đã lọc giá</span>}
      </div>
    </div>
  );
}

export function ReviewStrip({ limit = reviews.length }: { limit?: number } = {}) {
  const visibleReviews = reviews.slice(0, limit);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {visibleReviews.map((review) => (
        <article key={review.name} className="rounded-lg border border-[#D9D9D9] bg-[#3F3F35] p-5 text-[#FBEEE5]">
          <div className="mb-4 flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className={`h-4 w-4 ${index < review.rating ? 'fill-[#FBEEE5]' : ''}`} />
            ))}
          </div>
          <h3 className="mb-2 text-xl font-semibold">{review.title}</h3>
          <p className="mb-5 line-clamp-3 min-h-[66px] text-sm leading-6 text-[#FBEEE5]/85">{review.comment}</p>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C0AC8B] text-[#361F17]">
              {review.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{review.name}</p>
              <p className="text-sm text-[#B3B3B3]">{review.date}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function CheckoutStepper({ active = 1 }: { active?: 1 | 2 | 3 }) {
  const steps = ['Giỏ hàng', 'Thanh toán', 'Xác nhận'];
  const stepPaths = ['/cart', '/checkout', '/success'];
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center gap-5 text-[#F7F1EC]">
      {steps.map((step, index) => {
        const number = index + 1;
        const isDone = number < active;
        const isActive = number === active;
        const isClickable = isDone;

        return (
          <div key={step} className="flex items-center gap-4">
            <div
              className={`text-center ${isClickable ? 'cursor-pointer' : ''}`}
              onClick={() => isClickable && navigate(stepPaths[index])}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
            >
              <div
                className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${isClickable ? 'hover:scale-110' : ''}`}
                style={{ background: isActive ? palette.checkoutPage : '#6A4A3D', color: isActive ? palette.coffee : '#BFA99E' }}
              >
                {isDone ? '✓' : number}
              </div>
              <p className="mt-1 text-sm font-bold">{step}</p>
            </div>
            {index < steps.length - 1 && <div className="h-px w-20 bg-[#6A4A3D]" />}
          </div>
        );
      })}
    </div>
  );
}

export function CheckoutShell({
  active,
  children,
}: {
  active: 1 | 2 | 3;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen text-[#2B211D]" style={{ background: palette.checkoutPage }}>
      <div className="bg-[#3B2118] px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <Link to="/" className="inline-flex items-center transition-opacity hover:opacity-85" aria-label="Về trang chủ THỔ">
            <img src={logoImage} alt="THỔ Studio logo" className="h-14 w-14 rounded-full object-cover ring-1 ring-[#FFF7EF]/35" />
          </Link>
          <CheckoutStepper active={active} />
        </div>
      </div>
      {children}
    </div>
  );
}

export function EndBodyFooter() {
  return (
    <footer className="bg-[#3B2118] text-[#F7F1EC]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-8 py-10 md:grid-cols-[170px_1fr_1fr_1.25fr] lg:px-12">
        <div className="flex justify-center md:justify-start">
          <img
            src={logoImage}
            alt="THỔ Studio logo"
            className="h-[150px] w-[150px] rounded-[6px] bg-[#F7F1EC] object-cover p-2"
          />
        </div>

        <div>
          <h3 className="mb-4 text-xl font-light">Thông tin về chính sách</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm font-light leading-5">
            <li><Link to="/policy" className="hover:text-[#C0AC8B] transition-colors">Mua hàng và thanh toán Online</Link></li>
            <li><Link to="/policy" className="hover:text-[#C0AC8B] transition-colors">Chính sách giao hàng</Link></li>
            <li><Link to="/policy" className="hover:text-[#C0AC8B] transition-colors">Chính sách đổi trả</Link></li>
            <li><Link to="/policy" className="hover:text-[#C0AC8B] transition-colors">Bảo hiểm hàng dễ vỡ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xl font-light">Dịch vụ và thông tin khác</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm font-light leading-5">
            <li><Link to="/tracking" className="hover:text-[#C0AC8B] transition-colors">Quy trình theo dõi đơn hàng</Link></li>
            <li><Link to="/about" className="hover:text-[#C0AC8B] transition-colors">Liên hệ và hợp tác kinh doanh</Link></li>
            <li><Link to="/about" className="hover:text-[#C0AC8B] transition-colors">Tuyển dụng</Link></li>
            <li><Link to="/about" className="hover:text-[#C0AC8B] transition-colors">Quy chế hoạt động</Link></li>
            <li><Link to="/about" className="hover:text-[#C0AC8B] transition-colors">Về chúng tôi</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xl font-light">Theo dõi THỔ trên mạng xã hội</h3>
          <div className="space-y-4 text-sm font-light">
            <a href="https://www.facebook.com/tho" className="flex items-center gap-5 hover:text-[#C0AC8B]">
              <Facebook className="h-8 w-8" />
              <span>https://www.facebook.com/tho</span>
            </a>
            <a href="https://www.instagram.com/tho/" className="flex items-center gap-5 hover:text-[#C0AC8B]">
              <Instagram className="h-8 w-8" />
              <span>https://www.instagram.com/tho/</span>
            </a>
          </div>

          <h3 className="mt-7 text-xl font-light">Tổng đài hỗ trợ trực tuyến</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-light leading-5">
            <li>Mua hàng 0912784507 (7h30 - 22h00)</li>
            <li>Khiếu nại 0912784507 (8h00 - 21h30)</li>
          </ul>
        </div>
      </div>

      <p className="mx-auto max-w-[1220px] px-8 pb-10 pt-4 text-center text-base font-light leading-5">
        Công ty TNHH Thương Mại và Dịch Vụ Mỹ nghệ - THỔ: 0912784507 cấp tại Sở KH & ĐT TP. HCM.
        Địa chỉ văn phòng: XXX-XXX Võ Văn Ngân, Thành phố Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam.
        Điện thoại: 028.7108.9666.
      </p>

    </footer>
  );
}

export function PolicyBar() {
  return <EndBodyFooter />;
}

export function JourneyIcon({ type }: { type: 'calendar' | 'booking' | 'workshop' | 'track' | 'gift' }) {
  const map = {
    calendar: Calendar,
    booking: CheckCircle2,
    workshop: Home,
    track: Heart,
    gift: PackageCheck,
  };
  const Icon = map[type];
  return <Icon className="h-12 w-12 text-[#361F17]" />;
}
