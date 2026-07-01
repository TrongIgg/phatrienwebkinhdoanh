import { useEffect, useState, type FormEvent } from 'react';
import { MessageSquare, Star, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import {
  readLocalReviews,
  saveLocalReviews,
  addLocalReview,
  addReviewReply,
  type ViewReview,
  type ReviewReply,
} from '../lib/reviewStorage';
import {
  CUSTOMER_SESSION_EVENT,
  readCustomerSession,
  type CustomerSession,
} from '../lib/customerExperience';

type ReviewTarget = 'product' | 'workshop';

export function ReviewPage() {
  const [searchParams] = useSearchParams();
  const urlTargetType = searchParams.get('targetType') as 'product' | 'workshop' | null;
  const urlCode = searchParams.get('code')?.trim() ?? '';

  const [reviews, setReviews] = useState<ViewReview[]>(() => readLocalReviews());
  const [customer, setCustomer] = useState<CustomerSession | null>(() => readCustomerSession());
  const [draft, setDraft] = useState(() => {
    const cust = readCustomerSession();
    return {
      name: cust?.display_name ?? '',
      title: urlCode ? `Đánh giá cho mã ${urlCode}` : '',
      comment: '',
      rating: 5,
      targetType: urlTargetType ?? ('product' as const),
    };
  });
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyName, setReplyName] = useState(() => customer?.display_name ?? '');
  const [replyText, setReplyText] = useState('');
  
  const [helpedReviewIds, setHelpedReviewIds] = useState<string[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem('tho-helpful-review-ids') ?? '[]') as string[];
    } catch {
      return [];
    }
  });

  // Sync reviews from storage changes (e.g. from staff page replies)
  useEffect(() => {
    const syncReviews = () => setReviews(readLocalReviews());
    window.addEventListener('tho-reviews-changed', syncReviews);
    return () => window.removeEventListener('tho-reviews-changed', syncReviews);
  }, []);

  // Sync customer session
  useEffect(() => {
    const syncCustomer = () => {
      const cust = readCustomerSession();
      setCustomer(cust);
      if (cust) {
        setDraft((current) => ({
          ...current,
          name: current.name.trim() ? current.name : cust.display_name,
        }));
        setReplyName(cust.display_name);
      }
    };
    window.addEventListener(CUSTOMER_SESSION_EVENT, syncCustomer);
    return () => window.removeEventListener(CUSTOMER_SESSION_EVENT, syncCustomer);
  }, []);

  const submitReview = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.comment.trim()) {
      toast.error('Vui lòng nhập tên và phần cảm nhận.');
      return;
    }
    const commentTitle = draft.title.trim() || draft.comment.trim().slice(0, 46);

    addLocalReview({
      targetType: draft.targetType,
      name: draft.name,
      title: commentTitle,
      comment: draft.comment,
      rating: draft.rating,
    });

    setDraft({ name: customer?.display_name ?? '', title: '', comment: '', rating: 5, targetType: 'product' });
    toast.success('Đã gửi cảm nhận của bạn.');
    window.setTimeout(() => document.getElementById('review-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const submitReply = (reviewId: string) => {
    const name = replyName.trim() || (customer ? customer.display_name : 'Khách ẩn danh');
    const comment = replyText.trim();
    if (!comment) {
      toast.error('Vui lòng nhập nội dung phản hồi.');
      return;
    }
    
    const updated = addReviewReply(reviewId, {
      name,
      comment,
      avatarUrl: customer?.avatar_url,
    });

    if (updated) {
      setReviews(readLocalReviews());
      setReplyText('');
      setReplyingTo(null);
      toast.success('Đã gửi câu trả lời của bạn.');
    } else {
      toast.error('Không tìm thấy nhận xét để trả lời.');
    }
  };

  const markHelpful = (reviewId: string) => {
    if (helpedReviewIds.includes(reviewId)) {
      toast.info('Bạn đã đánh dấu hữu ích cho nhận xét này rồi.');
      return;
    }
    const nextHelped = [...helpedReviewIds, reviewId];
    setHelpedReviewIds(nextHelped);
    window.localStorage.setItem('tho-helpful-review-ids', JSON.stringify(nextHelped));
    
    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId) {
        return { ...review, helpful: review.helpful + 1 };
      }
      return review;
    });
    setReviews(updatedReviews);
    saveLocalReviews(updatedReviews);
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

              {/* Threaded replies */}
              {review.replies && review.replies.length > 0 && (
                <div className="mt-5 space-y-3 border-l-2 border-[#C0AC8B]/40 pl-4">
                  {review.replies.map((reply) => (
                    <div 
                      key={reply.id} 
                      className={`rounded-xl p-3 text-sm leading-relaxed ${
                        reply.isStaff 
                          ? 'border border-[#C0CCB5] bg-[#F4F6F0] shadow-sm' 
                          : 'border border-[#EFD8C7]/50 bg-white/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          {reply.avatarUrl ? (
                            <img src={reply.avatarUrl} alt={reply.name} className="h-5 w-5 rounded-full object-cover" />
                          ) : (
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${reply.isStaff ? 'bg-[#59612E]' : 'bg-[#716942]'}`}>
                              {reply.name[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className={`font-bold text-xs ${reply.isStaff ? 'text-[#59612E]' : 'text-[#361F17]'}`}>
                            {reply.name}
                          </span>
                          {reply.isStaff && (
                            <span className="rounded-full bg-[#E8EAD8] text-[#59612E] text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wide">
                              THỔ Studio
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-muted-foreground">{reply.date}</span>
                      </div>
                      <p className="text-xs text-[#5F5045] whitespace-pre-line">{reply.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {replyingTo === review.id ? (
                <div className="mt-5 rounded-lg border border-[#C0AC8B] bg-white p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    {customer ? (
                      <>
                        <img src={customer.avatar_url} alt={customer.display_name} className="h-5 w-5 rounded-full object-cover" />
                        <span className="text-xs text-[#716942]">Trả lời dưới tên <strong>{customer.display_name}</strong></span>
                      </>
                    ) : (
                      <div className="w-full">
                        <label className="block text-[10px] font-bold text-[#716942] mb-1">Tên của bạn *</label>
                        <input
                          type="text"
                          required
                          value={replyName}
                          onChange={(e) => setReplyName(e.target.value)}
                          placeholder="Ví dụ: Minh Tuấn"
                          className="h-8 w-full max-w-[180px] rounded border border-[#EFD8C7] bg-[#FFF8F2] px-2 text-xs outline-none focus:ring-1 focus:ring-[#716942]"
                        />
                      </div>
                    )}
                  </div>
                  <textarea
                    required
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    className="min-h-[86px] w-full rounded-md border border-[#EFD8C7] p-3 text-xs outline-none focus:ring-2 focus:ring-[#716942]/25"
                    placeholder="Nhập câu trả lời của bạn tại đây..."
                  />
                  <div className="flex gap-2 justify-end">
                    <button 
                      type="button" 
                      onClick={() => { setReplyingTo(null); setReplyText(''); }} 
                      className="rounded-full border border-[#716942] px-4 py-1 text-xs font-bold text-[#716942] hover:bg-[#EFE2D6]"
                    >
                      Hủy
                    </button>
                    <button 
                      type="button" 
                      onClick={() => submitReply(review.id)} 
                      className="rounded-full bg-[#716942] px-4 py-1 text-xs font-bold text-white hover:bg-[#595232]"
                    >
                      Gửi phản hồi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => markHelpful(review.id)} className="inline-flex items-center gap-2 rounded-full border border-[#C0AC8B] px-4 py-2 text-sm font-bold text-[#716942] hover:bg-[#EFE2D6]">
                    <ThumbsUp className="h-4 w-4" />
                    {helpedReviewIds.includes(review.id) ? 'Đã hữu ích' : 'Hữu ích'} ({review.helpful})
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setReplyingTo(review.id);
                      setReplyName(customer?.display_name ?? '');
                    }} 
                    className="inline-flex items-center gap-2 rounded-full border border-[#C0AC8B] px-4 py-2 text-sm font-bold text-[#716942] hover:bg-[#EFE2D6]"
                  >
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
          {urlCode && (
            <div className="my-3 rounded-lg bg-[#EFE2D6] px-3.5 py-2.5 border border-[#C0AC8B] text-xs text-[#716942] flex items-center justify-between shadow-sm animate-fade-in">
              <span>Đang viết đánh giá cho mã tra cứu <strong>{urlCode}</strong></span>
              <button 
                type="button" 
                onClick={() => {
                  setDraft(d => ({ ...d, title: '' }));
                  const newParams = new URLSearchParams(window.location.search);
                  newParams.delete('code');
                  window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
                }}
                className="underline font-bold text-[#361F17] hover:text-black ml-2 text-[10px]"
              >
                Hủy liên kết
              </button>
            </div>
          )}
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
