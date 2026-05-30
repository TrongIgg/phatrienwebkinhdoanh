import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { api, type ApiReview } from '../lib/api';
import { reviews as seedReviews } from './DesignPrimitives';

type ReviewTarget = 'product' | 'workshop';

type ViewReview = {
  id: string;
  targetType: ReviewTarget;
  name: string;
  title: string;
  comment: string;
  rating: number;
  date: string;
};

const fallbackReviews: ViewReview[] = seedReviews.map((review, index) => ({
  id: `seed-${index}`,
  targetType: index === 1 ? 'workshop' : 'product',
  name: review.name,
  title: review.title,
  comment: review.comment,
  rating: review.rating,
  date: review.date,
}));

function mapReview(review: ApiReview): ViewReview {
  return {
    id: String(review.review_id),
    targetType: review.target_type,
    name: review.name,
    title: review.title,
    comment: review.comment,
    rating: review.rating,
    date: review.created_at ? new Date(review.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
  };
}

export function ReviewPage() {
  const [reviews, setReviews] = useState<ViewReview[]>(fallbackReviews);
  const [tab, setTab] = useState<ReviewTarget>('product');
  const [draft, setDraft] = useState({ name: '', title: '', comment: '', rating: 5 });

  useEffect(() => {
    api.reviews()
      .then((rows) => setReviews(rows.map(mapReview)))
      .catch(() => setReviews(fallbackReviews));
  }, []);

  const visibleReviews = reviews.filter((review) => review.targetType === tab);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.title.trim() || !draft.comment.trim()) {
      toast.error('Vui lòng điền đủ các mục bắt buộc.');
      return;
    }

    const optimistic: ViewReview = {
      id: `local-${Date.now()}`,
      targetType: tab,
      name: draft.name,
      title: draft.title,
      comment: draft.comment,
      rating: draft.rating,
      date: new Date().toLocaleDateString('vi-VN'),
    };

    setReviews((current) => [optimistic, ...current]);
    setDraft({ name: '', title: '', comment: '', rating: 5 });
    toast.success('Đã gửi cảm nhận của bạn.');
    window.setTimeout(() => document.getElementById('review-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

    try {
      await api.createReview({
        name: optimistic.name,
        title: optimistic.title,
        comment: optimistic.comment,
        rating: optimistic.rating,
      });
    } catch {
      // Prototype keeps the local review visible when the backend is offline.
    }
  };

  return (
    <div className="min-h-screen bg-[#FBEEE5] text-[#361F17]">
      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-20">
        <h1 className="text-center text-[56px] font-bold leading-tight text-[#643A2A]">Cảm nhận từ khách hàng</h1>
        <p className="mx-auto mt-4 max-w-3xl text-center text-xl leading-8 text-[#3F3F35]">
          Những dòng ghi lại màu men, dáng cầm, lớp đóng gói và khoảnh khắc chạm đất tại studio.
        </p>

        <div className="mx-auto mt-8 flex max-w-md rounded-full border border-[#C0AC8B] bg-[#FFF8F2] p-1">
          {(['product', 'workshop'] as ReviewTarget[]).map((target) => (
            <button
              key={target}
              type="button"
              onClick={() => setTab(target)}
              className={`flex-1 rounded-full px-5 py-3 font-bold transition ${tab === target ? 'bg-[#716942] text-white' : 'text-[#716942]'}`}
            >
              {target === 'product' ? 'Sản phẩm' : 'Workshop'}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-6 pb-24 lg:grid-cols-[1fr_480px] lg:px-20">
        <div id="review-list" className="scroll-mt-32 grid gap-5 md:grid-cols-2">
          {visibleReviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-6">
              <div className="mb-5 flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className={`h-5 w-5 ${index < review.rating ? 'fill-[#716942] text-[#716942]' : 'text-[#C0AC8B]'}`} />
                ))}
              </div>
              <h2 className="text-2xl font-bold">{review.title}</h2>
              <p className="mt-3 leading-7 text-[#6A5D52]">“{review.comment}”</p>
              <p className="mt-6 font-bold">{review.name}</p>
              <p className="text-sm text-[#8B765D]">{review.date}</p>
            </article>
          ))}
        </div>

        <form id="review-form" onSubmit={submitReview} className="sticky top-32 scroll-mt-32 rounded-lg border-2 border-[#EFD8C7] bg-[#FFF1E8] p-7">
          <h2 className="text-[30px] font-bold text-[#2B211D]">Viết đánh giá {tab === 'product' ? 'sản phẩm' : 'workshop'}</h2>
          <p className="mt-2 text-[#6A5D52]">
            Bạn có thể gửi cảm nhận nhanh, không cần tạo tài khoản. Với đơn đã mua, mã tracking giúp studio đối chiếu khi cần chăm sóc sâu hơn.
          </p>

          <Field label="Tên của bạn" required value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} placeholder="Nguyễn Văn A" />
          <Field label="Tiêu đề" required value={draft.title} onChange={(value) => setDraft({ ...draft, title: value })} placeholder="Không gian rất ấm" />

          <div className="mt-5">
            <span className="mb-2 block font-bold">Số sao <span className="text-red-600">*</span></span>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1;
                return (
                  <button key={value} type="button" onClick={() => setDraft({ ...draft, rating: value })} aria-label={`${value} sao`}>
                    <Star className={`h-8 w-8 ${value <= draft.rating ? 'fill-[#716942] text-[#716942]' : 'text-[#C0AC8B]'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block font-bold">Nhận xét <span className="text-red-600">*</span></span>
            <textarea
              required
              value={draft.comment}
              onChange={(event) => setDraft({ ...draft, comment: event.target.value })}
              className="min-h-[140px] w-full rounded-lg border border-[#C0AC8B] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#716942]/30"
              placeholder={tab === 'product' ? 'Sản phẩm, đóng gói, men gốm...' : 'Không gian, nghệ nhân, lịch học...'}
            />
          </label>

          <button className="mt-6 w-full rounded-full bg-[#716942] py-4 font-bold text-white">Gửi đánh giá</button>
        </form>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) {
  return (
    <label className="mt-5 block">
      <span className="mb-2 block font-bold">{label} {required && <span className="text-red-600">*</span>}</span>
      <input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-lg border border-[#C0AC8B] bg-white px-4 outline-none focus:ring-2 focus:ring-[#716942]/30"
        placeholder={placeholder}
      />
    </label>
  );
}
