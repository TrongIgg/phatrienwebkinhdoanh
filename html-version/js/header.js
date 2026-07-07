/* ===== THỔ Studio - Header Logic ===== */

document.addEventListener('DOMContentLoaded', () => {
  /* ---- Mobile Menu Toggle ---- */
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileNav.style.display !== 'none';
      mobileNav.style.display = isOpen ? 'none' : 'flex';
      menuBtn.innerHTML = isOpen ? ICONS.menu : ICONS.x;
    });

    // Close mobile menu when clicking a link
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.style.display = 'none';
        menuBtn.innerHTML = ICONS.menu;
      });
    });
  }

  /* ---- Active Nav Highlighting ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.header-nav a, .mobile-nav a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkPage = href.split('/').pop();
    const isHome = (linkPage === 'index.html' || linkPage === '') && (currentPage === 'index.html' || currentPage === '');
    const isMatch = linkPage === currentPage;

    if (isHome || isMatch) {
      link.classList.add('active');
    }
  });

  /* ---- Cart Badge Update ---- */
  updateCartBadge();

  window.addEventListener(CART_CHANGED_EVENT, updateCartBadge);
  window.addEventListener('storage', updateCartBadge);

  /* ---- Global Floating Chatbot Injection ---- */
  const path = window.location.pathname.toLowerCase();
  if (!path.includes('cart.html') && !path.includes('checkout.html')) {
    injectGlobalChatbot();
  }
});

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;

  const count = getTotalCartCount();
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function injectGlobalChatbot() {
  if (document.getElementById('global-chatbot-root')) return;

  const root = document.createElement('div');
  root.id = 'global-chatbot-root';
  root.className = 'floating-chatbot-container';
  root.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:10000; font-family:system-ui, sans-serif;';

  root.innerHTML = `
    <!-- Chat Bubble Toggle Button -->
    <button onclick="toggleFloatingChat()" class="chat-bubble-btn" style="position:relative; width:60px; height:60px; border-radius:50%; background:#2D5A43; border:none; color:#fff; font-size:26px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 6px 20px rgba(45,90,67,0.3); transition:all 0.3s; padding:0;">
      💬
      <!-- Orange Notification Dot -->
      <span style="position:absolute; top:2px; right:2px; width:14px; height:14px; background:#DC2626; border:2px solid #fff; border-radius:50%;"></span>
    </button>

    <!-- Chat Expandable Window -->
    <div id="floating-chat-window" style="display:none; position:absolute; bottom:80px; right:0; width:360px; height:480px; border-radius:18px; border:2px solid #EFD8C7; background:#FFF8F2; box-shadow:0 12px 36px rgba(54,31,23,0.15); flex-direction:column; overflow:hidden;">
      <!-- Header -->
      <div style="background:#3B2118; color:#fff; padding:16px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="font-size:24px;">🏺</div>
          <div>
            <h3 style="font-size:16px; font-weight:700; margin:0; line-height:1.2; color:#fff;">Trợ lý THỔ Studio</h3>
            <p style="font-size:11px; color:rgba(255,255,255,0.75); margin:2px 0 0;">Luôn trực tuyến</p>
          </div>
        </div>
        <button onclick="toggleFloatingChat()" style="background:none; border:none; color:#fff; font-size:20px; cursor:pointer; padding:0; line-height:1;">×</button>
      </div>

      <!-- Chat Messages Body -->
      <div id="chat-messages-body" style="flex:1; padding:16px; overflow-y:auto; display:flex; flex-direction:column; gap:12px;">
        <div style="background:#EFE2D6; color:#361F17; border-radius:12px; padding:10px 14px; font-size:13px; max-width:85%; align-self:start; line-height:1.5; margin:0;">
          Xin chào! Tôi có thể giúp gì cho hành trình trải nghiệm gốm của bạn tại THỔ?
        </div>
        <div style="background:#EFE2D6; color:#361F17; border-radius:12px; padding:10px 14px; font-size:13px; max-width:85%; align-self:start; line-height:1.5; margin:0;">
          Dưới đây là một số câu hỏi gợi ý nhanh:
        </div>

        <!-- Suggestion Options -->
        <div style="display:grid; gap:8px;" id="chat-suggestions-grid">
          <button onclick="sendChatbotQuestion('Tôi muốn nặn cốc và đĩa làm quà tặng')" style="background:#fff; border:1px solid #C0AC8B; border-radius:8px; padding:8px 12px; font-size:12px; text-align:left; cursor:pointer; color:#643A2A; transition:all 0.2s;">🎁 Nên chọn sản phẩm nào làm quà tặng?</button>
          <button onclick="sendChatbotQuestion('Đăng ký lớp học cho nhóm 2 người')" style="background:#fff; border:1px solid #C0AC8B; border-radius:8px; padding:8px 12px; font-size:12px; text-align:left; cursor:pointer; color:#643A2A; transition:all 0.2s;">👥 Tôi đi 2 người nên chọn gói workshop nào?</button>
          <button onclick="sendChatbotQuestion('Thời gian nung và hoàn thành gốm')" style="background:#fff; border:1px solid #C0AC8B; border-radius:8px; padding:8px 12px; font-size:12px; text-align:left; cursor:pointer; color:#643A2A; transition:all 0.2s;">🔥 Thời gian nung gốm mất bao lâu?</button>
          <button onclick="sendChatbotQuestion('Địa chỉ và giờ mở cửa studio')" style="background:#fff; border:1px solid #C0AC8B; border-radius:8px; padding:8px 12px; font-size:12px; text-align:left; cursor:pointer; color:#643A2A; transition:all 0.2s;">📍 Studio mở cửa lúc mấy giờ?</button>
        </div>
      </div>

      <!-- Chat Input Footer -->
      <div style="padding:12px 16px; background:#EFE2D6; border-top:1px solid #EFD8C7; display:flex; gap:8px; align-items:center;">
        <input id="chat-input-field" type="text" placeholder="Nhập tin nhắn..." style="flex:1; border-radius:9999px; border:1px solid #C0AC8B; padding:8px 16px; font-size:13px; outline:none;" onkeypress="checkChatSubmit(event)">
        <button onclick="submitChatMessage()" style="background:#716942; border:none; color:#fff; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:bold; font-size:16px;">➔</button>
      </div>
    </div>
  `;

  document.body.appendChild(root);

  // Add styles dynamically
  const style = document.createElement('style');
  style.innerHTML = `
    @media (max-width: 767px) {
      #floating-chat-window { width: 310px !important; right: -10px !important; }
    }
  `;
  document.head.appendChild(style);
}

