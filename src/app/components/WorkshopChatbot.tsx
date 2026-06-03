import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Bot, CheckCircle2, Flame, RotateCcw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import {
  behaviorTagsFromAnswers,
  readChatbotSession,
  recommendWorkshopId,
  saveChatbotSession,
  type ChatbotAnswers,
  type SavedChatbotSession,
} from '../lib/personalization';
import { AssetImage, workshops as homeWorkshops, workshopImages } from './DesignPrimitives';

type Question = {
  key: keyof ChatbotAnswers;
  prompt: string;
  options: Array<{ label: string; value: string; hint: string }>;
};

const questions: Question[] = [
  {
    key: 'stylePreference',
    prompt: 'Bạn muốn món gốm của mình có cảm giác như thế nào?',
    options: [
      { label: 'Tối giản', value: 'minimal', hint: 'Dáng gọn, men nhẹ, hợp bàn làm việc' },
      { label: 'Màu nổi bật', value: 'colorful', hint: 'Vẽ men, họa tiết và bảng màu cá tính' },
      { label: 'Tự nhiên', value: 'natural', hint: 'Đất mộc, vân tay, màu men ấm' },
      { label: 'Chưa biết', value: 'unknown', hint: 'Để nghệ nhân gợi ý tại lớp' },
    ],
  },
  {
    key: 'experienceLevel',
    prompt: 'Bạn đã từng làm gốm chưa?',
    options: [
      { label: 'Lần đầu', value: 'first_time', hint: 'Cần hướng dẫn chậm và rõ từng bước' },
      { label: 'Đã thử 1-2 lần', value: 'some', hint: 'Có thể làm dáng nâng cao hơn một chút' },
      { label: 'Có kinh nghiệm', value: 'experienced', hint: 'Phù hợp bàn xoay riêng hoặc premium' },
    ],
  },
  {
    key: 'purpose',
    prompt: 'Mục đích chính của buổi workshop là gì?',
    options: [
      { label: 'Cho bản thân', value: 'self', hint: 'Một món gốm mang dấu tay riêng' },
      { label: 'Làm quà tặng', value: 'gift', hint: 'Gợi ý cặp đôi, hộp quà và thiệp' },
      { label: 'Trang trí nhà', value: 'home', hint: 'Ưu tiên bình, chén trà, đồ decor' },
      { label: 'Thư giãn', value: 'relax', hint: 'Gợi ý buổi tối hoặc cuối tuần' },
    ],
  },
];

const optionLabels: Record<string, string> = {
  minimal: 'Tối giản, thanh lịch',
  colorful: 'Màu sắc, nổi bật',
  natural: 'Tự nhiên, thô mộc',
  unknown: 'Chưa biết',
  first_time: 'Lần đầu',
  some: 'Đã thử 1-2 lần',
  experienced: 'Có kinh nghiệm',
  self: 'Cho bản thân',
  gift: 'Làm quà tặng',
  home: 'Trang trí nhà',
  relax: 'Thư giãn / trải nghiệm',
};

