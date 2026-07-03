import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CheckCircle, MessageSquare, Star, ThumbsUp, XCircle } from 'lucide-react';
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
import { findLocalTrackingRecord } from '../lib/trackingStorage';

type ReviewTarget = 'product' | 'workshop';

// Derive review target type from code prefix
function detectTypeFromCode(code: string): ReviewTarget | null {
  const trimmed = code.trim().toUpperCase();
  if (trimmed.startsWith('ORD-')) return 'product';
  if (trimmed.startsWith('WS-') || trimmed.startsWith('CER-')) return 'workshop';
  return null;
}

export function ReviewPage() {
  const [searchParams] = useSearchParams();
  const urlTargetType = searchParams.get('targetType') as 'product' | 'workshop' | null;
  const urlCode = searchParams.get('code')?.trim() ?? '';

  const [reviews, setReviews] = useState<ViewReview[]>(() => readLocalReviews());
  const [customer, setCustomer] = useState<CustomerSession | null>(() => readCustomerSession());

  // Code lookup state
  const [codeInput, setCodeInput] = useState(urlCode);
  const [codeError, setCodeError] = useState('');
  const [codeLookupResult, setCodeLookupResult] = useState<{ label: string; customerName?: string } | null>(null);

  const [draft, setDraft] = useState(() => {
    const cust = readCustomerSession();
    const detectedType = urlTargetType ?? (urlCode ? detectTypeFromCode(urlCode) : null) ?? 'product';
    return {
      name: cust?.display_name ?? '',
      title: '',
      comment: '',
      rating: 5,
      targetType: detectedType as ReviewTarget,
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

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'product' | 'workshop'>('all');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  // Computed: locked type when code is entered
  const lockedType = detectTypeFromCode(codeInput);

  // Computed: filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchType = filterType === 'all' || r.targetType === filterType;
      const matchRating = filterRating === 'all' || r.rating === filterRating;
      return matchType && matchRating;
    });
  }, [reviews, filterType, filterRating]);

  // When codeInput changes, do lookup and lock the type
  useEffect(() => {
    if (!codeInput.trim()) {
      setCodeLookupResult(null);
      setCodeError('');
      return;
    }
    const detected = detectTypeFromCode(codeInput);
    if (detected) {
      // Auto-select locked type
      setDraft((d) => ({ ...d, targetType: detected }));
      // Lookup in mock/local records
      const record = findLocalTrackingRecord(codeInput.trim());
      if (record) {
        const customerName = record.customer_name ?? record.manager_name ?? '';
        setCodeLookupResult({ label: record.title, customerName });
        if (customerName) {
          setDraft((d) => ({ ...d, name: customerName }));
        }
        setCodeError('');
      } else {
        setCodeLookupResult(null);
        setCodeError('');
      }
    } else {
      setCodeLookupResult(null);
    }
  }, [codeInput]);

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

    // Validate: code is required
    if (!codeInput.trim()) {
      setCodeError('Vui lòng nhập mã đơn hàng (ORD-) hoặc mã vé workshop (WS-) để xác thực.');
      toast.error('Vui lòng nhập mã xác thực trước khi gửi đánh giá.');
      return;
    }
    const detected = detectTypeFromCode(codeInput);
    if (!detected) {
      setCodeError('Mã không hợp lệ. Vui lòng nhập đúng định dạng ORD-... hoặc WS-/CER-...');
      toast.error('Định dạng mã không đúng.');
      return;
    }

    if (!draft.comment.trim()) {
      toast.error('Vui lòng nhập cảm nhận của bạn.');
      return;
    }

    const finalName = draft.name.trim() || 'Khách hàng ẩn danh';
    const commentTitle = draft.title.trim() || draft.comment.trim().slice(0, 46);

    addLocalReview({
      targetType: draft.targetType,
      name: finalName,
      title: commentTitle,
      comment: draft.comment,
      rating: draft.rating,
      code: codeInput.trim().toUpperCase(),
    });

    setCodeInput('');
    setCodeLookupResult(null);
    setCodeError('');
    setDraft({ name: customer?.display_name ?? '', title: '', comment: '', rating: 5, targetType: 'product' });
    toast.success('Đã gửi cảm nhận của bạn. Cảm ơn bạn đã chia sẻ!');
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

      {/* Filter bar */}
      <section className="mx-auto max-w-[1440px] px-6 pb-6 lg:px-20">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#EFD8C7] bg-[#FFF8F2] px-4 py-3">
          <span className="text-sm font-bold text-[#716942]">Lọc:</span>
          <div className="flex flex-wrap gap-2">
            {([['all', 'Tất cả'], ['product', 'Sản phẩm'], ['workshop', 'Workshop']] as [string, string][]).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setFilterType(val as typeof filterType)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition ${filterType === val ? 'border-[#716942] bg-[#716942] text-white' : 'border-[#C0AC8B] bg-white text-[#716942] hover:bg-[#EFE2D6]'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            {(['all', 5, 4, 3, 2, 1] as (number | 'all')[]).map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFilterRating(star)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition ${filterRating === star ? 'border-[#716942] bg-[#716942] text-white' : 'border-[#C0AC8B] bg-white text-[#716942] hover:bg-[#EFE2D6]'}`}
              >
                {star === 'all' ? 'Tất cả ★' : `${star} ★`}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-6 pb-24 lg:grid-cols-[1fr_480px] lg:px-20">
        <div id="review-list" className="scroll-mt-32">
          {filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#EFD8C7] bg-[#FFF8F2] py-20 text-center">
              <Star className="mb-4 h-12 w-12 text-[#C0AC8B]" />
              <p className="text-lg font-bold text-[#716942]">Không có đánh giá phù hợp</p>
              <p className="mt-2 text-sm text-[#8B765D]">Thử thay đổi bộ lọc để xem thêm cảm nhận từ khách hàng.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredReviews.map((review) => (
                <article key={review.id} className="rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className={`h-5 w-5 ${index < review.rating ? 'fill-[#716942] text-[#716942]' : 'text-[#C0AC8B]'}`} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      {review.code && (
                        <span className="rounded-full bg-[#F7F1EB] px-2 py-0.5 text-[10px] font-mono text-[#8B765D] border border-[#E5D5C5]">
                          {review.code}
                        </span>
                      )}
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                        review.targetType === 'product' ? 'bg-[#EFE2D6] text-[#643A2A]' : 'bg-[#E8EAD8] text-[#59612E]'
                      }`}>
                        {review.targetType === 'product' ? 'Sản phẩm' : 'Workshop'}
                      </span>
                    </div>
                  </div>
                  {review.title && <h2 className="text-2xl font-bold">{review.title}</h2>}
                  <p className="mt-3 leading-7 text-[#6A5D52]">"{review.comment}"</p>
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
          )}
        </div>

        <form id="review-form" onSubmit={submitReview} className="sticky top-32 scroll-mt-32 rounded-lg border-2 border-[#EFD8C7] bg-[#FFF1E8] p-7">
          <h2 className="text-[30px] font-bold text-[#2B211D]">Viết đánh giá</h2>
          <p className="mt-2 text-sm text-[#6A5D52]">
            Bạn cần nhập mã đơn hàng hoặc mã vé workshop để xác thực trước khi gửi. Tên hiển thị là tuỳ chọn — để trống để gửi ẩn danh.
          </p>

          {/* Code input — top priority field */}
          <div className="mt-5">
            <label htmlFor="review-code" className="mb-2 block font-bold">
              Mã đơn hàng / Mã vé <span className="text-red-600">*</span>
            </label>
            <p className="mb-2 text-xs text-[#8B765D]">
              Nhập <strong className="text-[#643A2A]">ORD-</strong> (đơn hàng) hoặc <strong className="text-[#59612E]">WS-</strong> / <strong className="text-[#59612E]">CER-</strong> (vé workshop) để nhận thông báo và xác thực đánh giá.
            </p>
            <input
              id="review-code"
              type="text"
              value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value); setCodeError(''); }}
              className={`h-12 w-full rounded-lg border bg-white px-4 font-mono text-sm outline-none focus:ring-2 focus:ring-[#716942]/30 ${codeError ? 'border-red-400' : 'border-[#C0AC8B]'}`}
              placeholder="VD: ORD-66470040 hoặc WS-67157855"
            />
            {codeError && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                <XCircle className="h-3.5 w-3.5" /> {codeError}
              </p>
            )}
            {codeLookupResult && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#C0CCB5] bg-[#F4F6F0] px-3 py-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#59612E]" />
                <div className="text-xs text-[#59612E]">
                  <p className="font-bold">Đã xác thực đơn hàng</p>
                  <p className="mt-0.5 text-[#6A5D52]">{codeLookupResult.label}{codeLookupResult.customerName ? ` — ${codeLookupResult.customerName}` : ''}</p>
                </div>
              </div>
            )}
          </div>

          {/* Type selector — locked when code prefix detected */}
          <div className="mt-5">
            <span className="mb-2 block font-bold">
              Loại đánh giá <span className="text-red-600">*</span>
              {lockedType && (
                <span className="ml-2 text-xs font-normal text-[#8B765D]">(tự động theo mã)</span>
              )}
            </span>
            <div className="grid grid-cols-2 gap-3">
              {(['product', 'workshop'] as ReviewTarget[]).map((target) => (
                <button
                  key={target}
                  type="button"
                  disabled={!!lockedType}
                  onClick={() => !lockedType && setDraft({ ...draft, targetType: target })}
                  className={`rounded-full border px-4 py-3 font-bold transition ${
                    draft.targetType === target
                      ? 'border-[#716942] bg-[#716942] text-white'
                      : 'border-[#C0AC8B] bg-white text-[#716942]'
                  } ${lockedType ? 'cursor-not-allowed opacity-70' : 'hover:border-[#716942]'}`}
                >
                  {target === 'product' ? 'Sản phẩm' : 'Workshop'}
                </button>
              ))}
            </div>
          </div>

          {/* Name — optional */}
          <label className="mt-5 block">
            <span className="mb-2 block font-bold">Tên của bạn <span className="text-xs font-normal text-[#8B765D]">(để trống để ẩn danh)</span></span>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="h-12 w-full rounded-lg border border-[#C0AC8B] bg-white px-4 outline-none focus:ring-2 focus:ring-[#716942]/30"
              placeholder="Nguyễn Văn A (tùy chọn)"
            />
          </label>

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

          <button className="mt-6 w-full rounded-full bg-[#716942] py-4 font-bold text-white hover:bg-[#595232] transition-colors">Gửi đánh giá</button>
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
