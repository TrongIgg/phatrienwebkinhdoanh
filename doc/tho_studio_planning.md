# 🎨 THỔ Studio - UI/UX Refactor Planning

## 📋 Tóm tắt thay đổi
Refactor flow quà tặng & workshop, giảm thiểu font diversity, làm rõ product showcase, tối ưu hóa payment/location UI.

---

## 🔴 Priority 1: Core Flow Changes

### 1.1 Xoá component Workshop đầu tiên
- **Current**: Có section "Quà tặng có dấu tay riêng" (GIFT-READY)
- **Action**: Remove this section từ main flow
- **Impact**: Simplify homepage, giảm cognitive load

### 1.2 Integrate Mini Game vào Workshop Packages
- **Current**: Mini game custom ở page riêng biệt
- **New Flow**:
  - Khi click vào 1 workshop package → hiển thị mini game preview inline
  - Mini game ở trong workshop card/modal
  - User có thể customize mẫu gốm ngay trong workshop selection
- **Files cần update**: Workshop component, Product card
- **Design**: Modal or collapsible section within workshop

### 1.3 Gift vs Regular Purchase Toggle
- **Current**: Separate "Thêm quà vào giỏ" button + "Thêm vào giỏ" button
- **New Flow**:
  - Thêm **checkbox/toggle** "Đây là quà tặng" ở product card
  - **If checked**:
    - Chuyển product thành "Gift item" → thêm vào gift cart tự động (NO button needed)
    - Hiển thị thêm fields: Ghi chú tặng, người nhận (nếu cần)
  - **If unchecked**:
    - Behavior bình thường: thêm vào regular cart
- **Files cần update**: Product card, Cart logic, Gift UI

---

## 🟡 Priority 2: Product Information & Description

### 2.1 Thêm Product Description Block dưới Workshop
- **Current**: Workshop section chỉ có text mô tả chung
- **New**: 
  - Thêm section "📝 Chi tiết sản phẩm workshop" sau phần workshop
  - Hiển thị:
    - Kích thước, chất liệu, công đoạn sản xuất
    - Sản phẩm tạo ra sau workshop (hình ảnh)
    - Bảo hành / care instructions
    - phù hợp với đối tượng nào
- **Position**: Directly below "Thủ tạo mẫu gốm trước khi chọn workshop" section
- **Content source**: Từ database product_details

### 2.2 Product Showcase Improvements
- **Current**: 4 ảnh grid (clay work, pottery wheels, etc.)
- **Enhancement**: 
  - Keep grid layout nhưng thêm **product outcome images**
  - Hiển thị: Finished products from past workshops
  - Optional: Carousel nếu có >4 ảnh

---

## 🟡 Priority 3: Font & Typography Consolidation

### 3.1 Audit & Reduce Font Variants
- **Current**: Multiple font sizes, weights ở main page
- **Action**: 
  - Define typography scale: H1, H2, H3, Body, Small
  - Apply consistently across all sections
  - Reduce to **maximum 3 font-weights** (regular, semibold, bold)
  - Hạn chế sử dụng nhiều phông chữ
- **Files**: CSS/Tailwind utilities, component styles
- **Quick wins**:
  - "GIFT-READY", "MINI GAME CUSTOM WORKSHOP" → use same label style 
  - Body text → single size + line-height

### 3.2 Heading Hierarchy
- Workshop title: H2 (currently inconsistent)
- Section titles: H3
- Labels: Small caps or uppercase small

---

## 🟢 Priority 4: Payment & Location UI Clarity

### 4.1 Payment Method Icons - Make More Prominent
- **Current**: Momo ảnh vague, VN Pay có thể không clear
- **Action**:
  - Replace/clarify Momo icon size (currently small) (in image logo)
  - Replace/clarify VN Pay image → use official VN Pay logo (in image logo)
  - Show payment methods side-by-side with clear labels (momo, bank)
- **Files**: Payment component, Assets folder

### 4.2 Tỉnh Thành (Province/District) Clarity
- **Current**: May be unclear to users
- **Action**:
  - Auto-populate based on user location (geo-detect)
  - Dropdown with **search/filter** instead of plain dropdown
  - Show "Giao hàng đến: [Province]" confirmation
  - Estimated delivery time based on location

### 4.3 Database Connection Image/Icon
- trong db, 02 seed phase 2 có ảnh sản phẩm, bổ sung ảnh liên quan đến db và làm nhiều sản phẩm hơn ở trang product

---

## 🔵 Priority 5: Product Quantity Display

### 5.1 Thicker/Bolder Quantity Indicator
- **Current**: "Số lượng về *" line may be hard to read
- **Action**:
  - Increase font size for quantity counter
  - Use **semi-bold weight**
  - Highlight "Con 6 slot khả dụng" in **accent color** (orange/brown)
  - Add **visual progress bar** (6/10 slots filled)
  - Add more product on page
- **Files**: Product card, Quantity component

### 5.2 Inventory Status
- Show remaining slots more visually (e.g., dots or bar)
- Add warning when <2 slots remain: "Chỉ còn 1 slot!"

---

## 🔵 Priority 6: Product cancel & Registration Flow

