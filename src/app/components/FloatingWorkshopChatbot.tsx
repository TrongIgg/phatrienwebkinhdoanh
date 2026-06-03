import { useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Bot, MessageCircle, Send, Settings, Sparkles, X } from 'lucide-react';
import { mergeBehaviorTags, type BehaviorTag } from '../lib/personalization';
import { AssetImage, products, workshops } from './DesignPrimitives';

type Recommendation = {
  kind: 'workshop' | 'product';
  title: string;
  description: string;
  image: string;
  price: number;
  to: string;
  badge: string;
};

type ChatMessage = {
  id: string;
  from: 'bot' | 'user';
  text: string;
  recommendation?: Recommendation;
};

const quickPrompts = [
  'Tôi mới làm gốm lần đầu',
  'Tôi muốn làm quà tặng',
  'Gợi ý sản phẩm trang trí',
  'Có lớp tối hoặc cuối tuần không?',
  'Tôi muốn workshop riêng tư hơn',
];

function inferTags(text: string): BehaviorTag[] {
  const normalized = text.toLowerCase();
  const tags = new Set<BehaviorTag>();
  if (normalized.includes('quà') || normalized.includes('tặng') || normalized.includes('gift')) tags.add('gifting');
  if (normalized.includes('lần đầu') || normalized.includes('mới')) tags.add('first_timer');
  if (normalized.includes('tối') || normalized.includes('cuối tuần') || normalized.includes('thư giãn')) tags.add('evening_learner');
  if (normalized.includes('riêng') || normalized.includes('premium') || normalized.includes('private')) tags.add('premium');
  if (normalized.includes('cặp') || normalized.includes('đôi')) tags.add('duo');
  return Array.from(tags);
}

function findWorkshop(type: 'first' | 'gift' | 'evening' | 'premium'): Recommendation {
  const workshop =
    type === 'gift'
      ? workshops.find((item) => item.id === '3')
      : type === 'premium'
        ? workshops.find((item) => item.id === '1')
        : workshops[0];

  const fallback = workshops[0];
  const picked = workshop ?? fallback;

  return {
    kind: 'workshop',
    title: picked.name,
    description: picked.description,
    image: picked.image,
    price: picked.price,
    to: `/booking/${picked.id}`,
    badge: type === 'gift' ? 'Gói hợp làm quà' : type === 'premium' ? 'Gói riêng tư' : 'Gói dễ bắt đầu',
  };
}

function findProduct(type: 'gift' | 'decor' | 'kit'): Recommendation {
  const product =
    type === 'kit'
      ? products.find((item) => item.id === 'p2')
      : type === 'gift'
        ? products.find((item) => item.id === 'p3')
        : products.find((item) => item.id === 'p1');

  const picked = product ?? products[0];

  return {
    kind: 'product',
    title: picked.detailName,
    description: picked.description,
    image: picked.image,
    price: picked.price,
    to: `/product/${picked.id}`,
    badge: type === 'gift' ? 'Sản phẩm hợp tặng' : type === 'kit' ? 'DIY tại nhà' : 'Decor nổi bật',
  };
}

function botReply(text: string): { text: string; recommendation?: Recommendation } {
  const normalized = text.toLowerCase();
  if (normalized.includes('sản phẩm') || normalized.includes('decor') || normalized.includes('trang trí') || normalized.includes('mua')) {
    const type = normalized.includes('kit') || normalized.includes('tự làm') ? 'kit' : normalized.includes('quà') || normalized.includes('tặng') ? 'gift' : 'decor';
    return {
      text: 'Mình chọn một sản phẩm đang hợp với nhu cầu của bạn. Bạn có thể mở chi tiết để xem ảnh, giá và thêm vào giỏ.',
      recommendation: findProduct(type),
    };
  }
  if (normalized.includes('quà') || normalized.includes('tặng')) {
    return {
      text: 'Mình sẽ ưu tiên workshop đôi, men màu ấm và gợi ý gift box. Đây là gói nên xem trước.',
      recommendation: findWorkshop('gift'),
    };
  }
  if (normalized.includes('tối') || normalized.includes('cuối tuần')) {
    return {
      text: 'Có nhé. Mình sẽ đẩy các lớp tối/cuối tuần lên trước để bạn dễ chọn lịch sau giờ làm.',
      recommendation: findWorkshop('evening'),
    };
  }
  if (normalized.includes('riêng') || normalized.includes('premium')) {
    return {
      text: 'Bạn hợp gói riêng tư/premium: ít người hơn, nghệ nhân kèm sát hơn, nhịp làm chậm hơn.',
      recommendation: findWorkshop('premium'),
    };
  }
  if (normalized.includes('lần đầu') || normalized.includes('mới')) {
    return {
      text: 'Nếu là lần đầu, mình gợi ý lớp nặn gốm cơ bản. Nhịp lớp chậm, có nghệ nhân hướng dẫn từng bước.',
      recommendation: findWorkshop('first'),
    };
  }
  return {
    text: 'Mình ghi nhận rồi. Bạn có thể hỏi về lịch, quà tặng, mức độ khó, sản phẩm decor, hoặc mở tư vấn đầy đủ để mình gợi ý sát hơn.',
  };
}

