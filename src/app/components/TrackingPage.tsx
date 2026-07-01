import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Clock3,
  Download,
  Film,
  Heart,
  Package,
  Search,
  Share2,
  Sparkles,
  UserRound,
  Facebook,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, type ApiTracking } from '../lib/api';
import { findLocalTrackingRecord, readLocalTrackingRecords } from '../lib/trackingStorage';
import { AssetImage, productImages, workshopImages } from './DesignPrimitives';
import {
  readSavedMoments,
  readTrackingMedia,
  saveMoment,
  type SavedMoment,
  type TrackingMedia,
  readCustomerSession,
  saveCustomerSession,
  CUSTOMER_SESSION_EVENT,
  createMockCustomerSession,
  type CustomerSession,
  type SocialProvider,
} from '../lib/customerExperience';

type TrackingType = 'order' | 'workshop' | 'ceramic' | 'custom';

const trackingTypes: Array<{ id: TrackingType; label: string; helper: string; placeholder: string; icon: typeof Package }> = [
  { id: 'order', label: 'Đơn hàng', helper: 'Mã bắt đầu bằng ORD', placeholder: 'VD: ORD28052026', icon: Package },
  { id: 'workshop', label: 'Workshop', helper: 'Mã bắt đầu bằng WS', placeholder: 'VD: WS052826', icon: CalendarCheck },
  { id: 'ceramic', label: 'Tracking gốm', helper: 'Mã THO/CER sau workshop', placeholder: 'VD: THO-2024-0847', icon: Sparkles },
  { id: 'custom', label: 'Custom brief', helper: 'Mã bắt đầu bằng CUS', placeholder: 'VD: CUS-12345678', icon: Sparkles },
];

const fallbackTimeline = [
  { stage: 'forming', label: 'Đã tạo hình', state: 'done' },
  { stage: 'drying', label: 'Phơi khô', state: 'done' },
  { stage: 'bisque_firing', label: 'Nung sơ', state: 'current' },
  { stage: 'glazing', label: 'Tráng men', state: 'waiting' },
  { stage: 'ready', label: 'Sẵn sàng nhận', state: 'waiting' },
];

const ceramicStages = [
  { stage: 'workshop_done', label: 'Đã tham gia workshop', staff: 'Chị Linh', note: 'Khách đã check-in, chọn form và hoàn tất phần tạo dáng ban đầu.' },
  { stage: 'forming', label: 'Tạo hình', staff: 'Anh Quân', note: 'Thành phẩm đã được chỉnh mép và đánh dấu mã xưởng.' },
  { stage: 'drying', label: 'Phơi khô', staff: 'Chị Linh', note: 'Đất đang ổn định độ ẩm trước khi vào lò nung sơ.' },
  { stage: 'bisque_firing', label: 'Nung sơ', staff: 'Anh Quân', note: 'Lò nung sơ đang chạy, studio sẽ kiểm tra bề mặt sau khi nguội.' },
  { stage: 'glazing', label: 'Tráng men', staff: 'Chị Hạnh', note: 'Màu men được chọn theo ghi chú workshop và ảnh mẫu của khách.' },
  { stage: 'final_firing', label: 'Nung hoàn thiện', staff: 'Anh Quân', note: 'Lò men hoàn thiện cần nguội tự nhiên trước khi lấy sản phẩm.' },
  { stage: 'ready', label: 'Sẵn sàng nhận / giao hàng', staff: 'THỔ Studio', note: 'Studio sẽ nhắn lịch nhận hoặc giao hàng sau khi QC cuối cùng.' },
];

const stageAliases: Record<string, string> = {
  booking_paid: 'workshop_done',
  waiting_workshop: 'workshop_done',
  paid: 'workshop_done',
  bisque: 'bisque_firing',
  final: 'final_firing',
};

function getDemoTrackingMedia(code: string): TrackingMedia[] {
  const createdAt = new Date().toISOString();
  return [
    {
      id: `${code}-workshop`,
      tracking_code: code,
      media_type: 'image',
      stage: 'Workshop',
      title: 'Bàn xoay buổi workshop',
      description: 'Khoảnh khắc tạo dáng đầu tiên tại THỔ.',
      url: workshopImages.handsWarm,
      uploaded_by: 'Chị Linh',
      created_at: createdAt,
      is_new: true,
    },
    {
      id: `${code}-drying`,
      tracking_code: code,
      media_type: 'image',
      stage: 'Phơi khô',
      title: 'Sản phẩm sau khi ổn định dáng',
      description: 'Bề mặt đã se lại, chuẩn bị vào lò nung sơ.',
      url: productImages.crackleBowls,
      uploaded_by: 'Anh Quân',
      created_at: createdAt,
    },
    {
      id: `${code}-glazing`,
      tracking_code: code,
      media_type: 'image',
      stage: 'Tráng men',
      title: 'Thử lớp men đầu tiên',
      description: 'Men được chọn theo phong cách mộc và dịu màu.',
      url: workshopImages.detailBw,
      uploaded_by: 'Chị Hạnh',
      created_at: createdAt,
    },
    {
      id: `${code}-ready`,
      tracking_code: code,
      media_type: 'image',
      stage: 'Thành phẩm',
      title: 'Thành phẩm sau nung',
      description: 'QC cuối cùng trước khi đóng gói hoặc hẹn nhận.',
      url: productImages.tealVase,
      uploaded_by: 'THỔ Studio',
      created_at: createdAt,
    },
    {
      id: `${code}-vlog`,
      tracking_code: code,
      media_type: 'video',
      stage: 'Mini vlog',
      title: 'Mini vlog buổi workshop',
      description: 'Bàn xoay, vẽ men và kệ chờ nung trong một đoạn ngắn.',
      url: workshopImages.wheelBw,
      uploaded_by: 'THỔ Studio',
      created_at: createdAt,
      is_new: true,
    },
  ];
}