### 6.1. Hủy đơn hàng và quản lý mã người dùng
- **Current**: Không có chức năng hủy đơn hàng tự động và quản lý danh sách đơn hàng đã mua.
- **Action**:
  - **Nút hủy đơn hàng / Đặt chỗ**:
    - Hiển thị nút "Hủy đơn hàng" hoặc "Hủy đặt chỗ" trực tiếp tại trang Tracking khi tra cứu đơn hàng/vé.
    - Nút hủy cũng cần hiển thị trong danh sách mã đơn hàng của người dùng khi nhập xong/nhận tracking trước đó.
    - Làm nổi bật nút bằng màu nhấn mạnh (accent color).
    - Thêm modal confirm cảnh báo chính sách hoàn tiền tương ứng:
      - Hủy trước 48h: hoàn tiền 100%.
      - Hủy trước 24h: hoàn tiền 50%.
      - Hủy sau 24h hoặc trong ngày: hoàn tiền 0%.
  - **Tạo mã đăng ký/đăng nhập người dùng (Minh họa)**:
    - Trang/modal đăng nhập dựa trên Google, Facebook, Zalo minh họa.
    - **Sau khi đăng nhập**: Người dùng có thể xem danh sách các đơn hàng, vé workshop đã mua/từng tra cứu trước đó kèm mã tracker và trạng thái tương ứng. Có thể thực hiện hủy đơn trực tiếp từ danh sách này.
- **Files**: `TrackingPage.tsx`, `Header.tsx`, `customerExperience.ts`
## 📐 UI/UX Structure Updates

### Current Layout Issues:
```
[Gift-Ready Section] ← REMOVE
[Workshop Packages]
[Mini Game Custom] ← MOVE INTO Workshop
[Custom Workshop Form]
[Payment/Checkout]
```

### New Proposed Layout:
```
[Workshop Packages] 
  ├─ Workshop Card 1
  │  ├─ Description
  │  ├─ [Toggle: Gift?] ← NEW
  │  ├─ Mini Game Preview ← MOVED
  │  └─ Details
  ├─ Workshop Card 2
  └─ [Product Description Block] ← NEW
[Custom Workshop Selection]
[Product Details + Images]
[Payment Form]
  ├─ [Momo | VN Pay] - clearer icons
  ├─ Location/Province selector
  └─ Quantity status bar
[Checkout Summary]
```

---

## 🎯 Task Breakdown

| # | Task | Priority | Estimate | Owner | Status |
|---|------|----------|----------|-------|--------|
| 1 | Remove Gift-Ready section | P1 | 1h | - | ✅ |
| 2 | Move mini game into workshop card | P1 | 3h | - | ✅ |
| 3 | Add gift toggle + logic | P1 | 2h | - | ✅ |
| 4 | Add product description block | P2 | 2h | - | ⬜ |
| 5 | Reduce font variants (audit) | P2 | 2h | - | ✅ |
| 6 | Improve payment icons (Momo/VN Pay) | P2 | 1.5h | - | ✅ |
| 7 | Enhance location/province selector | P2 | 2h | - | ✅ |
| 8 | Bold quantity display + bar | P3 | 1h | - | ⬜ |
| 9 | Update product showcase images | P3 | 1.5h | - | ⬜ |
| 10 | Add DB connection visualization | P3 | 2h | - | ✅ |
| 11 | Add cancel button to tracking page with refund modal | P1 | 3h | - | ✅ |
| 12 | Show cancel action on saved/recent tracking items list | P1 | 2h | - | ✅ |
| 13 | Mock Login & User Profile Order History with cancel action | P1 | 3.5h | - | ✅ |

**Total Estimated**: ~26 hours

---

## 📝 Component Files to Update

```
src/
├── components/
│   ├── WorkshopCard.jsx (+ add mini game + gift toggle)
│   ├── ProductDescription.jsx (NEW)
│   ├── PaymentMethod.jsx (clarify icons)
│   ├── LocationSelector.jsx (enhance dropdown)
│   ├── QuantityStatus.jsx (bold + progress bar)
│   └── GiftToggle.jsx (NEW)
├── pages/
│   ├── Workshop.jsx (restructure layout)
│   └── Checkout.jsx (update flow)
├── assets/
│   ├── payment-icons/ (Momo, VN Pay - high res)
│   └── product-showcase/ (add outcome images)
└── styles/
    ├── typography.css (consolidate fonts)
    └── colors.css (accent for important data)
```

---

## 🔗 Database Considerations

### Product Description Block - Query
```sql
SELECT product_id, name, size, material, production_stages, care_instructions
FROM products
WHERE workshop_id = ? AND category = 'outcome'
```

### Inventory/Slots
```sql
SELECT workshop_id, max_slots, booked_slots, (max_slots - booked_slots) AS available
FROM workshop_slots
WHERE workshop_id = ?
```

---

## 🎨 Design Token Updates Needed

- **Typography Scale**:
  - Heading 1: 32px, bold
  - Heading 2: 24px, semibold
  - Heading 3: 18px, semibold
  - Body: 16px, regular
  - Small: 14px, regular
  - Label: 12px, uppercase, semibold

- **Color Accents**:
  - Quantity warning: `#E67E22` (orange, already in use)
  - Available slots: highlight with accent color

---

## ✅ Acceptance Criteria

- [x] No "Gift-Ready" section visible on main flow
- [x] Mini game launches from within workshop card (not separate page)
- [x] Gift toggle works end-to-end (checkout shows gift items separately)
- [ ] Product description block displays below workshops with 3+ details
- [x] Max 3 font weights used consistently
- [x] Payment icons (Momo/VN Pay) are clear & proportionate
- [ ] Quantity display has visual progress indicator
- [x] Location selector shows smart defaults + search
- [x] Cancel button displays on tracking details with modal showing time-based refund policy (100%/50%/0%)
- [x] Users can cancel items directly from their saved/entered tracking list
- [x] User profile / orders dashboard lists all user orders with current status and inline cancel buttons

---

## 📅 Timeline Suggestion

- **Week 1**: P1 tasks (remove, move mini game, gift toggle)
- **Week 2**: P2 tasks (descriptions, fonts, payment UI, location)
- **Week 3**: P3 tasks (quantity bar, images, DB viz)
- **Week 4**: Testing, refinement, documentation

---

**Last Updated**: June 26, 2026  
**Status**: 🟡 In Progress
