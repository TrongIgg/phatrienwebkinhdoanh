import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Check, Flame, Palette, RotateCcw, Sparkles } from 'lucide-react';
import { AssetImage, productImages, workshopImages } from './DesignPrimitives';

type ShapeId = 'plate' | 'vase' | 'cup' | 'bowl';
type GlazeId = 'cream' | 'clay' | 'green' | 'black';
type StageId = 'shape' | 'wheel' | 'bisque' | 'paint' | 'dry' | 'ready';

const shapes: Array<{ id: ShapeId; label: string; workshopId: string }> = [
  { id: 'plate', label: 'Đĩa', workshopId: '3' },
  { id: 'vase', label: 'Bình', workshopId: '5' },
  { id: 'cup', label: 'Ly', workshopId: '2' },
  { id: 'bowl', label: 'Bát', workshopId: '1' },
];

const glazes: Array<{ id: GlazeId; label: string; tone: string }> = [
  { id: 'cream', label: 'Trắng sữa', tone: '#F4E7D6' },
  { id: 'clay', label: 'Nâu đất', tone: '#9B5F3C' },
  { id: 'green', label: 'Xanh men', tone: '#6F8A79' },
  { id: 'black', label: 'Đen khói', tone: '#2A2826' },
];

const stages: Array<{ id: StageId; label: string; note: string; image: string }> = [
  { id: 'shape', label: 'Nặn hình', note: 'Chọn dáng ban đầu: đĩa, bình, ly hoặc bát.', image: workshopImages.handsWarm },
  { id: 'wheel', label: 'Lên bàn xoay & gọt', note: 'Canh miệng, chỉnh độ nghiêng và gọt chân sản phẩm.', image: workshopImages.wheelBw },
  { id: 'bisque', label: 'Nung sơ', note: 'Sản phẩm khô được nung lần đầu để cứng dáng.', image: workshopImages.largePot },
  { id: 'paint', label: 'Tô màu / tráng men', note: 'Chọn màu men và vẽ chi tiết trang trí.', image: workshopImages.detailBw },
  { id: 'dry', label: 'Phơi khô', note: 'Men cần ổn định trước khi vào lò hoàn thiện.', image: productImages.crackleBowls },
  { id: 'ready', label: 'Thành phẩm', note: 'Xem mẫu sau nung, sẵn sàng nhận hoặc giao.', image: productImages.tealVase },
];

const shapeClass: Record<ShapeId, string> = {
  plate: 'h-14 w-64 rounded-[999px]',
  vase: 'h-56 w-32 rounded-b-[54px] rounded-t-[78px]',
  cup: 'h-44 w-32 rounded-b-[38px] rounded-t-[20px]',
  bowl: 'h-28 w-56 rounded-b-[92px] rounded-t-[30px]',
};

