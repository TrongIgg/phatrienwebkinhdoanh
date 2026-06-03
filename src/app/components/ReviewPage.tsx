import { useEffect, useState, type FormEvent } from 'react';
import { MessageSquare, Star, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { api, type ApiReview } from '../lib/api';
import { reviews as seedReviews } from './DesignPrimitives';
import {
  CUSTOMER_SESSION_EVENT,
  readCustomerSession,
  saveReviewNotification,
} from '../lib/customerExperience';

type ReviewTarget = 'product' | 'workshop';

type ViewReview = {
  id: string;
  targetType: ReviewTarget;
  name: string;
  title?: string;
  comment: string;
  rating: number;
  date: string;
  helpful: number;
  studioReply?: string;
};

const fallbackReviews: ViewReview[] = seedReviews.map((review, index) => ({
  id: `seed-${index}`,
  targetType: index === 1 ? 'workshop' : 'product',
  name: review.name,
  title: review.title,
  comment: review.comment,
  rating: review.rating,
  date: review.date,
  helpful: 12 + index * 3,
  studioReply: index % 2 === 0
    ? 'Cảm ơn bạn đã ghé THỔ. Studio đã ghi nhận cảm nhận này để nghệ nhân chuẩn bị lớp và đóng gói tốt hơn trong các đơn sau.'
    : undefined,
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
    helpful: 0,
  };
}

export function ReviewPage() {
  const [reviews, setReviews] = useState<ViewReview[]>(fallbackReviews);
  const [draft, setDraft] = useState(() => {
    const customer = readCustomerSession();
    return { name: customer?.display_name ?? '', title: '', comment: '', rating: 5, targetType: 'product' as ReviewTarget };
  });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [helpedReviewIds, setHelpedReviewIds] = useState<string[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem('tho-helpful-review-ids') ?? '[]') as string[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    api.reviews()
      .then((rows) => setReviews(rows.map(mapReview)))
      .catch(() => setReviews(fallbackReviews));
  }, []);

  useEffect(() => {
    const syncCustomerName = () => {
      const customer = readCustomerSession();
      if (customer) {
        setDraft((current) => ({ ...current, name: current.name.trim() ? current.name : customer.display_name }));
      }
    };
    window.addEventListener(CUSTOMER_SESSION_EVENT, syncCustomerName);
    return () => window.removeEventListener(CUSTOMER_SESSION_EVENT, syncCustomerName);
  }, []);

  const submitReview = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.comment.trim()) {
      toast.error('Vui lòng nhập tên và phần cảm nhận.');
      return;
    }
    const commentTitle = draft.title.trim() || draft.comment.trim().slice(0, 46);

    const optimistic: ViewReview = {
      id: `local-${Date.now()}`,
      targetType: draft.targetType,
      name: draft.name,
      title: commentTitle,
      comment: draft.comment,
      rating: draft.rating,
      date: new Date().toLocaleDateString('vi-VN'),
      helpful: 0,
    };

    setReviews((current) => [optimistic, ...current]);
    setDraft({ name: '', title: '', comment: '', rating: 5, targetType: 'product' });
    saveReviewNotification({
      id: `review-${Date.now()}`,
      customer: optimistic.name,
      title: optimistic.title || 'Cảm nhận mới',
      rating: optimistic.rating,
      targetType: optimistic.targetType,
      createdAt: new Date().toISOString(),
      status: optimistic.rating <= 3 ? 'low_rating' : 'new',
    });
    toast.success('Đã gửi cảm nhận của bạn.');
    window.setTimeout(() => document.getElementById('review-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

    try {
      await api.createReview({
        name: optimistic.name,
        title: optimistic.title || '',
        comment: optimistic.comment,
        rating: optimistic.rating,
      });
    } catch {
      // Prototype keeps the local review visible when the backend is offline.
    }
  };

  const addStudioReply = (reviewId: string) => {
    const trimmed = replyText.trim();
    if (!trimmed) {
      toast.error('Vui lòng nhập phản hồi.');
      return;
    }
    setReviews((current) => current.map((review) => (
      review.id === reviewId ? { ...review, studioReply: trimmed } : review
    )));
    setReplyText('');
    setReplyingTo(null);
    toast.success('Đã thêm phản hồi từ THỔ Studio.');
  };

  const markHelpful = (reviewId: string) => {
    if (helpedReviewIds.includes(reviewId)) {
      toast.info('Bạn đã đánh dấu hữu ích cho nhận xét này rồi.');
      return;
    }
    const nextHelped = [...helpedReviewIds, reviewId];
    setHelpedReviewIds(nextHelped);
    window.localStorage.setItem('tho-helpful-review-ids', JSON.stringify(nextHelped));
    setReviews((current) => current.map((review) => (
      review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review
    )));
  };

  return (
    <div className="min-h-screen bg-[#FBEEE5] text-[#361F17]">
      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-20">
        <h1 className="text-center text-[56px] font-bold leading-tight text-[#643A2A]">Cảm nhận từ khách hàng</h1>
        <p className="mx-auto mt-4 max-w-3xl text-center text-xl leading-8 text-[#3F3F35]">
          Những dòng ghi lại màu men, dáng cầm, lớp đóng gói và khoảnh khắc chạm đất tại studio.
        </p>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-6 pb-24 lg:grid-cols-[1fr_480px] lg:px-20">
        <div id="review-list" className="scroll-mt-32 grid gap-5 md:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className={`h-5 w-5 ${index < review.rating ? 'fill-[#716942] text-[#716942]' : 'text-[#C0AC8B]'}`} />
                  ))}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                  review.targetType === 'product' ? 'bg-[#EFE2D6] text-[#643A2A]' : 'bg-[#E8EAD8] text-[#59612E]'
                }`}>
                  {review.targetType === 'product' ? 'Sản phẩm' : 'Workshop'}
                </span>
              </div>
              {review.title && <h2 className="text-2xl font-bold">{review.title}</h2>}
              <p className="mt-3 leading-7 text-[#6A5D52]">“{review.comment}”</p>
              <p className="mt-6 font-bold">{review.name}</p>
              <p className="text-sm text-[#8B765D]">{review.date}</p>

              {review.studioReply && (
                <div className="mt-5 rounded-lg border border-[#C0AC8B]/55 bg-white/70 p-4">
                  <div className="mb-2 flex items-center gap-2 font-bold text-[#716942]">
                    <MessageSquare className="h-4 w-4" />
                    Phản hồi từ THỔ Studio
                  </div>
                  <p className="text-sm leading-6 text-[#5F5045]">{review.studioReply}</p>
                </div>
              )}

              {replyingTo === review.id ? (
                <div className="mt-5 rounded-lg border border-[#C0AC8B] bg-white p-3">
                  <textarea
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    className="min-h-[86px] w-full rounded-md border border-[#EFD8C7] p-3 outline-none focus:ring-2 focus:ring-[#716942]/25"
                    placeholder="Nhập phản hồi của studio..."
                  />
                  <div className="mt-3 flex gap-3">
                    <button type="button" onClick={() => addStudioReply(review.id)} className="rounded-full bg-[#716942] px-5 py-2 text-sm font-bold text-white">Gửi phản hồi</button>
                    <button type="button" onClick={() => { setReplyingTo(null); setReplyText(''); }} className="rounded-full border border-[#716942] px-5 py-2 text-sm font-bold text-[#716942]">Hủy</button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => markHelpful(review.id)} className="inline-flex items-center gap-2 rounded-full border border-[#C0AC8B] px-4 py-2 text-sm font-bold text-[#716942] hover:bg-[#EFE2D6]">
                    <ThumbsUp className="h-4 w-4" />
                    {helpedReviewIds.includes(review.id) ? 'Đã hữu ích' : 'Hữu ích'} ({review.helpful})
                  </button>
                  <button type="button" onClick={() => setReplyingTo(review.id)} className="inline-flex items-center gap-2 rounded-full border border-[#C0AC8B] px-4 py-2 text-sm font-bold text-[#716942] hover:bg-[#EFE2D6]">
                    <MessageSquare className="h-4 w-4" />
                    Trả lời
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>

        <form id="review-form" onSubmit={submitReview} className="sticky top-32 scroll-mt-32 rounded-lg border-2 border-[#EFD8C7] bg-[#FFF1E8] p-7">
          <h2 className="text-[30px] font-bold text-[#2B211D]">Viết đánh giá</h2>
          <p className="mt-2 text-[#6A5D52]">
            Bạn có thể gửi cảm nhận nhanh, không cần tạo tài khoản. Với đơn đã mua, mã tracking giúp studio đối chiếu khi cần chăm sóc sâu hơn.
          </p>

          <div className="mt-5">
            <span className="mb-2 block font-bold">Loại đánh giá <span className="text-red-600">*</span></span>
            <div className="grid grid-cols-2 gap-3">
              {(['product', 'workshop'] as ReviewTarget[]).map((target) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setDraft({ ...draft, targetType: target })}
                  className={`rounded-full border px-4 py-3 font-bold ${
                    draft.targetType === target ? 'border-[#716942] bg-[#716942] text-white' : 'border-[#C0AC8B] bg-white text-[#716942]'
                  }`}
                >
                  {target === 'product' ? 'Sản phẩm' : 'Workshop'}
                </button>
              ))}
            </div>
          </div>

          <Field label="Tên của bạn" required value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} placeholder="Nguyễn Văn A" />
          <Field label="Tiêu đề ngắn (không bắt buộc)" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value })} placeholder="Ví dụ: Không gian rất ấm" />

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
            <span className="mb-2 block font-bold">Cảm nhận của bạn <span className="text-red-600">*</span></span>
            <textarea
              required
              value={draft.comment}
              onChange={(event) => setDraft({ ...draft, comment: event.target.value })}
              className="min-h-[140px] w-full rounded-lg border border-[#C0AC8B] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#716942]/30"
              placeholder={draft.targetType === 'product' ? 'Bạn thấy sản phẩm, men gốm, đóng gói như thế nào?' : 'Bạn thấy không gian, nghệ nhân, trải nghiệm làm gốm ra sao?'}
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