function inferType(code: string): TrackingType {
  const normalized = code.trim().toUpperCase();
  if (normalized.startsWith('WS')) return 'workshop';
  if (normalized.startsWith('ORD')) return 'order';
  if (normalized.startsWith('CUS')) return 'custom';
  return 'ceramic';
}

function buildCeramicTimeline(timeline: ApiTracking['timeline']) {
  const normalized = timeline.map((step) => ({
    ...step,
    stage: stageAliases[step.stage] ?? step.stage,
  }));
  const currentStage = normalized.find((step) => step.state === 'current')?.stage;
  const currentIndex = Math.max(0, ceramicStages.findIndex((step) => step.stage === currentStage));

  return ceramicStages.map((stage, index) => {
    const apiStep = normalized.find((step) => step.stage === stage.stage);
    const state = apiStep?.state ?? (index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'waiting');
    const day = 2 + index;
    return {
      ...stage,
      state,
      updatedAt: state === 'waiting' ? 'Đang chờ' : `0${Math.min(day, 9)}/06/2026`,
    };
  });
}

export type CustomCheckoutPayload = {
  cartItemId: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    custom: {
      shape: string;
      glaze: string;
      features: string[];
      engraving?: string;
      brief?: string;
      multiplier: number;
      basePrice: number;
      artisanLeadDays: number;
    };
  };
};

