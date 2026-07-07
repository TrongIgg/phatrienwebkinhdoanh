# THỔ Studio - Phiên bản Static HTML/CSS/JS

Tài liệu hướng dẫn cấu trúc, tính năng và cách triển khai (deploy) phiên bản tĩnh (static) của website **THỔ Studio**. Phiên bản này đã được tối ưu hóa giao diện người dùng (UI/UX) và tương thích hoàn toàn với dữ liệu lưu đệm cũng như đồng bộ Docker FastAPI Database.

---

## 📁 Cấu trúc Thư mục `html-version`

```text
html-version/
├── css/
│   ├── theme.css        # Định nghĩa biến màu sắc (Coffee, Olive...), typography và reset styles.
│   ├── layout.css       # Hệ thống khung grid, flexbox và responsive layout.
│   ├── components.css   # Styles cho nút bấm, thẻ bài viết, input form và các badge.
│   └── animations.css   # Các hiệu ứng chuyển động mượt mà (fade-in, slide-up, floating).
├── js/
│   ├── data.js          # Dữ liệu tĩnh mẫu (Danh sách sản phẩm, Workshops, Đánh giá).
│   ├── cart.js          # Xử lý logic Giỏ hàng (Thêm, Xóa, Cập nhật số lượng, Phí gói quà).
│   ├── utils.js         # Các hàm tiện ích (Format tiền tệ VND, Toast thông báo, lưu trữ đơn hàng).
│   └── header.js        # Điều khiển thanh điều hướng di động và nạp Chatbot tự động toàn trang.
├── README.md            # File tài liệu hướng dẫn (chính là file này).
├── index.html           # Trang chủ (Hiển thị Hero video banner, Giới thiệu & 4 sản phẩm tiêu biểu).
├── workshop.html        # Danh sách các gói Workshop (Giao diện thẻ 3 cột).
├── workshop-detail.html # Chi tiết Workshop (Tích hợp bộ tùy biến 3D Customizer, lịch trống thời gian thực).
├── workshop-customizer.html # Bộ tùy biến đất nặn & kiểu dáng 3D.
├── product.html         # Danh mục sản phẩm (Có bộ lọc phân loại theo chất liệu gốm).
├── product-detail.html  # Chi tiết sản phẩm (Tích hợp form quà tặng ẩn/hiện động và đổi màu nút mua).
├── cart.html            # Giỏ hàng của khách.
├── checkout.html        # Trang điền thông tin thanh toán & gửi đơn hàng lên database.
├── success.html         # Trang báo đặt hàng thành công (Tích hợp sinh mã vạch ORD/WS và in biên lai PDF).
├── payment-failed.html  # Trang báo lỗi thanh toán.
├── tracking.html        # Tra cứu hành trình sản phẩm (Bố cục 2 cột, chọn nhanh mã cũ, sơ đồ tiến trình).
├── review.html          # Gửi & xem đánh giá (Tích hợp luồng phản hồi phân cấp, điền mã tự động từ URL).
├── staff.html           # Bảng quản lý dành cho Nhân viên (Hỗ trợ duyệt đơn, trả lời trực tiếp đánh giá).
└── admin.html           # Bảng điều khiển dành cho Admin (Báo cáo doanh thu, quản lý danh sách lớp học).
```

---

## 🌟 Các Tính năng đã hoàn thành

### 1. Giao diện khách hàng (Client Pages)
* **Trang chủ (`index.html`):** Chỉ hiển thị tối đa **4 sản phẩm tiêu biểu** nhằm tối ưu tốc độ tải trang, đính kèm nút chuyển hướng sang danh mục chính.
* **Chi tiết sản phẩm (`product-detail.html`):** Form quà tặng ban đầu được ẩn đi. Khi người dùng tích chọn `🎁 Đây là quà tặng`, form nhập thông tin quà tặng sẽ mở ra, đồng thời nút mua hàng tự động chuyển sang màu **Đỏ** và đổi tên thành **"Giỏ hàng quà tặng"**.
* **Đơn hàng thành công (`success.html`):** Sửa lỗi cú pháp script giúp trang hoạt động hoàn hảo. Tự động hiển thị mã vạch (`ORD-` hoặc `WS-`), thông tin giao hàng và nút xuất biên lai PDF chuẩn chỉ.