export function FloatingWorkshopChatbot() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'hello',
      from: 'bot',
      text: 'Xin chào, mình là THỔ Chatbot. Mình có thể gợi ý workshop, lịch học và lưu note để nghệ nhân chuẩn bị phù hợp hơn.',
    },
  ]);

  const unread = useMemo(() => (!open ? 1 : 0), [open]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const tags = inferTags(trimmed);
    if (tags.length) mergeBehaviorTags(tags);

    const reply = botReply(trimmed);

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, from: 'user', text: trimmed },
      { id: `bot-${Date.now()}`, from: 'bot', text: reply.text, recommendation: reply.recommendation },
    ]);
    setInput('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  const openAdvisor = () => {
    setOpen(false);
    if (location.pathname === '/') {
      document.getElementById('workshop-advisor')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    navigate('/#workshop-advisor');
  };

  return (
    <div className="fixed bottom-6 right-5 z-[80] flex flex-col items-end gap-4 sm:right-7">
      {open && (
        <section className="floating-chat-panel w-[calc(100vw-32px)] max-w-[450px] overflow-hidden rounded-[28px] border border-[#C0AC8B]/70 bg-[#FFF8F2] text-[#361F17] shadow-[0_28px_90px_rgba(28,16,10,0.32)]">
          <header className="flex items-center gap-3 bg-[#2F5F3D] px-5 py-4 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/18">
              <Bot className="h-5 w-5" />
            </span>
            <div className="mr-auto">
              <h2 className="text-lg font-bold leading-tight">THỔ Chatbot</h2>
              <p className="flex items-center gap-2 text-sm text-white/82">
                <span className="h-2 w-2 rounded-full bg-[#7FF09A]" />
                Hỗ trợ chọn workshop
              </p>
            </div>
            <button type="button" className="rounded-full p-2 text-white/80 hover:bg-white/12 hover:text-white" aria-label="Thiết lập chatbot">
              <Settings className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-white/80 hover:bg-white/12 hover:text-white" aria-label="Đóng chatbot">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="max-h-[330px] space-y-3 overflow-y-auto px-5 py-5">
            {messages.map((message) => (
              <div key={message.id} className={`flex flex-col ${message.from === 'user' ? 'items-end' : 'items-start'}`}>
                <p className={`max-w-[82%] rounded-2xl px-4 py-3 text-[15px] font-medium leading-6 ${message.from === 'user' ? 'rounded-br-sm bg-[#361F17] text-white' : 'rounded-bl-sm border border-[#EFD8C7] bg-white text-[#4B3B31]'}`}>
                  {message.text}
                </p>
                {message.recommendation && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate(message.recommendation?.to ?? '/workshop');
                    }}
                    className="mt-3 block max-w-[82%] overflow-hidden rounded-2xl border border-[#EFD8C7] bg-white text-left shadow-[0_12px_28px_rgba(54,31,23,0.08)]"
                  >
                    <AssetImage src={message.recommendation.image} alt={message.recommendation.title} className="h-28 rounded-t-2xl" />
                    <span className="block p-4">
                      <span className="mb-2 inline-flex rounded-full bg-[#EFE2D6] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#643A2A]">
                        {message.recommendation.badge}
                      </span>
                      <span className="block text-base font-bold text-[#361F17]">{message.recommendation.title}</span>
                      <span className="mt-1 block text-sm leading-5 text-[#6A5D52]">{message.recommendation.description}</span>
                      <span className="mt-3 block font-bold text-[#C96B37]">
                        {message.recommendation.price.toLocaleString('vi-VN')}đ · Xem ngay
                      </span>
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-[#EFD8C7] bg-white/60 px-5 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-[#C0AC8B] bg-[#FFF8F2] px-4 py-2 text-sm font-semibold text-[#2F5F3D] hover:border-[#2F5F3D]"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={submit} className="flex items-center gap-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="h-12 min-w-0 flex-1 rounded-full border border-[#D8C1AE] bg-[#FFF8F2] px-5 outline-none focus:ring-2 focus:ring-[#2F5F3D]/20"
                placeholder="Nhập câu hỏi..."
              />
              <button type="submit" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2F5F3D] text-white hover:bg-[#244D31]" aria-label="Gửi câu hỏi">
                <Send className="h-5 w-5" />
              </button>
            </form>
            <button type="button" onClick={openAdvisor} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#C96B37]">
              <Sparkles className="h-4 w-4" />
              Mở tư vấn 4 câu đầy đủ
            </button>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="floating-chat-button relative flex h-16 w-16 items-center justify-center rounded-full bg-[#2F5F3D] text-white shadow-[0_18px_48px_rgba(47,95,61,0.38)] hover:bg-[#244D31]"
        aria-label={open ? 'Đóng chatbot' : 'Mở chatbot'}
      >
        {open ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
        {unread > 0 && <span className="absolute right-1 top-1 h-4 w-4 rounded-full border-2 border-white bg-[#C96B37]" />}
      </button>
    </div>
  );
}