function CustomTrackingResult({
  result,
  onProceedToCheckout,
}: {
  result: ApiTracking;
  onProceedToCheckout: (payload: CustomCheckoutPayload) => void;
}) {
  const request = result.custom_request;

  if (!request) {
    return (
      <div className="motion-section rounded-lg border border-border bg-card p-8 text-center">
        <Sparkles className="mx-auto mb-3 h-10 w-10 text-primary" />
        <h2 className="mb-2 text-xl text-foreground">Brief custom chưa có dữ liệu</h2>
        <p className="text-muted-foreground">Mã này đã được ghi nhận nhưng chưa có phản hồi nghệ nhân trong bản demo.</p>
      </div>
    );
  }

  const cartItemId = `custom-${result.code}`;
  const handleCheckout = () => {
    if (!request.paymentReady) return;
    onProceedToCheckout({
      cartItemId,
      product: {
        id: cartItemId,
        name: `Mẫu custom ${request.shape} · ${request.glaze}`,
        price: request.estimatedPrice,
        image: productImages.tealVase,
        custom: {
          shape: request.shape,
          glaze: request.glaze,
          features: request.features,
          engraving: request.engraving,
          brief: request.brief,
          multiplier: request.multiplier,
          basePrice: request.basePrice,
          artisanLeadDays: request.artisanLeadDays,
        },
      },
    });
  };

  return (
    <div className="motion-section grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{result.code}</span>
            <span className="rounded-full bg-[#F4E4D8] px-2 py-1 text-[#643A2A]">{result.status}</span>
          </div>
          <h2 className="text-3xl text-foreground">{result.title}</h2>
          <p className="mt-3 leading-7 text-muted-foreground">{result.message}</p>
          <div className="mt-5 rounded-lg border border-[#C96B37]/25 bg-[#FFF8F2] p-5">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Phản hồi nghệ nhân</p>
            <p className="mt-3 leading-7 text-[#6E4E3F]">{request.artisanFeedback}</p>
            <p className="mt-3 text-sm font-bold text-[#C96B37]">
              {request.artisanName} sẽ nhận brief chính thức sau {request.artisanLeadDays} ngày kể từ khi khách xác nhận thanh toán.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-5 text-lg font-semibold text-foreground">Tiến độ brief custom</h3>
          {result.timeline.map((step, index) => (
            <div key={`${step.stage}-${index}`} className={`tracking-step grid grid-cols-[32px_1fr] gap-4 rounded-lg px-2 ${step.state === 'current' ? 'bg-primary/5 py-2' : ''}`}>
              <div className="flex flex-col items-center">
                <StepIcon state={step.state} />
                {index < result.timeline.length - 1 && <div className={`h-12 w-px ${step.state === 'waiting' ? 'bg-border' : 'bg-primary/40'}`} />}
              </div>
              <div className="pb-5">
                <p className={step.state === 'waiting' ? 'text-muted-foreground' : 'font-semibold text-foreground'}>{step.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{step.stage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Brief khách gửi</p>
          <h3 className="mt-2 text-2xl text-foreground">{request.shape} · {request.glaze}</h3>
          <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            {request.features.length > 0 && <p>Chi tiết: {request.features.join(', ')}</p>}
            {request.engraving && <p>Ký hiệu: {request.engraving}</p>}
            {request.brief && <p>Yêu cầu: {request.brief}</p>}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Báo giá demo</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><span>Giá gốc</span><span>{request.basePrice.toLocaleString('vi-VN')}đ</span></div>
            <div className="flex justify-between"><span>Hệ số custom</span><span>x{request.multiplier.toFixed(2)}</span></div>
            <div className="border-t border-border pt-3 text-xl font-bold text-[#C96B37]">
              {request.estimatedPrice.toLocaleString('vi-VN')}đ
            </div>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={!request.paymentReady}
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            Thanh toán nếu vừa ý
          </button>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Thanh toán sẽ chuyển brief này thành đơn custom. Studio vẫn có thể liên hệ để xác nhận chi tiết cuối cùng trước khi làm.
          </p>
        </div>
      </aside>
    </div>
  );
}

export function TrackingPage({
  onCustomCheckout,
}: {
  onCustomCheckout: (payload: CustomCheckoutPayload) => void;
}) {
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code')?.trim() ?? '';
  const [trackingType, setTrackingType] = useState<TrackingType>('ceramic');
  const [trackingCode, setTrackingCode] = useState('');
  const [result, setResult] = useState<ApiTracking | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentRecords, setRecentRecords] = useState<ApiTracking[]>([]);
  const selectedType = trackingTypes.find((type) => type.id === trackingType) ?? trackingTypes[0];
  const resultType = (result?.tracking_type as TrackingType | undefined) ?? trackingType;

  // Cancellation state & customer session state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRecordToCancel, setSelectedRecordToCancel] = useState<ApiTracking | null>(null);
  const [customer, setCustomer] = useState<CustomerSession | null>(() => readCustomerSession());
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  useEffect(() => {
    const syncCustomer = () => setCustomer(readCustomerSession());
    window.addEventListener(CUSTOMER_SESSION_EVENT, syncCustomer);
    window.addEventListener('storage', syncCustomer);
    return () => {
      window.removeEventListener(CUSTOMER_SESSION_EVENT, syncCustomer);
      window.removeEventListener('storage', syncCustomer);
    };
  }, []);

  const lookupCode = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;

    setTrackingType(inferType(code));
    setSubmitted(true);
    setLoading(true);
    setError('');
    setResult(null);

    const localRecord = findLocalTrackingRecord(code);
    if (localRecord) {
      setResult(localRecord);
      setTrackingType(localRecord.tracking_type);
      setLoading(false);
      return;
    }

    try {
      const data = await api.tracking(code);
      setResult(data);
      setTrackingType(data.tracking_type);
    } catch {
      setResult(null);
      setError('Không tìm thấy mã tracking. Hãy kiểm tra lại tiền tố WS, ORD hoặc THO/CER.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const records = readLocalTrackingRecords();
    setRecentRecords(records);

    if (codeFromUrl) {
      setTrackingCode(codeFromUrl);
      lookupCode(codeFromUrl);
    } else {
      setTrackingCode('');
      setResult(null);
      setSubmitted(false);
      setLoading(false);
      setError('');
    }
  }, [codeFromUrl]);

  // Synchronize tracking storage updates
  useEffect(() => {
    const handleSync = () => {
      setRecentRecords(readLocalTrackingRecords());
      if (result) {
        const fresh = findLocalTrackingRecord(result.code);
        if (fresh) setResult(fresh);
      }
    };
    window.addEventListener('tho-tracking-records-changed', handleSync);
    return () => window.removeEventListener('tho-tracking-records-changed', handleSync);
  }, [result]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await lookupCode(trackingCode);
  };

  const handleCancelClick = (record: ApiTracking) => {
    setSelectedRecordToCancel(record);
    if (!customer) {
      setLoginPromptOpen(true);
      return;
    }
    setCancelModalOpen(true);
  };

  const handleConfirmLogin = (provider: SocialProvider) => {
    const session = createMockCustomerSession(provider);
    saveCustomerSession(session);
    setCustomer(session);
    setLoginPromptOpen(false);
    setCancelModalOpen(true);
    toast.success(`Đăng nhập thành công dưới tên ${session.display_name}!`);
  };

  const handleConfirmCancel = () => {
    if (!selectedRecordToCancel) return;
    const updated = cancelLocalTrackingRecord(selectedRecordToCancel.code);
    if (updated) {
      toast.success(`Đã hủy thành công ${updated.tracking_type === 'order' ? 'đơn hàng' : 'đặt chỗ'} ${updated.code}!`);
      if (result && result.code.toUpperCase() === updated.code.toUpperCase()) {
        setResult(updated);
      }
      setRecentRecords(readLocalTrackingRecords());
    } else {
      toast.error('Không thể thực hiện hủy đơn hàng lúc này.');
    }
    setCancelModalOpen(false);
    setSelectedRecordToCancel(null);
  };

  return (
    <div className="bg-[#f5f0eb]">
      <section className="border-b border-border bg-[#fbf8f4]">
        <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-8 lg:grid-cols-[360px_1fr]">
            <div className="motion-section">
              <p className="mb-2 text-sm text-primary">Tra cứu THỔ</p>
              <h1 className="mb-4 text-4xl text-foreground">Tra cứu trạng thái tại THỔ</h1>
              <p className="text-muted-foreground">
                Nhập mã đơn hàng, mã vé hoặc mã theo dõi thành phẩm. Hệ thống tự nhận diện ORD, WS, CER/THO.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="motion-section rounded-lg border border-border bg-card p-5 shadow-sm">
              <label htmlFor="tracking-code" className="mb-2 block text-sm text-foreground">Mã tra cứu</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="tracking-code"
                  value={trackingCode}
                  onChange={(event) => {
                    setTrackingCode(event.target.value);
                    if (event.target.value.trim()) setTrackingType(inferType(event.target.value));
                  }}
                  placeholder={selectedType.placeholder}
                  className="h-12 flex-1 rounded-lg border border-border bg-input-background px-4 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-primary-foreground transition-opacity hover:opacity-90">
                  <Search className="h-4 w-4" />
                  Tra cứu
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Gợi ý: `ORD-` cho đơn sản phẩm, `WS-` cho vé workshop, `CER/THO-` cho hành trình thành phẩm gốm.
              </p>

              {recentRecords.length > 0 && (
                <div className="mt-6 border-t border-border pt-4">
                  <p className="text-sm font-bold text-foreground mb-3">Lịch sử tra cứu của bạn</p>
                  <div className="grid gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {recentRecords.map((record) => {
                      const isRecordCancelled = record.status === 'cancelled';
                      return (
                        <div key={record.code} className="flex items-center justify-between bg-background p-2.5 rounded-lg border border-border">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-foreground">{record.code}</span>
                              <span className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${
                                isRecordCancelled 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {isRecordCancelled ? 'Đã hủy' : 'Hoạt động'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{record.title}</p>
                          </div>
                          {customer && (
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setTrackingCode(record.code);
                                  setResult(record);
                                  setTrackingType(record.tracking_type);
                                  setSubmitted(true);
                                  setLoading(false);
                                  setError('');
                                }}
                                className="text-xs bg-[#716942]/10 text-[#716942] hover:bg-[#716942]/20 font-bold px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Xem
                              </button>
                              {!isRecordCancelled && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelClick(record)}
                                  className="text-xs bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 font-bold px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Hủy
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {!submitted && (
            <div className="motion-section rounded-lg border border-border bg-card p-8 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-primary" />
              <h2 className="mb-2 text-xl text-foreground">Nhập mã để xem kết quả</h2>
              <p className="text-muted-foreground">Sau thanh toán, dùng mã trên hóa đơn hoặc chọn nhanh mã vừa tạo.</p>
            </div>
          )}
          {submitted && loading && (
            <div className="motion-section rounded-lg border border-border bg-card p-8 text-center">
              <Clock3 className="mx-auto mb-3 h-10 w-10 animate-pulse text-primary" />
              <h2 className="mb-2 text-xl text-foreground">Đang tra cứu mã {trackingCode}</h2>
              <p className="text-muted-foreground">THỔ đang kiểm tra trạng thái thật từ phiếu thanh toán hoặc xưởng.</p>
            </div>
          )}
          {submitted && !loading && error && <div className="motion-section rounded-lg border border-border bg-card p-8 text-center text-destructive">{error}</div>}
          {submitted && !loading && !error && result && resultType === 'custom' && <CustomTrackingResult result={result} onProceedToCheckout={onCustomCheckout} />}
          {submitted && !loading && !error && result && resultType === 'ceramic' && <CeramicTrackingExperience code={trackingCode} result={result} />}
          {submitted && !loading && !error && result && resultType !== 'ceramic' && resultType !== 'custom' && (
            <SimpleTrackingResult
              type={resultType as 'order' | 'workshop'}
              code={trackingCode}
              result={result}
              onCancelClick={handleCancelClick}
            />
          )}
        </div>
      </section>

      {cancelModalOpen && selectedRecordToCancel && (
        <CancelConfirmationModal
          record={selectedRecordToCancel}
          onClose={() => {
            setCancelModalOpen(false);
            setSelectedRecordToCancel(null);
          }}
          onConfirm={handleConfirmCancel}
        />
      )}

      {loginPromptOpen && selectedRecordToCancel && (
        <LoginPromptModal
          onClose={() => {
            setLoginPromptOpen(false);
            setSelectedRecordToCancel(null);
          }}
          onLogin={handleConfirmLogin}
        />
      )}
    </div>
  );
}

function CeramicTrackingExperience({ code, result }: { code: string; result: ApiTracking | null }) {
  const trackingCode = (result?.code || code || 'CER-DEMO').toUpperCase();
  const timeline = buildCeramicTimeline(result?.timeline?.length ? result.timeline : fallbackTimeline);
  const readyActive = timeline.some((step) => step.stage === 'ready' && step.state !== 'waiting');
  const isCeramicReady = timeline.some((step) => step.stage === 'ready' && step.state === 'done') || result?.status === 'ready' || result?.status === 'completed';
  const [media, setMedia] = useState<TrackingMedia[]>([]);
  const [savedMoments, setSavedMoments] = useState<SavedMoment[]>([]);

  useEffect(() => {
    const localMedia = readTrackingMedia().filter((item) => item.tracking_code.toUpperCase() === trackingCode);
    const demoMedia = getDemoTrackingMedia(trackingCode);
    setMedia([
      ...localMedia,
      ...demoMedia.filter((item) => !localMedia.some((local) => local.id === item.id)),
    ]);
    setSavedMoments(readSavedMoments());
  }, [trackingCode]);

  const saveTrackingMoment = (item: TrackingMedia) => {
    saveMoment(item);
    setSavedMoments(readSavedMoments());
    toast.success('Đã lưu vào bộ sưu tập khoảnh khắc.');
  };

  const vlog = media.find((item) => item.media_type === 'video');
  const photos = media.filter((item) => item.media_type === 'image');

  return (
    <div className="motion-section space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{trackingCode}</span>
              <span className="rounded-full bg-[#e8d5a6] px-2 py-1 text-[#7a6520]">{result?.status || 'bisque_firing'}</span>
              {isCeramicReady && (
                <Link
                  to={`/review?targetType=workshop&code=${trackingCode}`}
                  className="text-xs font-bold text-white bg-[#716942] hover:bg-[#5a5332] rounded-full px-3 py-1 transition-colors text-center inline-flex items-center gap-1 shadow-sm animate-fade-in"
                >
                  ✍️ Đánh giá trải nghiệm
                </Link>
              )}
              {media.some((item) => item.is_new) && <span className="rounded-full bg-[#F4E4D8] px-2 py-1 text-[#643A2A]">Staff vừa cập nhật ảnh mới</span>}
            </div>
            <h2 className="text-2xl text-foreground">{result?.title || 'Sản phẩm gốm của bạn'}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{result?.message || 'Studio đang cập nhật hành trình thành phẩm.'}</p>
            {result?.manager_name && <p className="mt-2 text-sm text-primary">Nhân viên phụ trách: {result.manager_name}</p>}
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-5 text-lg font-semibold text-foreground">Hành trình sản phẩm</h3>
            {timeline.map((step, index) => (
              <div key={`${step.stage}-${index}`} className={`tracking-step grid grid-cols-[32px_1fr] gap-4 rounded-lg px-2 ${step.state === 'current' ? 'bg-primary/5 py-2' : ''}`}>
                <div className="flex flex-col items-center">
                  <StepIcon state={step.state} />
                  {index < timeline.length - 1 && <div className={`h-16 w-px ${step.state === 'waiting' ? 'bg-border' : 'bg-primary/40'}`} />}
                </div>
                <div className="pb-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className={step.state === 'waiting' ? 'text-muted-foreground' : 'font-semibold text-foreground'}>{step.label}</p>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{step.updatedAt}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{step.note}</p>
                  <p className="mt-2 text-xs text-primary">Phụ trách: {step.staff} · {step.state}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <InfoPanel icon={<Package className="h-4 w-4 text-primary" />} label="Đơn hàng" value="Không có đơn sản phẩm vật lý cho mã tracking gốm này." muted />
          <InfoPanel icon={<CalendarCheck className="h-4 w-4 text-primary" />} label="Workshop" value="Mã này gắn với thành phẩm sau workshop, dùng để theo dõi xưởng." />
          <InfoPanel icon={<UserRound className="h-4 w-4 text-primary" />} label="Phụ trách" value={result?.manager_name || 'Studio sẽ cập nhật nhân viên phụ trách'} />
          <ReadyActions readyActive={readyActive} />
        </aside>
      </div>

      <MomentGallery media={photos} onSave={saveTrackingMoment} />
      {vlog && <MiniVlog media={vlog} onSave={saveTrackingMoment} />}
      <SavedMomentsPanel moments={savedMoments} />
    </div>
  );
}

function CeramicTrackingResult({ code, result }: { code: string; result: ApiTracking | null }) {
  const timeline = result?.timeline?.length ? result.timeline : fallbackTimeline;

  return (
    <div className="motion-section grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{result?.code || code}</span>
                <span className="rounded-full bg-[#e8d5a6] px-2 py-1 text-[#7a6520]">{result?.status || 'bisque_firing'}</span>
              </div>
              <h2 className="text-2xl text-foreground">{result?.title || 'Sản phẩm gốm của bạn'}</h2>
              <p className="text-sm text-muted-foreground">{result?.message || 'Studio đang cập nhật hành trình thành phẩm.'}</p>
              {result?.manager_name && <p className="mt-2 text-sm text-primary">Nhân viên phụ trách: {result.manager_name}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-5 text-sm text-muted-foreground">Hành trình sản phẩm</h3>
          {timeline.map((step, index) => (
            <div key={`${step.stage}-${index}`} className="tracking-step grid grid-cols-[32px_1fr] gap-4 rounded-lg px-2">
              <div className="flex flex-col items-center">
                <StepIcon state={step.state} />
                {index < timeline.length - 1 && <div className={`h-12 w-px ${step.state === 'waiting' ? 'bg-border' : 'bg-primary/40'}`} />}
              </div>
              <div className="pb-5">
                <p className={step.state === 'waiting' ? 'text-muted-foreground' : 'text-foreground'}>{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.stage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="space-y-6">
        <InfoPanel icon={<Package className="h-4 w-4 text-primary" />} label="Đơn hàng" value="Không có thông tin đơn sản phẩm cho mã tracking gốm này." muted />
        <InfoPanel icon={<CalendarCheck className="h-4 w-4 text-primary" />} label="Workshop" value="Không có thông tin vé workshop trong mã này." muted />
        <InfoPanel icon={<UserRound className="h-4 w-4 text-primary" />} label="Phụ trách" value={result?.manager_name || 'Studio sẽ cập nhật nhân viên phụ trách'} />
        <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
          Hướng dẫn bảo quản sẽ mở sau trạng thái “đã nhận hàng”. Trước đó, trang chỉ giữ những thông tin thật sự cần cho hành trình sản xuất.
        </div>
      </aside>
    </div>
  );
}

function MomentGallery({ media, onSave }: { media: TrackingMedia[]; onSave: (media: TrackingMedia) => void }) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Workshop moments</p>
          <h3 className="text-2xl text-foreground">Khoảnh khắc của bạn tại THỔ</h3>
        </div>
        <p className="text-sm text-muted-foreground">Ảnh có nhãn stage và người cập nhật từ xưởng.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {media.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-lg border border-border bg-background">
            <div className="relative">
              <AssetImage src={item.url} alt={item.title} className="aspect-[4/3]" />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#361F17]">{item.stage}</span>
              {item.is_new && <span className="absolute right-3 top-3 rounded-full bg-[#643A2A] px-3 py-1 text-xs font-bold text-white">Mới</span>}
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-foreground">{item.title}</h4>
              <p className="mt-1 min-h-[44px] text-sm leading-6 text-muted-foreground">{item.description}</p>
              <p className="mt-2 text-xs text-primary">Upload bởi {item.uploaded_by}</p>
              <button type="button" onClick={() => onSave(item)} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary px-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
                <Download className="h-4 w-4" />
                Lưu khoảnh khắc
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MiniVlog({ media, onSave }: { media: TrackingMedia; onSave: (media: TrackingMedia) => void }) {
  return (
    <section className="grid gap-5 rounded-lg border border-border bg-card p-6 lg:grid-cols-[360px_1fr]">
      <div className="relative overflow-hidden rounded-lg">
        <AssetImage src={media.url} alt={media.title} className="aspect-video h-full" />
        <div className="absolute inset-0 grid place-items-center bg-black/20">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-lg">
            <Film className="h-8 w-8" />
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Mini vlog</p>
        <h3 className="mt-2 text-3xl text-foreground">{media.title}</h3>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{media.description}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => toast.success('Đang mở mini vlog demo.')} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground">
            <Film className="h-4 w-4" />
            Xem mini vlog
          </button>
          <button type="button" onClick={() => onSave(media)} className="inline-flex h-11 items-center gap-2 rounded-lg border border-primary px-5 font-semibold text-primary">
            <Heart className="h-4 w-4" />
            Lưu khoảnh khắc
          </button>
          <button type="button" onClick={() => toast.success('Đã tạo toast chia sẻ demo.')} className="inline-flex h-11 items-center gap-2 rounded-lg border border-primary px-5 font-semibold text-primary">
            <Share2 className="h-4 w-4" />
            Chia sẻ với bạn bè
          </button>
        </div>
      </div>
    </section>
  );
}

function SavedMomentsPanel({ moments }: { moments: SavedMoment[] }) {
  if (moments.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-2xl text-foreground">Khoảnh khắc đã lưu</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {moments.slice(0, 4).map((item) => (
          <div key={item.id} className="grid grid-cols-[72px_1fr] gap-3 rounded-lg border border-border bg-background p-3">
            <AssetImage src={item.url} alt={item.title} className="h-[72px] w-[72px] rounded-md" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.stage}</p>
              <p className="mt-1 text-xs text-primary">Đã lưu</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReadyActions({ readyActive }: { readyActive: boolean }) {
  return (
    <div className={`rounded-lg border border-border bg-card p-5 ${readyActive ? '' : 'opacity-80'}`}>
      <p className="mb-3 font-semibold text-foreground">{readyActive ? 'Thành phẩm đã sẵn sàng' : 'Khi thành phẩm sẵn sàng'}</p>
      <div className="grid gap-3">
        <Link to="/review#review-form" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Viết cảm nhận về workshop
        </Link>
        <Link to="/product" className="inline-flex h-10 items-center justify-center rounded-lg border border-primary px-4 text-sm font-semibold text-primary">
          Xem sản phẩm tương tự
        </Link>
        <Link to="/workshop" className="inline-flex h-10 items-center justify-center rounded-lg border border-primary px-4 text-sm font-semibold text-primary">
          Đặt workshop tiếp theo
        </Link>
      </div>
    </div>
  );
}

export function getCancellationRefundDetails(record: ApiTracking): {
  canCancel: boolean;
  refundPercent: number;
  timeDiffHours: number;
  policyMessage: string;
  targetDateStr: string;
} {
  if (record.status === 'cancelled') {
    return { canCancel: false, refundPercent: 0, timeDiffHours: 0, policyMessage: 'Đơn hàng đã được hủy trước đó.', targetDateStr: '' };
  }

  const isOrder = record.tracking_type === 'order' || record.tracking_type === 'custom';

  if (isOrder) {
    const isShipped = record.status === 'delivering' || record.status === 'received';
    return {
      canCancel: !isShipped,
      refundPercent: isShipped ? 0 : 100,
      timeDiffHours: 48,
      policyMessage: isShipped 
        ? 'Đơn hàng vật lý đã được gửi đi và bàn giao cho đơn vị vận chuyển. Không thể hủy vào lúc này.' 
        : 'Đơn hàng chưa giao cho đơn vị vận chuyển, được phép hủy hoàn tiền 100%.',
      targetDateStr: 'Trước khi giao hàng'
    };
  }

  // Workshop ticket policy
  const wsItem = record.items?.find((item) => item.type === 'workshop');
  if (!wsItem || !wsItem.date) {
    return {
      canCancel: true,
      refundPercent: 100,
      timeDiffHours: 72,
      policyMessage: 'Hủy trước 48h: hoàn tiền 100%. Hủy trước 24h: hoàn tiền 50%.',
      targetDateStr: 'Chưa rõ thời gian'
    };
  }

  const dateMatch = wsItem.date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!dateMatch) {
    return {
      canCancel: true,
      refundPercent: 100,
      timeDiffHours: 72,
      policyMessage: 'Hủy trước 48h: hoàn tiền 100%. Hủy trước 24h: hoàn tiền 50%.',
      targetDateStr: wsItem.date
    };
  }

  const [_, dayStr, monthStr, yearStr] = dateMatch;
  let hour = 9;
  let minute = 0;
  if (wsItem.time) {
    const timeMatch = wsItem.time.match(/(\d{2}):(\d{2})/);
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      minute = parseInt(timeMatch[2], 10);
    }
  }

  const targetDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10), hour, minute);
  const now = new Date();
  const timeDiffMs = targetDate.getTime() - now.getTime();
  const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

  let refundPercent = 0;
  let policyMessage = '';

  if (timeDiffHours >= 48) {
    refundPercent = 100;
    policyMessage = `Thời gian từ hiện tại đến giờ diễn ra workshop còn ${Math.floor(timeDiffHours)} giờ (trên 48 giờ). Quý khách đủ điều kiện hủy đặt lịch và nhận hoàn tiền 100%.`;
  } else if (timeDiffHours >= 24) {
    refundPercent = 50;
    policyMessage = `Thời gian từ hiện tại đến giờ diễn ra workshop còn ${Math.floor(timeDiffHours)} giờ (từ 24 đến 48 giờ). Quý khách đủ điều kiện hủy đặt lịch và nhận hoàn tiền 50%.`;
  } else {
    refundPercent = 0;
    policyMessage = `Thời gian từ hiện tại đến giờ diễn ra workshop còn ${Math.max(0, Math.floor(timeDiffHours))} giờ (dưới 24 giờ). Theo chính sách của THỔ, không hỗ trợ hoàn tiền cho trường hợp này.`;
  }

  return {
    canCancel: timeDiffHours > 0,
    refundPercent,
    timeDiffHours,
    policyMessage,
    targetDateStr: `${wsItem.date} lúc ${wsItem.time || '9:00'}`
  };
}

export function LoginPromptModal({
  onClose,
  onLogin,
}: {
  onClose: () => void;
  onLogin: (provider: SocialProvider) => void;
}) {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/60 px-4 animate-fade-in">
      <div className="w-full max-w-[440px] rounded-2xl bg-[#FFF8F2] border border-[#E2CDBD] p-6 shadow-2xl text-center animate-scale-up">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF1E8] border border-[#EFD8C7] text-primary">
          <UserRound className="h-7 w-7 text-[#716942]" />
        </div>
        <h3 className="mt-4 text-2xl font-bold text-[#361F17]">
          🔐 Đăng nhập để hủy đơn
        </h3>
        <p className="mt-3 text-sm text-[#716942] leading-relaxed">
          Để bảo mật thông tin và tránh nhầm lẫn, vui lòng đăng nhập trước khi thực hiện hủy đơn hàng hoặc đặt chỗ tại THỔ Studio.
        </p>
        
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => onLogin('google')}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#E2CDBD] bg-white font-bold text-[#361F17] hover:bg-[#EFE2D6] transition-colors text-sm shadow-sm"
          >
            <Mail className="h-5 w-5 text-red-500" />
            Tiếp tục với Google
          </button>
          <button
            type="button"
            onClick={() => onLogin('facebook')}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#E2CDBD] bg-white font-bold text-[#361F17] hover:bg-[#EFE2D6] transition-colors text-sm shadow-sm"
          >
            <Facebook className="h-5 w-5 text-blue-600" />
            Tiếp tục với Facebook
          </button>
          <button
            type="button"
            onClick={() => onLogin('zalo')}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#E2CDBD] bg-white font-bold text-[#361F17] hover:bg-[#EFE2D6] transition-colors text-sm shadow-sm"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0068FF] text-[10px] font-black text-white">Z</span>
            Tiếp tục với Zalo
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 text-xs font-semibold text-muted-foreground underline hover:text-[#361F17] transition-colors block mx-auto"
        >
          Đóng, quay lại sau
        </button>
      </div>
    </div>
  );
}

export function CancelConfirmationModal({
  record,
  onClose,
  onConfirm,
}: {
  record: ApiTracking;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { refundPercent, policyMessage, targetDateStr } = getCancellationRefundDetails(record);
  const isOrder = record.tracking_type === 'order' || record.tracking_type === 'custom';

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/60 px-4">
      <div className="w-full max-w-[500px] rounded-2xl bg-[#FFF8F2] border border-[#E2CDBD] p-6 shadow-2xl">
        <h3 className="text-2xl font-bold text-[#361F17] flex items-center gap-2">
          ⚠️ Xác nhận hủy {isOrder ? 'đơn hàng' : 'đặt chỗ'}
        </h3>
        
        <div className="mt-4 rounded-xl bg-white p-4 border border-[#EFD8C7] space-y-3">
          <div className="flex justify-between text-sm text-[#361F17]">
            <span className="text-muted-foreground">Mã đơn/vé:</span>
            <span className="font-bold font-mono">{record.code}</span>
          </div>
          <div className="flex justify-between text-sm text-[#361F17]">
            <span className="text-muted-foreground">Thời điểm diễn ra:</span>
            <span className="font-bold">{targetDateStr}</span>
          </div>
          <div className="border-t border-[#EFD8C7] pt-3">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Chính sách hoàn tiền</p>
            <p className="text-sm mt-1 text-[#6E4E3F] leading-relaxed">{policyMessage}</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-[#FFF1E8] border border-[#EFD8C7] p-4 text-center">
          <p className="text-sm text-muted-foreground">Tỷ lệ hoàn tiền dự kiến:</p>
          <p className="text-3xl font-black text-[#C96B37] mt-1">{refundPercent}%</p>
          <p className="text-xs text-[#716942] mt-1">Số tiền hoàn sẽ được chuyển lại qua tài khoản thanh toán ban đầu của quý khách.</p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-lg border border-[#716942] text-[#716942] font-semibold hover:bg-[#EFE2D6] transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-12 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
          >
            Xác nhận hủy
          </button>
        </div>
      </div>
    </div>
  );
}

function SimpleTrackingResult({
  type,
  code,
  result,
  onCancelClick,
}: {
  type: 'order' | 'workshop';
  code: string;
  result: ApiTracking | null;
  onCancelClick?: (record: ApiTracking) => void;
}) {
  const isOrder = type === 'order';
  const timelineText = result?.timeline?.length
    ? result.timeline.map((step) => step.label).join(' → ')
    : isOrder
      ? 'Đã thanh toán → Chờ đóng gói → Đợi ĐVVC → Đang giao → Đã nhận'
      : 'Đã thanh toán → Đã gửi QR check-in → Chờ check-in tại studio';

  const isCancelled = result?.status === 'cancelled';

  return (
    <div className="motion-section rounded-lg border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          {isOrder ? <Package className="h-6 w-6 text-primary" /> : <CalendarCheck className="h-6 w-6 text-primary" />}
        </div>
        <div className="flex-1">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl text-foreground">{result?.title || (isOrder ? 'Thông tin đơn hàng' : 'Thông tin vé workshop')}</h2>
              <p className="text-sm text-muted-foreground">Mã tra cứu: {result?.code || code}</p>
              {result?.manager_name && <p className="mt-1 text-sm text-primary">Nhân viên phụ trách: {result.manager_name}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                isCancelled ? 'bg-red-100 text-red-700' : 'bg-secondary/20 text-secondary'
              }`}>
                {isCancelled ? 'Đã hủy đơn' : result?.status || (isOrder ? 'Đã thanh toán' : 'Đã xác nhận')}
              </span>
              {!isCancelled && result && (
                <div className="flex flex-wrap items-center gap-2 mt-1 justify-end">
                  {((isOrder && (result.status === 'delivered' || result.timeline?.some(step => step.stage === 'delivered' && step.state === 'done'))) ||
                    (!isOrder && (result.checkin_status === 'checked_in' || result.status === 'completed'))) && (
                    <Link
                      to={`/review?targetType=${isOrder ? 'product' : 'workshop'}&code=${result.code}`}
                      className="text-xs font-bold text-white bg-[#716942] hover:bg-[#5a5332] rounded-full px-4 py-1.5 transition-colors text-center inline-flex items-center gap-1 shadow-sm animate-fade-in"
                    >
                      ✍️ Đánh giá trải nghiệm
                    </Link>
                  )}
                  {onCancelClick && (
                    <button
                      type="button"
                      onClick={() => onCancelClick(result)}
                      className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full px-4 py-1.5 transition-colors"
                    >
                      {isOrder ? 'Hủy đơn hàng' : 'Hủy đặt chỗ'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>



          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {isOrder ? (
              <>
                <InfoPanel icon={<Package className="h-4 w-4 text-primary" />} label="Đơn sản phẩm" value={result?.message || 'Đơn hàng đã thanh toán và đang chờ studio đóng gói.'} />
                <InfoPanel icon={<CalendarCheck className="h-4 w-4 text-primary" />} label="Workshop" value="Không có vé workshop trong mã đơn sản phẩm này." muted />
                <InfoPanel icon={<Sparkles className="h-4 w-4 text-primary" />} label="Tracking gốm" value="Không có hành trình thành phẩm gốm cho mã đơn sản phẩm này." muted />
              </>
            ) : (
              <>
                <InfoPanel icon={<Package className="h-4 w-4 text-primary" />} label="Đơn sản phẩm" value="Không có đơn sản phẩm trong mã vé workshop này." muted />
                <InfoPanel icon={<CalendarCheck className="h-4 w-4 text-primary" />} label="Workshop" value={`${result?.participant_count ?? 1} người · ${result?.checkin_status ?? 'pending'}`} />
                <InfoPanel icon={<Sparkles className="h-4 w-4 text-primary" />} label="Tracking gốm" value="Chưa có hành trình thành phẩm. Mã CER sẽ được tạo sau workshop." muted />
              </>
            )}
          </div>
          {result?.items && result.items.length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Chi tiết sản phẩm & vé</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-background p-2.5 rounded-lg border border-border">
                    <img src={item.image || (item.type === 'workshop' ? workshopImages.handsWarm : productImages.tealVase)} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.type === 'workshop' ? `${item.date} · ${item.time} · ${item.tickets} vé` : `${item.price.toLocaleString('vi-VN')}đ · SL: ${item.quantity}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 rounded-lg border border-border bg-background p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4 text-primary" />
              Timeline đúng loại mã
            </div>
            <p className="text-foreground">{timelineText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIcon({ state }: { state: string }) {
  if (state === 'done') return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><CheckCircle2 className="h-4 w-4" /></span>;
  if (state === 'current') return <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-background"><Circle className="h-2 w-2 fill-primary text-primary" /></span>;
  return <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted"><Circle className="h-2 w-2 text-border" /></span>;
}

function InfoPanel({ icon, label, value, muted = false }: { icon: ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <div className={`rounded-lg border border-border p-4 ${muted ? 'bg-muted/30' : 'bg-background'}`}>
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</div>
      <p className={muted ? 'text-muted-foreground' : 'text-foreground'}>{value}</p>
    </div>
  );
}
