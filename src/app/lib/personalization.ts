export type BehaviorTag =
  | 'gifting'
  | 'first_timer'
  | 'returning_maker'
  | 'evening_learner'
  | 'duo'
  | 'family'
  | 'premium'
  | 'color_lover'
  | 'minimalist'
  | 'natural';

export type ChatbotAnswers = {
  stylePreference?: string;
  experienceLevel?: string;
  purpose?: string;
  customRequest?: string;
  recommendedWorkshopId?: string;
};

export type SavedChatbotSession = ChatbotAnswers & {
  sessionId: string;
  createdAt: string;
  behaviorTags: BehaviorTag[];
};

export const CHATBOT_SESSION_KEY = 'tho-workshop-chatbot-session';
export const BEHAVIOR_TAGS_KEY = 'tho-behavior-tags';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readBehaviorTags(): BehaviorTag[] {
  if (!canUseStorage()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(BEHAVIOR_TAGS_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function mergeBehaviorTags(tags: BehaviorTag[]) {
  if (!canUseStorage()) return [];
  const next = Array.from(new Set([...readBehaviorTags(), ...tags]));
  window.localStorage.setItem(BEHAVIOR_TAGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('tho-behavior-tags-updated', { detail: next }));
  return next;
}

export function readChatbotSession(): SavedChatbotSession | null {
  if (!canUseStorage()) return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CHATBOT_SESSION_KEY) ?? 'null');
    return parsed?.sessionId ? parsed : null;
  } catch {
    return null;
  }
}

export function saveChatbotSession(session: SavedChatbotSession) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CHATBOT_SESSION_KEY, JSON.stringify(session));
  mergeBehaviorTags(session.behaviorTags);
}

export function behaviorTagsFromAnswers(answers: ChatbotAnswers): BehaviorTag[] {
  const tags = new Set<BehaviorTag>();

  if (answers.purpose === 'gift') tags.add('gifting');
  if (answers.purpose === 'relax') tags.add('evening_learner');
  if (answers.purpose === 'home') tags.add('natural');
  if (answers.experienceLevel === 'first_time') tags.add('first_timer');
  if (answers.experienceLevel === 'experienced') tags.add('returning_maker');
  if (answers.stylePreference === 'minimal') tags.add('minimalist');
  if (answers.stylePreference === 'colorful') tags.add('color_lover');
  if (answers.stylePreference === 'natural') tags.add('natural');

  const custom = (answers.customRequest ?? '').toLowerCase();
  if (custom.includes('cap doi') || custom.includes('cặp đôi') || custom.includes('doi')) tags.add('duo');
  if (custom.includes('gia dinh') || custom.includes('gia đình')) tags.add('family');
  if (custom.includes('premium') || custom.includes('rieng') || custom.includes('riêng')) tags.add('premium');

  return Array.from(tags);
}

export function recommendWorkshopId(answers: ChatbotAnswers): string {
  if (answers.experienceLevel === 'experienced' || answers.customRequest?.toLowerCase().includes('premium')) return '5';
  if (answers.purpose === 'gift') return '3';
  if (answers.purpose === 'home' || answers.stylePreference === 'natural') return '6';
  if (answers.stylePreference === 'colorful') return '2';
  if (answers.purpose === 'relax') return '10';
  return '1';
}

export function getHomeCampaign(tags: BehaviorTag[]) {
  if (tags.includes('gifting')) {
    return {
      eyebrow: 'Gift-ready',
      title: 'Quà tặng có dấu tay riêng',
      body: 'Gợi ý workshop đôi, hộp quà gốm và thiệp viết tay cho những dịp cần một món quà có câu chuyện.',
    };
  }

  if (tags.includes('evening_learner')) {
    return {
      eyebrow: 'Lịch tối nổi bật',
      title: 'Sau giờ làm, để đất sét kéo nhịp chậm lại',
      body: 'Ưu tiên các buổi tối và cuối tuần, vừa đủ thư giãn nhưng vẫn có thành phẩm để theo dõi.',
    };
  }

  if (tags.includes('premium')) {
    return {
      eyebrow: 'Private wheel',
      title: 'Bàn xoay riêng cho trải nghiệm sâu hơn',
      body: 'Các gói premium có nghệ nhân kèm sát, phù hợp người muốn dáng gốm chỉn chu và cá nhân hơn.',
    };
  }

  return {
    eyebrow: 'Studio pick',
    title: 'Bắt đầu bằng một buổi chạm đất thật đẹp',
    body: 'Workshop dễ vào cho người mới, sản phẩm có tracking sau buổi học và lựa chọn mua ngay cho góc nhà.',
  };
}