### 2. Chatbot hỗ trợ trực tuyến toàn trang
* Bong bóng Chatbot nổi màu xanh lục kèm thông báo đỏ được nạp tự động qua [js/header.js](js/header.js).
* Chatbot xuất hiện ở tất cả các trang của hệ thống, ngoại trừ trang Giỏ hàng (`cart.html`) và Thanh toán (`checkout.html`) để tránh làm phiền khách mua hàng.
* Cửa sổ chatbot hỗ trợ nhấn chọn nhanh các câu hỏi gợi ý và phản hồi động thông minh.

### 3. Tra cứu hành trình thông minh (`tracking.html`)
* **Thiết kế 2 cột chuẩn UI:** Cột trái giới thiệu thông tin mã tra cứu; Cột phải chứa ô tìm kiếm và danh sách các mã vừa tạo.
* **Lịch sử tìm kiếm nhanh:** Tự động lấy danh sách các đơn hàng vừa tạo trong bộ nhớ đệm `tho-persistent-tracking-records` để hiển thị thành các nút chọn nhanh dưới ô tìm kiếm.
* **Hành trình chi tiết:** Hiển thị sơ đồ các bước thực tế kèm hình ảnh xưởng nặn gốm dàn ngang 4 cột mượt mà.
* **Đồng bộ hóa Docker Database:** Tự động gửi yêu cầu truy vấn đến Docker Backend (`GET /api/v1/tracking/{code}`) để lấy thông tin trực tiếp từ cơ sở dữ liệu SQLite của xưởng.

### 4. Đánh giá phân cấp & Tương tác (`review.html`)
* Hỗ trợ hiển thị các câu phản hồi phân cấp (Replies) dưới mỗi thẻ đánh giá (nhận diện nhãn `THỔ STUDIO` dành cho nhân viên).
* Người dùng có thể bình luận tương tác trực tiếp ngay dưới thẻ đánh giá của người khác.
* Tự động bắt tham số `?code=...` truyền từ trang Theo dõi để điền sẵn mã đơn hàng và chọn trước loại phân loại sản phẩm/workshop tương ứng.

### 5. Kênh Nhân viên (`staff.html`) & Admin (`admin.html`)
* **Staff Panel:** Giao diện tối màu chuyên nghiệp. Nhân viên có thể xem danh sách đặt chỗ học viên và phản hồi ý kiến đánh giá trực tiếp lên hệ thống.
* **Admin Panel:** Thống kê biểu đồ sao, doanh thu tháng và quản lý trạng thái kích hoạt của các lớp học workshop.

---

## 🚀 Hướng dẫn Chạy & Triển khai (Deploy)

### 1. Xem trước cục bộ (Local Preview)
Cách đơn giản nhất là sử dụng extension **Live Server** trên VS Code:
1. Mở thư mục `html-version` bằng VS Code.
2. Click chuột phải vào tệp `index.html` và chọn **Open with Live Server**.
3. Trang web sẽ khởi chạy tại địa chỉ `http://127.0.0.1:5500/`.

Hoặc sử dụng command line (Yêu cầu cài NodeJS):
```bash
cd html-version
npx serve .
```

### 2. Deploy lên mạng qua Vercel CLI (Nhanh nhất)
Để đưa phiên bản này lên mạng internet công cộng chỉ trong 10 giây:
1. Mở CMD / Terminal tại thư mục `html-version/`.
2. Chạy lệnh:
   ```bash
   npx vercel --prod
   ```
3. Đăng nhập và làm theo các bước mặc định của Vercel. Sau khi chạy xong, bạn sẽ nhận được đường link chính thức.
