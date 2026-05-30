import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AlertCircle, CalendarCheck, CheckCircle2, Circle, Clock3, Package, Search, Sparkles, UserRound } from 'lucide-react';
import { api, type ApiTracking } from '../lib/api';
import { findLocalTrackingRecord, readLocalTrackingRecords } from '../lib/trackingStorage';

type TrackingType = 'order' | 'workshop' | 'ceramic';

const trackingTypes: Array<{ id: TrackingType; label: string; helper: string; placeholder: string; icon: typeof Package }> = [
  { id: 'order', label: 'Đơn hàng', helper: 'Mã bắt đầu bằng ORD', placeholder: 'VD: ORD28052026', icon: Package },
  { id: 'workshop', label: 'Workshop', helper: 'Mã bắt đầu bằng WS', placeholder: 'VD: WS052826', icon: CalendarCheck },
  { id: 'ceramic', label: 'Tracking gốm', helper: 'Mã THO/CER sau workshop', placeholder: 'VD: THO-2024-0847', icon: Sparkles },
];

const fallbackTimeline = [
  { stage: 'forming', label: 'Đã tạo hình', state: 'done' },
  { stage: 'drying', label: 'Phơi khô', state: 'done' },
  { stage: 'bisque_firing', label: 'Nung sơ', state: 'current' },
  { stage: 'glazing', label: 'Tráng men', state: 'waiting' },
  { stage: 'ready', label: 'Sẵn sàng nhận', state: 'waiting' },
];

function inferType(code: string): TrackingType {
  const normalized = code.trim().toUpperCase();
  if (normalized.startsWith('WS')) return 'workshop';
  if (normalized.startsWith('ORD')) return 'order';
  return 'ceramic';
}

export function TrackingPage() {
  const [searchParams] = useSearchParams();
  const [trackingType, setTrackingType] = useState<TrackingType>('ceramic');
  const [trackingCode, setTrackingCode] = useState('');
  const [result, setResult] = useState<ApiTracking | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [recentRecords, setRecentRecords] = useState<ApiTracking[]>([]);
  const selectedType = trackingTypes.find((type) => type.id === trackingType) ?? trackingTypes[0];

  const lookupCode = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;

    setTrackingType(inferType(code));
    setSubmitted(true);
    setError('');

    const localRecord = findLocalTrackingRecord(code);
    if (localRecord) {
      setResult(localRecord);
      setTrackingType(localRecord.tracking_type);
      return;
    }

    try {
      const data = await api.tracking(code);
      setResult(data);
      setTrackingType(data.tracking_type);
    } catch {
      setResult(null);
      setError('Không tìm thấy mã tracking. Hãy kiểm tra lại tiền tố WS, ORD hoặc THO/CER.');
    }
  };

  useEffect(() => {
    const records = readLocalTrackingRecords();
    setRecentRecords(records);

    const code = searchParams.get('code');
    if (code) {
      setTrackingCode(code);
      lookupCode(code);
      return;
    }

    if (records.length > 0) {
      setTrackingCode(records[0].code);
      setResult(records[0]);
      setTrackingType(records[0].tracking_type);
      setSubmitted(true);
    }
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await lookupCode(trackingCode);
  };

  return (
    <div className="bg-[#f5f0eb]">
      <section className="border-b border-border bg-[#fbf8f4]">
        <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-8 lg:grid-cols-[360px_1fr]">
            <div className="motion-section">
              <p className="mb-2 text-sm text-primary">Tracking Center</p>
              <h1 className="mb-4 text-4xl text-foreground">Tra cứu trạng thái tại THỔ</h1>
              <p className="text-muted-foreground">
                Mã vừa thanh toán sẽ xuất hiện ngay tại đây. WS là workshop, ORD là đơn hàng, CER/THO là hành trình thành phẩm gốm.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="motion-section rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {trackingTypes.map((type) => {
                  const Icon = type.icon;
                  const active = trackingType === type.id;
                  return (
                    <button key={type.id} type="button" onClick={() => setTrackingType(type.id)} className={`min-h-[112px] rounded-lg border p-4 text-left transition-colors ${active ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-background hover:border-primary/50'}`}>
                      <Icon className="mb-3 h-5 w-5 text-primary" />
                      <span className="block text-sm text-foreground">{type.label}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{type.helper}</span>
                    </button>
                  );
                })}
              </div>
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
              {recentRecords.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {recentRecords.slice(0, 5).map((record) => (
                    <button
                      key={record.code}
                      type="button"
                      onClick={() => {
                        setTrackingCode(record.code);
                        setResult(record);
                        setTrackingType(record.tracking_type);
                        setSubmitted(true);
                        setError('');
                      }}
                      className="rounded-full border border-primary/30 px-3 py-1 text-xs text-primary transition hover:bg-primary hover:text-primary-foreground"
                    >
                      {record.code}
                    </button>
                  ))}
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
          {submitted && error && <div className="motion-section rounded-lg border border-border bg-card p-8 text-center text-destructive">{error}</div>}
          {submitted && !error && trackingType === 'ceramic' && <CeramicTrackingResult code={trackingCode} result={result} />}
          {submitted && !error && trackingType !== 'ceramic' && <SimpleTrackingResult type={trackingType} code={trackingCode} result={result} />}
        </div>
      </section>
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
            <div key={`${step.stage}-${index}`} className="grid grid-cols-[32px_1fr] gap-4">
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
        <InfoPanel icon={<UserRound className="h-4 w-4 text-primary" />} label="Phụ trách" value={result?.manager_name || 'Studio sẽ cập nhật nhân viên phụ trách'} />
        <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
          Hướng dẫn bảo quản sẽ mở sau trạng thái “đã nhận hàng”. Trước đó, trang chỉ giữ những thông tin thật sự cần cho hành trình sản xuất.
        </div>
      </aside>
    </div>
  );
}

function SimpleTrackingResult({ type, code, result }: { type: 'order' | 'workshop'; code: string; result: ApiTracking | null }) {
  const isOrder = type === 'order';
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
            <span className="w-fit rounded-full bg-secondary/20 px-3 py-1 text-sm text-secondary">{result?.status || (isOrder ? 'Đã thanh toán' : 'Đã xác nhận')}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <InfoPanel icon={<Clock3 className="h-4 w-4 text-primary" />} label={isOrder ? 'Trạng thái đơn' : 'Thời gian'} value={result?.message || (isOrder ? 'Đã gói · Đợi ĐVVC · Đang giao · Đã nhận · Review' : 'QR check-in đã gửi qua email/SMS')} />
            <InfoPanel icon={<Package className="h-4 w-4 text-primary" />} label={isOrder ? 'Nội dung' : 'Workshop'} value={result?.title || (isOrder ? 'Đơn hàng THỔ Studio' : 'Vé workshop')} />
            <InfoPanel icon={<AlertCircle className="h-4 w-4 text-primary" />} label={isOrder ? 'Timeline' : 'Check-in'} value={isOrder ? 'Đã thanh toán → Chờ đóng gói → Đợi ĐVVC → Đang giao → Đã nhận' : `${result?.participant_count ?? 1} người · ${result?.checkin_status ?? 'pending'}`} />
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

function InfoPanel({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</div>
      <p className="text-foreground">{value}</p>
    </div>
  );
}