export function WorkshopCustomizer() {
  const [shape, setShape] = useState<ShapeId>('plate');
  const [glaze, setGlaze] = useState<GlazeId>('cream');
  const [stageIndex, setStageIndex] = useState(0);

  const selectedShape = shapes.find((item) => item.id === shape) ?? shapes[0];
  const selectedGlaze = glazes.find((item) => item.id === glaze) ?? glazes[0];
  const currentStage = stages[stageIndex];
  const productName = useMemo(() => `${selectedShape.label} men ${selectedGlaze.label.toLowerCase()}`, [selectedGlaze.label, selectedShape.label]);

  const nextStage = () => setStageIndex((index) => Math.min(stages.length - 1, index + 1));
  const reset = () => setStageIndex(0);

  return (
    <div className="min-h-screen bg-[#FBEEE5] text-[#361F17]">
      <section className="mx-auto max-w-[1280px] px-5 py-10 lg:px-10">
        <Link to="/workshop" className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C0AC8B] px-4 py-2 text-sm font-bold text-[#716942] hover:bg-[#716942] hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Về trang Workshop
        </Link>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#716942]">Mini game custom workshop</p>
            <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight text-[#3B2118] sm:text-4xl">
              Click từng giai đoạn để xem mẫu làm gốm
            </h1>
            <p className="mt-4 max-w-xl leading-7 text-[#6A5D52]">
              Khách chọn dáng và màu men, sau đó bấm qua từng bước: nặn hình, lên bàn xoay, nung, tô màu, phơi khô và thành phẩm.
            </p>

            <div className="mt-7 rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-4">
              <div className="mb-3 flex items-center gap-2 font-bold">
                <Sparkles className="h-5 w-5 text-[#716942]" />
                Chọn hình dạng
              </div>
              <div className="flex flex-wrap gap-2">
                {shapes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setShape(item.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-bold ${shape === item.id ? 'border-[#716942] bg-[#716942] text-white' : 'border-[#C0AC8B] bg-white text-[#716942]'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-4">
              <div className="mb-3 flex items-center gap-2 font-bold">
                <Palette className="h-5 w-5 text-[#716942]" />
                Chọn màu men
              </div>
              <div className="flex flex-wrap gap-2">
                {glazes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGlaze(item.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${glaze === item.id ? 'border-[#716942] bg-[#716942] text-white' : 'border-[#C0AC8B] bg-white text-[#716942]'}`}
                  >
                    <span className="h-4 w-4 rounded-full border border-black/15" style={{ backgroundColor: item.tone }} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-4">
              <div className="mb-3 flex items-center gap-2 font-bold">
                <Flame className="h-5 w-5 text-[#C96B37]" />
                Giai đoạn mẫu
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {stages.map((stage, index) => (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setStageIndex(index)}
                    className={`rounded-lg border p-3 text-left text-sm transition ${stageIndex === index ? 'border-[#716942] bg-[#EFE2D6]' : 'border-[#E5CDBA] bg-white hover:border-[#716942]'}`}
                  >
                    <span className="font-bold">{index + 1}. {stage.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[#6A5D52]">{stage.note}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-5 shadow-sm">
            <div className="grid gap-5 md:grid-cols-[1fr_240px]">
              <div>
                <div className="relative overflow-hidden rounded-lg">
                  <AssetImage src={currentStage.image} alt={currentStage.label} className="aspect-[4/3]" loading="eager" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-[#361F17]">
                    Bước {stageIndex + 1}: {currentStage.label}
                  </span>
                </div>

                <div className="mt-5 flex min-h-[260px] items-center justify-center rounded-lg bg-[#EFE2D6] p-8">
                  <div
                    className={`relative shadow-[0_18px_36px_rgba(75,48,35,0.22)] transition-all duration-300 ${shapeClass[shape]}`}
                    style={{
                      background: `linear-gradient(145deg, ${selectedGlaze.tone}, #ffffff44)`,
                      border: '10px solid rgba(255,255,255,0.34)',
                      opacity: stageIndex < 2 ? 0.72 : 1,
                    }}
                  >
                    {stageIndex >= 3 && <div className="absolute inset-3 rounded-[inherit] bg-[repeating-linear-gradient(115deg,rgba(59,33,24,0.18)_0_2px,transparent_2px_13px)] opacity-60" />}
                    {stageIndex >= 5 && <div className="absolute inset-x-6 top-4 h-4 rounded-full bg-white/45" />}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-lg border border-[#E5CDBA] bg-white/70 p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#716942]">Mẫu của bạn</p>
                  <h2 className="mt-2 text-2xl font-bold text-[#3B2118]">{productName}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#6A5D52]">{currentStage.note}</p>
                  <div className="mt-5 space-y-2">
                    {stages.map((stage, index) => (
                      <div key={stage.id} className={`flex items-center gap-2 text-sm ${index <= stageIndex ? 'font-bold text-[#716942]' : 'text-[#9B8A7E]'}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${index <= stageIndex ? 'bg-[#716942]' : 'bg-[#D8C1AE]'}`} />
                        {stage.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {stageIndex < stages.length - 1 ? (
                    <button type="button" onClick={nextStage} className="inline-flex items-center justify-center rounded-full bg-[#3B2118] px-5 py-3 font-bold text-[#FFF8F2]">
                      Qua bước tiếp theo
                    </button>
                  ) : (
                    <Link to={`/booking/${selectedShape.workshopId}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3B2118] px-5 py-3 font-bold text-[#FFF8F2]">
                      <Check className="h-4 w-4" />
                      Đặt workshop này
                    </Link>
                  )}
                  <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#716942] px-5 py-3 font-bold text-[#716942]">
                    <RotateCcw className="h-4 w-4" />
                    Xem lại từ đầu
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
