# 📦 Tổng hợp phiên bản HTML — THỔ Studio

> Cập nhật: 07/07/2026

---

## 🗂️ Cấu trúc tổng quan

```
html-version/
├── css/                        # 4 file stylesheet
│   ├── theme.css               # Biến màu (Coffee, Olive...), typography, reset
│   ├── layout.css              # Grid, Flexbox, responsive layout
│   ├── components.css          # Nút bấm, thẻ, input form, badge
│   └── animations.css          # Fade-in, slide-up, floating effects
├── js/                         # 4 file script
│   ├── data.js                 # Dữ liệu tĩnh: sản phẩm, workshop, đánh giá
│   ├── cart.js                 # Giỏ hàng: thêm, xóa, cập nhật, phí quà
│   ├── utils.js                # Format VND, Toast thông báo, lưu đơn hàng
│   └── header.js               # Nav di động, nạp Chatbot tự động toàn trang
├── image/
│   ├── logo/                   # logo.jpg, momo.png, vnpay.jpg
│   ├── product/                # 34 ảnh sản phẩm gốm (JPG)
│   └── workshop/               # 21 ảnh workshop (PNG + JPG)
├── README.md
├── SUMMARY.md                  # File này
└── 18 file HTML (xem bảng bên dưới)
```

---

## 📄 Danh sách 18 trang HTML

### 🛍️ Giao diện khách hàng

| Trang | File | Mô tả |
|---|---|---|
| Trang chủ | `index.html` | Hero video banner, giới thiệu, 4 sản phẩm nổi bật |
| Danh mục SP | `product.html` | Danh mục gốm, bộ lọc theo chất liệu |
| Chi tiết SP | `product-detail.html` | Form quà tặng ẩn/hiện động, nút mua đổi màu đỏ |
| Giỏ hàng | `cart.html` | Thêm/xóa/cập nhật số lượng, phí gói quà |
| Thanh toán | `checkout.html` | Form thông tin, gửi đơn lên Docker FastAPI |
| Đặt thành công | `success.html` | Mã vạch ORD/WS, thông tin giao hàng, xuất PDF |
| Thanh toán lỗi | `payment-failed.html` | Trang báo lỗi thanh toán |

### 🏺 Workshop & Tùy biến

| Trang | File | Mô tả |
|---|---|---|
| Danh sách WS | `workshop.html` | Danh sách gói workshop, thẻ 3 cột |
| Chi tiết WS | `workshop-detail.html` | Tùy biến 3D, lịch trống thời gian thực |
| Tùy biến 3D | `workshop-customizer.html` | Bộ chọn đất nặn & kiểu dáng 3D |
| Đặt chỗ | `booking.html` | Trang booking lịch học workshop |

### 📦 Hậu mãi & Tương tác

| Trang | File | Mô tả |
|---|---|---|
| Tra cứu | `tracking.html` | Hành trình đơn hàng, lịch sử nhanh, đồng bộ DB |
| Đánh giá | `review.html` | Gửi & xem đánh giá, phân cấp replies |

### ℹ️ Thông tin

| Trang | File | Mô tả |
|---|---|---|
| Giới thiệu | `about.html` | Giới thiệu về THỔ Studio |
| Chính sách | `policy.html` | Điều khoản & chính sách |

### 👨‍💼 Quản lý nội bộ

| Trang | File | Mô tả |
|---|---|---|
| Staff Panel | `staff.html` | Duyệt đơn, trả lời đánh giá, bảng nhân viên |
| Admin Panel | `admin.html` | Báo cáo doanh thu, biểu đồ sao, quản lý lớp workshop |

---

## ✅ Tính năng đã hoàn thành

### 🛍️ Luồng mua sắm
- [x] Duyệt sản phẩm & lọc theo chất liệu gốm
- [x] Chi tiết sản phẩm với form quà tặng ẩn/hiện (checkbox trigger)
- [x] Nút mua hàng đổi màu đỏ khi chọn chế độ quà tặng
- [x] Giỏ hàng đầy đủ (thêm, xóa, cập nhật số lượng, phí gói quà)
- [x] Checkout gửi đơn hàng lên Docker FastAPI + SQLite
- [x] Trang thành công: mã vạch tự sinh (ORD- / WS-) + xuất biên lai PDF
- [x] Trang lỗi thanh toán

### 🏺 Luồng Workshop
- [x] Danh sách workshop dạng thẻ 3 cột
- [x] Chi tiết workshop + bộ tùy biến đất nặn & kiểu dáng 3D
- [x] Lịch trống thời gian thực tại trang chi tiết workshop
- [x] Đặt chỗ học viên (booking)

### 📦 Tra cứu & Đánh giá
- [x] Tracking bố cục 2 cột chuẩn UI
- [x] Lịch sử mã nhanh từ `tho-persistent-tracking-records`
- [x] Đồng bộ Docker DB: `GET /api/v1/tracking/{code}`
- [x] Hành trình chi tiết: sơ đồ các bước + ảnh xưởng dàn 4 cột
- [x] Review phân cấp: replies dưới mỗi đánh giá, nhận diện nhãn `THỔ STUDIO`
- [x] Truyền tham số `?code=` từ trang tracking sang review (điền sẵn mã)

### 🤖 Chatbot hỗ trợ trực tuyến
- [x] Bong bóng nổi toàn trang, tự ẩn ở `cart.html` và `checkout.html`
- [x] Câu hỏi gợi ý nhấn chọn nhanh
- [x] Phản hồi động theo từ khoá

### 👨‍💼 Quản lý nội bộ
- [x] **Staff Panel**: xem danh sách đặt chỗ học viên, trả lời đánh giá trực tiếp
- [x] **Admin Panel**: thống kê biểu đồ sao, doanh thu tháng, quản lý trạng thái kích hoạt lớp workshop

### 🌐 Kết nối Backend (Docker FastAPI)
- [x] Gửi đơn hàng từ checkout lên database
- [x] Truy vấn hành trình qua API tracking
- [x] Dữ liệu lưu đệm (localStorage) đồng bộ với persistent records

---

## 🖼️ Assets

| Thư mục | Số file | Nội dung |
|---|---|---|
| `image/logo/` | 3 | logo.jpg, momo.png (thanh toán), vnpay.jpg |
| `image/product/` | 34 | Ảnh sản phẩm gốm thực tế (JPG) |
| `image/workshop/` | 21 | Ảnh buổi học workshop (PNG + JPG) |

**Tổng: 58 ảnh assets**

---

## 🚀 Chạy & Deploy

```bash
# Xem trước local (yêu cầu Node.js)
cd html-version
npx serve .

# Hoặc dùng Live Server (VS Code)
# Click phải index.html → Open with Live Server

# Deploy lên mạng qua Vercel
npx vercel --prod
```

---

## 🔗 Liên kết nội bộ quan trọng

| Luồng | Từ | Đến |
|---|---|---|
| Sau đặt thành công | `success.html` | `tracking.html?code=ORD-xxx` |
| Từ tracking sang review | `tracking.html` | `review.html?code=ORD-xxx` |
| Từ SP → giỏ hàng | `product-detail.html` | `cart.html` |
| Từ giỏ hàng → thanh toán | `cart.html` | `checkout.html` |
| Workshop → đặt chỗ | `workshop-detail.html` | `booking.html` |
