import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Calendar, Clock, Flame, Search, Sparkles, Users } from 'lucide-react';
import { api, type ApiWorkshop } from '../lib/api';
import { getHomeCampaign, readBehaviorTags, type BehaviorTag } from '../lib/personalization';
import { AssetImage, workshopImages } from './DesignPrimitives';
import { WorkshopChatbot } from './WorkshopChatbot';

export type WorkshopView = {
  id: string;
  name: string;
  fullDate: string;
  startDate: string;
  time: string;
  instructor: string;
  price: number;
  package: string;
  audience: string;
  workshopType: string;
  description: string;
  slots: { available: number; total: number };
  image: string;
};

const descriptions: Record<string, string> = {
  basic: 'Một buổi chạm đất nhẹ nhàng: nặn dáng, vuốt mép và để lại dấu tay đầu tiên trên gốm.',
  painting: 'Dành cho người mê màu men: chọn bảng màu, vẽ nét, phủ men lên phôi đã nung mộc.',
  combo: 'Đi cùng một người thương hoặc bạn thân, mỗi người làm một món rồi ghép thành một cặp.',
  family: 'Nhịp làm chậm cho gia đình, có trợ giảng kèm trẻ nhỏ và góc chụp thành phẩm.',
  premium: 'Bàn xoay riêng, thời lượng dài hơn, nghệ nhân đi sát từng dáng tay và độ nghiêng của đất.',
  tea: 'Nặn chén trà nhỏ, nghe về men và học cách nhìn một chiếc chén bằng tay trước khi bằng mắt.',
  sculpture: 'Tạo tượng gốm nhỏ theo hình thú, nhà, mây hoặc ký hiệu riêng của bạn.',
};

const imagePool = [
  new URL('../../../image/workshop/User attachment.png', import.meta.url).href,
  new URL('../../../image/workshop/Userattachment2.png', import.meta.url).href,
  new URL('../../../image/workshop/Userattachment3.png', import.meta.url).href,
  new URL('../../../image/workshop/Userattachment4.png', import.meta.url).href,
  new URL('../../../image/workshop/Userattachment5.png', import.meta.url).href,
  new URL('../../../image/workshop/Userattachment6.png', import.meta.url).href,
  new URL('../../../image/workshop/Userattachment7.png', import.meta.url).href,
  new URL('../../../image/workshop/Userattachment8.png', import.meta.url).href,
  new URL('../../../image/workshop/Userattachment9.png', import.meta.url).href,
  new URL('../../../image/workshop/Userattachment10.png', import.meta.url).href,
  workshopImages.handsWarm,
  workshopImages.detailBw,
  workshopImages.wheelBw,
  workshopImages.hero,
  workshopImages.largePot,
  workshopImages.artisanBw,
];

