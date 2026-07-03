import { reviews as seedReviews } from '../components/DesignPrimitives';
import { saveReviewNotification } from './customerExperience';

export type ReviewReply = {
  id: string;
  name: string;
  avatarUrl?: string;
  comment: string;
  date: string;
  isStaff?: boolean;
};

export type ViewReview = {
  id: string;
  targetType: 'product' | 'workshop';
  name: string;
  title?: string;
  comment: string;
  rating: number;
  date: string;
  helpful: number;
  code?: string;
  studioReply?: string; // For backwards compatibility
  replies?: ReviewReply[];
};

const LOCAL_REVIEWS_KEY = 'tho-persistent-reviews';

// Seed initial reviews with some demo data
const initialReviews: ViewReview[] = seedReviews.map((review, index) => {
  const targetType = index === 1 ? 'workshop' : 'product';
  const replies: ReviewReply[] = [];
  
  // Convert legacy studioReply to the replies array
  if (index % 2 === 0) {
    replies.push({
      id: `seed-reply-${index}`,
      name: 'THỔ Studio',
      comment: 'Cảm ơn bạn đã ghé THỔ. Studio đã ghi nhận cảm nhận này để nghệ nhân chuẩn bị lớp và đóng gói tốt hơn trong các đơn sau.',
      date: review.date,
      isStaff: true,
    });
  }

  // Add a demo customer reply thread to make it look active
  if (index === 0) {
    replies.push({
      id: `seed-reply-customer-${index}`,
      name: 'Minh Tuấn',
      comment: 'Ui lớp này vui lắm hả bạn? Mình đang tính đăng ký cho cả nhà đi cuối tuần.',
      date: review.date,
    });
    replies.push({
      id: `seed-reply-customer-2-${index}`,
      name: review.name,
      comment: 'Đúng rồi bạn ơi, nghệ nhân kèm cặp siêu kỹ tính mà vui lắm, nên đăng ký sớm nhé!',
      date: review.date,
    });
  }

  return {
    id: `seed-${index}`,
    targetType,
    name: review.name,
    title: review.title,
    comment: review.comment,
    rating: review.rating,
    date: review.date,
    helpful: 12 + index * 3,
    replies,
  };
});

export function readLocalReviews(): ViewReview[] {
  if (typeof window === 'undefined') return initialReviews;
  try {
    const stored = window.localStorage.getItem(LOCAL_REVIEWS_KEY);
    if (!stored) {
      // First time, write initial reviews to storage
      window.localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(initialReviews));
      return initialReviews;
    }
    const parsed = JSON.parse(stored) as ViewReview[];
    
    // Safety check: ensure each review has replies array
    return parsed.map(r => ({
      ...r,
      replies: r.replies || (r.studioReply ? [{
        id: `compat-reply-${r.id}`,
        name: 'THỔ Studio',
        comment: r.studioReply,
        date: r.date,
        isStaff: true
      }] : [])
    }));
  } catch {
    return initialReviews;
  }
}

export function saveLocalReviews(reviews: ViewReview[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new Event('tho-reviews-changed'));
  } catch (err) {
    console.error('Failed to save reviews locally:', err);
  }
}

export function isComplaint(comment: string, rating: number): boolean {
  if (rating <= 3) return true;
  const keywords = ['tệ', 'chán', 'hỏng', 'lỗi', 'kém', 'chậm', 'phàn nàn', 'không hài lòng', 'bể', 'nứt', 'vỡ', 'thất vọng'];
  const lowercaseComment = comment.toLowerCase();
  return keywords.some(kw => lowercaseComment.includes(kw));
}

export function addLocalReview(draft: Omit<ViewReview, 'id' | 'date' | 'helpful' | 'replies'>) {
  const reviews = readLocalReviews();
  const newReview: ViewReview = {
    ...draft,
    id: `review-${Date.now()}`,
    date: new Date().toLocaleDateString('vi-VN'),
    helpful: 0,
    replies: [],
  };

  const nextReviews = [newReview, ...reviews];
  saveLocalReviews(nextReviews);

  // Trigger CSKH notification for low rating or complaints
  const isCskhAlert = isComplaint(newReview.comment, newReview.rating);
  saveReviewNotification({
    id: `notif-${newReview.id}`,
    customer: newReview.name,
    title: newReview.title || (isCskhAlert ? 'Cần phản hồi khẩn cấp' : 'Cảm nhận mới'),
    rating: newReview.rating,
    targetType: newReview.targetType,
    createdAt: new Date().toISOString(),
    status: isCskhAlert ? 'low_rating' : 'new',
  });

  return newReview;
}

export function addReviewReply(reviewId: string, replyDraft: Omit<ReviewReply, 'id' | 'date'>) {
  const reviews = readLocalReviews();
  const index = reviews.findIndex(r => r.id === reviewId);
  if (index === -1) return null;

  const target = reviews[index];
  const replies = target.replies || [];
  
  const newReply: ReviewReply = {
    ...replyDraft,
    id: `reply-${Date.now()}`,
    date: new Date().toLocaleDateString('vi-VN'),
  };

  const updated: ViewReview = {
    ...target,
    replies: [...replies, newReply],
  };

  reviews[index] = updated;
  saveLocalReviews(reviews);
  return updated;
}