window.toggleFloatingChat = function() {
  const win = document.getElementById('floating-chat-window');
  if (!win) return;
  const isHidden = win.style.display === 'none' || win.style.display === '';
  win.style.display = isHidden ? 'flex' : 'none';
};

window.checkChatSubmit = function(e) {
  if (e.key === 'Enter') window.submitChatMessage();
};

window.submitChatMessage = function() {
  const input = document.getElementById('chat-input-field');
  const text = input ? input.value.trim() : '';
  if (!text) return;

  window.appendChatMessage(text, 'user');
  input.value = '';

  setTimeout(() => {
    let reply = 'Cảm ơn câu hỏi của bạn. Nhân viên hỗ trợ THỔ Studio sẽ phản hồi bạn sớm nhất.';
    const lower = text.toLowerCase();
    if (lower.includes('quà tặng') || lower.includes('quà')) {
      reply = '🎁 Để chuẩn bị quà tặng ý nghĩa, bạn có thể tham gia workshop vẽ họa tiết/trang trí men lên phôi gốm có sẵn. Nếu mua hàng tại shop, hãy chọn tuỳ chọn "🎁 ĐÂY LÀ QUÀ TẶNG" để được trang bị hộp quà gỗ mộc kèm ruy-băng nhé!';
    } else if (lower.includes('2 người') || lower.includes('hai người')) {
      reply = '👥 Thích hợp nhất cho 2 người là gói Combo nặn gốm đôi giá 490k. Hai bạn sẽ được hướng dẫn tạo tác và tự thiết kế kiểu dáng.';
    } else if (lower.includes('nung')) {
      reply = '🔥 Sản phẩm của bạn sau khi xoay và tạo hình tại workshop cần phơi khô 3 ngày, nung mộc 900 độ C, sau đó tráng men và nung men ở 1200 độ C. Tổng cộng từ 7 đến 10 ngày là hoàn thành nhận hàng.';
    } else if (lower.includes('địa chỉ') || lower.includes('giờ')) {
      reply = '📍 THỔ Studio mở cửa đón bạn từ 8:30 đến 21:00 hàng ngày. Địa chỉ: Võ Văn Ngân, Thủ Đức, TP. HCM.';
    }
    window.appendChatMessage(reply, 'bot');
  }, 700);
};

window.sendChatbotQuestion = function(q) {
  window.appendChatMessage(q, 'user');
  const suggs = document.getElementById('chat-suggestions-grid');
  if (suggs) suggs.style.display = 'none';

  setTimeout(() => {
    let reply = 'Đang xử lý yêu cầu của bạn...';
    if (q.includes('quà tặng')) {
      reply = '🎁 Đối với quà tặng gốm, gói tráng men hoặc vẽ hoạ tiết rất được yêu thích. Ngoài ra khi mua sản phẩm tại web, bạn hãy tích vào hộp "🎁 ĐÂY LÀ QUÀ TẶNG" để studio đóng gói ruy-băng và viết thiệp tay miễn phí nhé!';
    } else if (q.includes('2 người')) {
      reply = '👥 Gói Combo 2 người của THỔ rất ưu đãi. Các bạn sẽ được tự chọn nặn bình hoa hoặc ly quai gốm, có trợ giảng riêng đồng hành suốt 2.5 tiếng.';
    } else if (q.includes('nung')) {
      reply = '🔥 Sản phẩm sau khi nặn cần phơi khô tự nhiên trong 3 ngày, nung mộc ở 900°C, sau đó tráng men rồi nung lần hai ở 1200°C. Tổng quy trình mất từ 7-10 ngày.';
    } else if (q.includes('địa chỉ')) {
      reply = '📍 Studio nằm ở Thủ Đức, hoạt động từ 8:30 - 21:00. Bạn nên đặt chỗ lịch học trước tại mục "Đặt lịch" để studio chuẩn bị sẵn phôi đất nặn nhé!';
    }
    window.appendChatMessage(reply, 'bot');
  }, 500);
};

window.appendChatMessage = function(text, sender) {
  const body = document.getElementById('chat-messages-body');
  if (!body) return;
  const msgDiv = document.createElement('div');
  
  if (sender === 'user') {
    msgDiv.style.cssText = 'background:#716942; color:#fff; border-radius:12px; padding:10px 14px; font-size:13px; max-width:85%; align-self:end; line-height:1.5; margin-left:auto; margin-bottom:4px;';
  } else {
    msgDiv.style.cssText = 'background:#EFE2D6; color:#361F17; border-radius:12px; padding:10px 14px; font-size:13px; max-width:85%; align-self:start; line-height:1.5; margin-bottom:4px;';
  }
  
  msgDiv.textContent = text;
  body.appendChild(msgDiv);
  body.scrollTop = body.scrollHeight;
};