const fallbackWorkshops: WorkshopView[] = [
  ['1', 'Nặn gốm cơ bản', 'Thứ Bảy, 31/05/2026', '2026-05-31', '09:00 - 11:30', 'Nghệ nhân Minh Châu', 490000, '1 người', 'single_friendly', 'basic', 8, 12],
  ['2', 'Trang trí gốm bằng men màu', 'Chủ Nhật, 01/06/2026', '2026-06-01', '14:00 - 16:30', 'Nghệ nhân Hoài An', 380000, '1 người', 'single_friendly', 'painting', 4, 10],
  ['3', 'Combo có đôi có cặp', 'Thứ Bảy, 07/06/2026', '2026-06-07', '09:00 - 12:00', 'Nghệ nhân Minh Châu', 600000, '2 người', 'couple_friendly', 'combo', 6, 10],
  ['4', 'Gia đình cùng nặn đất', 'Chủ Nhật, 08/06/2026', '2026-06-08', '09:00 - 11:30', 'Nghệ nhân Bảo Trân', 1250000, 'Gia đình 3-4 người', 'family_friendly', 'family', 3, 8],
  ['5', 'Bàn xoay premium riêng', 'Thứ Bảy, 14/06/2026', '2026-06-14', '15:00 - 18:00', 'Nghệ nhân Minh Châu', 1450000, '1 người', 'single_friendly', 'premium', 2, 6],
  ['6', 'Chén trà và men sữa', 'Chủ Nhật, 15/06/2026', '2026-06-15', '09:30 - 12:00', 'Nghệ nhân An Nhiên', 520000, '1 người', 'single_friendly', 'tea', 7, 12],
  ['7', 'Tượng gốm mini cuối tuần', 'Thứ Bảy, 21/06/2026', '2026-06-21', '13:30 - 16:00', 'Nghệ nhân Hoài An', 450000, '1 người', 'single_friendly', 'sculpture', 9, 14],
  ['8', 'Nhóm bạn vẽ đĩa gốm', 'Chủ Nhật, 22/06/2026', '2026-06-22', '15:00 - 17:30', 'Nghệ nhân Bảo Trân', 880000, 'Nhóm 3 người', 'couple_friendly', 'painting', 5, 12],
  ['9', 'Gốm và hoa khô gia đình', 'Thứ Bảy, 28/06/2026', '2026-06-28', '09:00 - 11:30', 'Nghệ nhân An Nhiên', 1180000, 'Gia đình 3 người', 'family_friendly', 'family', 4, 9],
  ['10', 'Đêm đất và ánh nến', 'Chủ Nhật, 29/06/2026', '2026-06-29', '18:00 - 20:30', 'Nghệ nhân Minh Châu', 990000, '2 người', 'couple_friendly', 'combo', 6, 10],
].map(([id, name, fullDate, startDate, time, instructor, price, pkg, audience, workshopType, available, total], index) => ({
  id: String(id),
  name: String(name),
  fullDate: String(fullDate),
  startDate: String(startDate),
  time: String(time),
  instructor: String(instructor),
  price: Number(price),
  package: String(pkg),
  audience: String(audience),
  workshopType: String(workshopType),
  description: descriptions[String(workshopType)] ?? descriptions.basic,
  slots: { available: Number(available), total: Number(total) },
  image: imagePool[index % imagePool.length],
}));

function mapWorkshop(row: ApiWorkshop, index: number): WorkshopView {
  return {
    id: String(row.id),
    name: row.name,
    fullDate: row.full_date,
    startDate: row.start_date ?? '',
    time: row.time,
    instructor: row.instructor,
    price: row.price_vnd,
    package: row.package,
    audience: row.audience,
    workshopType: row.workshop_type,
    description: descriptions[row.workshop_type] ?? 'Workshop gốm thủ công tại THỔ Studio.',
    slots: { available: row.available_slots, total: row.total_slots },
    image: imagePool[index % imagePool.length],
  };
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function inDateRange(workshop: WorkshopView, range: string) {
  if (range === 'all' || !workshop.startDate) return true;
  const start = new Date(workshop.startDate).getTime();
  const today = new Date('2026-06-03T00:00:00+07:00');
  const dayMs = 24 * 60 * 60 * 1000;
  if (range === 'week') return start >= today.getTime() && start <= today.getTime() + 7 * dayMs;
  if (range === 'month') {
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).getTime();
    return start >= today.getTime() && start <= monthEnd;
  }
  if (range === 'next_month') {
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1).getTime();
    const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0, 23, 59, 59).getTime();
    return start >= nextMonthStart && start <= nextMonthEnd;
  }
  return true;
}

function inPriceRange(workshop: WorkshopView, range: string) {
  if (range === 'under_500') return workshop.price < 500000;
  if (range === '500_900') return workshop.price >= 500000 && workshop.price <= 900000;
  if (range === 'over_900') return workshop.price > 900000;
  return true;
}

const audienceLabels: Record<string, string> = {
  single_friendly: 'Cá nhân',
  couple_friendly: 'Nhóm bạn / cặp đôi',
  family_friendly: 'Gia đình',
};

const typeLabels: Record<string, string> = {
  basic: 'Nặn gốm',
  painting: 'Vẽ men',
  combo: 'Combo',
  family: 'Gia đình',
  premium: 'Premium',
  tea: 'Chén trà',
  sculpture: 'Tượng nhỏ',
};