function createSessionId() {
  return `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function WorkshopChatbot({ compact = false }: { compact?: boolean }) {
  const savedSession = readChatbotSession();
  const [answers, setAnswers] = useState<ChatbotAnswers>(() => savedSession ?? {});
  const [session, setSession] = useState<SavedChatbotSession | null>(savedSession);
  const [step, setStep] = useState(savedSession ? questions.length : 0);
  const [customRequest, setCustomRequest] = useState(savedSession?.customRequest ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const recommendationId = useMemo(() => {
    return session?.recommendedWorkshopId ?? recommendWorkshopId({ ...answers, customRequest });
  }, [answers, customRequest, session?.recommendedWorkshopId]);

  const recommendedWorkshop = homeWorkshops.find((item) => item.id === recommendationId) ?? homeWorkshops[0];
  const bookingTargetId = recommendedWorkshop?.id ?? '1';
  const isComplete = step >= questions.length;

  const chooseOption = (question: Question, value: string) => {
    const nextAnswers = { ...answers, [question.key]: value };
    setAnswers(nextAnswers);
    setStep((current) => current + 1);
  };

  const finish = async () => {
    const nextAnswers: ChatbotAnswers = {
      ...answers,
      customRequest: customRequest.trim(),
      recommendedWorkshopId: recommendWorkshopId({ ...answers, customRequest }),
    };
    const behaviorTags = behaviorTagsFromAnswers(nextAnswers);
    const sessionId = session?.sessionId ?? createSessionId();
    const nextSession: SavedChatbotSession = {
      ...nextAnswers,
      sessionId,
      createdAt: session?.createdAt ?? new Date().toISOString(),
      behaviorTags,
    };

    setIsSaving(true);
    try {
      await api.createChatbotSession({
        session_id: sessionId,
        style_preference: nextAnswers.stylePreference,
        experience_level: nextAnswers.experienceLevel,
        purpose: nextAnswers.purpose,
        custom_request: nextAnswers.customRequest,
        recommended_workshop_id: Number(nextAnswers.recommendedWorkshopId),
        behavior_tags: behaviorTags,
      });
    } catch {
      // Demo still works offline; localStorage is the source for UI personalization.
    } finally {
      saveChatbotSession(nextSession);
      setSession(nextSession);
      setAnswers(nextAnswers);
      setIsSaving(false);
      toast.success('Đã lưu gợi ý workshop và ghi chú cho staff');
    }
  };

  const reset = () => {
    setAnswers({});
    setSession(null);
    setStep(0);
    setCustomRequest('');
  };

  const currentQuestion = questions[step];

  return (
    <section className={`rounded-lg border border-[#C0AC8B]/70 bg-[#FFF8F2] shadow-[0_18px_46px_rgba(54,31,23,0.08)] ${compact ? 'p-5' : 'p-6 lg:p-8'}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#361F17] text-[#FBEEE5]">
            <Bot className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#716942]">Tư vấn workshop</p>
            <h2 className={`${compact ? 'text-2xl' : 'text-4xl'} font-bold leading-tight text-[#361F17]`}>
              Tìm buổi làm gốm hợp với câu chuyện của bạn
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#716942]/35 text-[#716942] hover:bg-[#716942] hover:text-white"
          aria-label="Làm lại tư vấn"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {!isComplete && currentQuestion && (
        <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
          <div>
            <p className="mb-4 text-xl font-semibold text-[#3F3F35]">{currentQuestion.prompt}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => chooseOption(currentQuestion, option.value)}
                  className="rounded-lg border border-[#C0AC8B] bg-white p-4 text-left hover:border-[#361F17] hover:shadow-[0_14px_30px_rgba(54,31,23,0.1)]"
                >
                  <span className="block text-lg font-bold text-[#361F17]">{option.label}</span>
                  <span className="mt-1 block text-sm leading-5 text-[#716942]">{option.hint}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-[#3F3F35] p-5 text-[#FBEEE5]">
            <Sparkles className="mb-4 h-8 w-8 text-[#C0AC8B]" />
            <p className="text-sm uppercase tracking-[0.18em] text-[#C0AC8B]">Đang hiểu bạn</p>
            <div className="mt-4 space-y-3 text-sm">
              {questions.slice(0, step).map((question) => (
                <div key={question.key} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#C0AC8B]" />
                  <span>{optionLabels[String(answers[question.key])]}</span>
                </div>
              ))}
              {step === 0 && <p className="leading-6 text-[#FBEEE5]/75">Chọn vài tín hiệu nhỏ, THỔ sẽ gợi ý workshop và lưu note để nghệ nhân chuẩn bị tốt hơn.</p>}
            </div>
          </div>
        </div>
      )}

      {isComplete && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <label className="block">
              <span className="mb-2 block text-lg font-bold text-[#361F17]">Bạn muốn làm sản phẩm cụ thể nào?</span>
              <textarea
                value={customRequest}
                onChange={(event) => setCustomRequest(event.target.value)}
                className="min-h-[104px] w-full rounded-lg border border-[#C0AC8B] bg-white p-4 outline-none focus:ring-2 focus:ring-[#716942]/25"
                placeholder="Ví dụ: một chiếc ly cho người yêu, bình hoa nhỏ để bàn, chén trà màu xanh rêu..."
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={finish}
                disabled={isSaving}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#361F17] px-6 font-bold text-white disabled:opacity-60"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu gợi ý'}
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link to={`/booking/${bookingTargetId}`} className="inline-flex h-12 items-center gap-2 rounded-full border border-[#716942] px-6 font-bold text-[#716942] hover:bg-[#716942] hover:text-white">
                Đặt chỗ ngay
              </Link>
            </div>
            <div className="mt-5 grid gap-2 text-sm text-[#716942] sm:grid-cols-3">
              {questions.map((question) => (
                <div key={question.key} className="rounded-lg bg-[#F4E4D8] p-3">
                  <span className="block font-bold text-[#361F17]">{question.prompt.split('?')[0]}</span>
                  <span>{optionLabels[String(answers[question.key])] ?? 'Chưa chọn'}</span>
                </div>
              ))}
            </div>
          </div>

          <article className="overflow-hidden rounded-lg bg-white shadow-[0_14px_34px_rgba(54,31,23,0.1)]">
            <div className="relative">
              <AssetImage src={recommendedWorkshop?.image ?? workshopImages.handsWarm} alt={recommendedWorkshop?.name ?? 'Workshop THỔ'} className="h-[210px]" />
              <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#C96B37] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
                <Flame className="h-3.5 w-3.5" />
                Hot match
              </span>
            </div>
            <div className="p-5">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#716942]">Gợi ý phù hợp</p>
              <h3 className="mt-2 text-2xl font-bold text-[#361F17]">{recommendedWorkshop?.name ?? 'Nặn gốm cơ bản'}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6A6A6A]">{recommendedWorkshop?.description ?? 'Workshop gốm thủ công tại THỔ Studio.'}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xl font-bold text-[#643A2A]">{(recommendedWorkshop?.price ?? 490000).toLocaleString('vi-VN')}đ</span>
                <span className="rounded-full bg-[#EFE7E1] px-3 py-1 text-xs font-bold text-[#716942]">
                  còn {recommendedWorkshop?.slots.available ?? 8}/{recommendedWorkshop?.slots.total ?? 12} slot
                </span>
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