export function WorkshopPage() {
  const [workshops, setWorkshops] = useState<WorkshopView[]>(fallbackWorkshops);
  const [query, setQuery] = useState('');
  const [audience, setAudience] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [behaviorTags, setBehaviorTags] = useState<BehaviorTag[]>(() => readBehaviorTags());

  const [type, setType] = useState('all');

  useEffect(() => {
    api.workshops()
      .then((rows) => setWorkshops(rows.map(mapWorkshop)))
      .catch(() => setWorkshops(fallbackWorkshops));
  }, []);

  useEffect(() => {
    const updateTags = () => setBehaviorTags(readBehaviorTags());
    window.addEventListener('tho-behavior-tags-updated', updateTags);
    window.addEventListener('storage', updateTags);
    return () => {
      window.removeEventListener('tho-behavior-tags-updated', updateTags);
      window.removeEventListener('storage', updateTags);
    };
  }, []);

  const filteredWorkshops = useMemo(() => {
    const personalizedRank = (workshop: WorkshopView) => {
      let score = 0;
      if (behaviorTags.includes('evening_learner') && workshop.time.includes('18:')) score += 6;
      if (behaviorTags.includes('duo') && workshop.audience === 'couple_friendly') score += 5;
      if (behaviorTags.includes('gifting') && ['combo', 'painting'].includes(workshop.workshopType)) score += 4;
      if (behaviorTags.includes('family') && workshop.audience === 'family_friendly') score += 4;
      if (behaviorTags.includes('premium') && workshop.workshopType === 'premium') score += 6;
      if (workshop.slots.available <= 4) score += 2;
      return score;
    };

    return workshops.filter((workshop) => {
      const text = normalize(`${workshop.name} ${workshop.description} ${workshop.fullDate} ${workshop.instructor}`);
      return (
        (!query || text.includes(normalize(query))) &&
        (audience === 'all' || workshop.audience === audience) &&
        (type === 'all' || workshop.workshopType === type) &&
        inPriceRange(workshop, priceRange) &&
        inDateRange(workshop, dateRange)
      );
    }).sort((a, b) => personalizedRank(b) - personalizedRank(a));
  }, [workshops, query, audience, type, priceRange, dateRange, behaviorTags]);

  const campaign = getHomeCampaign(behaviorTags);

  return (
    <div className="min-h-screen bg-[#FBEEE5] text-[#361F17]">
      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-20">
        <h1 className="text-center text-[42px] font-bold leading-tight text-[#643A2A] sm:text-[56px]">Đặt workshop</h1>
        <p className="mx-auto mt-4 max-w-3xl text-center text-xl leading-8 text-[#3F3F35]">
          Lọc theo loại workshop, ngân sách, thời gian và nhóm khách để chọn buổi học hợp nhịp của bạn.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-lg bg-[#361F17] p-6 text-[#FBEEE5] shadow-[0_18px_42px_rgba(54,31,23,0.12)]">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C96B37] text-white">
                <Sparkles className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C0AC8B]">{campaign.eyebrow}</p>
                <h2 className="mt-2 text-3xl font-bold leading-tight">{campaign.title}</h2>
                <p className="mt-3 max-w-3xl text-lg leading-7 text-[#FBEEE5]/80">{campaign.body}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-[#C0AC8B] bg-white p-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#716942]">Tín hiệu đang dùng</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(behaviorTags.length ? behaviorTags : ['first_timer']).map((tag) => (
                <span key={tag} className="rounded-full bg-[#F4E4D8] px-3 py-1 text-sm font-bold text-[#643A2A]">#{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <WorkshopChatbot compact />
        </div>

        <div className="mt-10 rounded-[18px] border border-[#C0AC8B] bg-[#FFF8F2] p-4 shadow-[0_12px_30px_rgba(113,105,66,0.08)]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_180px_180px_180px_190px]">
            <label className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#716942]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 w-full rounded-full border border-[#C0AC8B] bg-white pl-12 pr-5 outline-none focus:ring-2 focus:ring-[#716942]/25"
                placeholder="Tìm workshop, nghệ nhân, ngày học..."
              />
            </label>
            <select value={type} onChange={(event) => setType(event.target.value)} className="h-12 rounded-full border border-[#C0AC8B] bg-white px-5">
              <option value="all">Tất cả workshop</option>
              <option value="basic">Nặn gốm cơ bản</option>
              <option value="painting">Trang trí gốm</option>
              <option value="combo">Combo nhóm</option>
              <option value="family">Gia đình</option>
              <option value="premium">Premium</option>
              <option value="tea">Chén trà</option>
              <option value="sculpture">Tượng nhỏ</option>
            </select>
            <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)} className="h-12 rounded-full border border-[#C0AC8B] bg-white px-5">
              <option value="all">Tất cả mức giá</option>
              <option value="under_500">Dưới 500.000đ</option>
              <option value="500_900">500.000đ - 900.000đ</option>
              <option value="over_900">Trên 900.000đ</option>
            </select>
            <select value={dateRange} onChange={(event) => setDateRange(event.target.value)} className="h-12 rounded-full border border-[#C0AC8B] bg-white px-5">
              <option value="all">Tất cả thời gian</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="next_month">Tháng sau</option>
            </select>
            <select value={audience} onChange={(event) => setAudience(event.target.value)} className="h-12 rounded-full border border-[#C0AC8B] bg-white px-5">
              <option value="all">Tất cả nhóm khách</option>
              <option value="single_friendly">Cá nhân</option>
              <option value="couple_friendly">Nhóm bạn / cặp đôi</option>
              <option value="family_friendly">Gia đình</option>
            </select>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-[#7A6A58]">{filteredWorkshops.length} workshop phù hợp</p>
            <button type="button" onClick={() => { setQuery(''); setAudience('all'); setType('all'); setPriceRange('all'); setDateRange('all'); }} className="h-11 rounded-full border border-[#716942]/40 px-5 font-semibold text-[#716942] hover:bg-[#716942] hover:text-white transition-colors">
              Xóa lọc
            </button>
          </div>
        </div>

        <div className="mt-14 grid gap-7 lg:grid-cols-3">
          {filteredWorkshops.map((workshop) => (
            <article key={workshop.id} className="workshop-card overflow-hidden rounded-lg bg-white shadow-[0_14px_36px_rgba(119,115,170,0.12)]">
              <Link to={`/workshop/${workshop.id}`}>
                <div className="relative">
                  <AssetImage src={workshop.image} alt={workshop.name} className="h-[240px]" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#C96B37] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
                    <Flame className="h-3.5 w-3.5" />
                  {workshop.slots.available <= 4 ? 'Sắp hết slot' : workshop.workshopType === 'combo' ? 'Đi cùng nhau' : 'Gợi ý từ studio'}
                  </span>
                </div>
              </Link>
              <div className="p-6">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#EFE7E1] px-3 py-1 text-xs font-bold text-[#7A6A45]">{audienceLabels[workshop.audience] ?? 'Cá nhân'}</span>
                  <span className="rounded-full bg-[#F4E4D8] px-3 py-1 text-xs font-bold text-[#7A3E2D]">{typeLabels[workshop.workshopType] ?? 'Workshop'}</span>
                </div>
                <Link to={`/workshop/${workshop.id}`} className="text-xl font-bold text-black hover:text-[#716942]">{workshop.name}</Link>
                <p className="mt-2 min-h-[54px] text-sm leading-6 text-[#6A6A6A]">{workshop.description}</p>
                <div className="mt-4 grid gap-2 text-sm text-[#6A6A6A]">
                  <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{workshop.fullDate}</span>
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{workshop.time}</span>
                  <span className="flex items-center gap-2"><Users className="h-4 w-4" />{workshop.package} · còn {workshop.slots.available}/{workshop.slots.total} slot</span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <p className="text-2xl font-bold text-[#643A2A]">{workshop.price.toLocaleString('vi-VN')}đ</p>
                  <div className="flex gap-2">
                    <Link to={`/workshop/${workshop.id}`} className="rounded-full border border-[#716942] px-4 py-2 text-sm font-bold text-[#716942] hover:bg-[#EFE2D6]">Chi tiết</Link>
                    <Link to={`/booking/${workshop.id}`} className="rounded-full bg-[#716942] px-5 py-2 text-sm font-bold text-white hover:opacity-85">Đặt chỗ</Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-20 lg:px-20">
        <h2 className="mb-6 text-4xl font-bold">Không gian workshop</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[workshopImages.hero, workshopImages.largePot, workshopImages.artisanBw].map((src, index) => (
            <AssetImage key={src} src={src} alt={`Không gian workshop ${index + 1}`} className="h-64 rounded-lg" />
          ))}
        </div>
      </section>
    </div>
  );
}

export { fallbackWorkshops, mapWorkshop };
