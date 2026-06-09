# Đặc Tả Giao Diện UI & Nguyên Mẫu Giao Diện (Prototype UI) - THỔ Studio

Tài liệu này thuyết minh chi tiết về hệ thống thiết kế (Design System), bố cục hình ảnh và nguyên lý hoạt động của các nguyên mẫu giao diện chính tại THỔ Studio nhằm đảm bảo tính nhất quán thẩm mỹ cao cấp (Premium Aesthetics) và tối ưu hóa trải nghiệm người dùng (UX).

---

## 1. Hệ Thống Thiết Kế (Design System Primitives)

Hệ thống nhận diện của THỔ Studio được phát triển xoay quanh tinh thần đất sét mộc mạc, sự chuyển động chậm rãi và kỹ thuật thủ công tinh xảo.

### 1.1. Bảng Màu (Harmonious Color Palette)
* **Màu Nền Chính (Background)**: `#FBEEE5` (Tone đất sét bột mềm, tạo cảm giác ấm cúng, dễ chịu cho mắt).
* **Màu Văn Bản Chính (Text Primary)**: `#361F17` (Nâu đất nung đậm, thay thế cho màu đen tuyền thuần túy để giảm độ gắt).
* **Màu Thương Hiệu Chủ Đạo (Primary Gold/Olive)**: `#716942` (Màu vàng đất oliu chín nung, dùng cho các nút quan trọng, tiêu đề phụ và trang thái đã hoàn thành).
* **Màu Nhấn Mạnh (Accent Terra Cotta)**: `#C96B37` (Màu cam đất nung rực cháy, dùng cho các tag nổi bật như "Bán chạy", "Hot", hoặc các cảnh báo quan trọng).
* **Màu Phụ Trợ (Muted / Slate)**: `#8B765D` / `#EFE2D6` (Dùng cho các đường kẻ border, nền khung phụ, chữ chú thích).

### 1.2. Phông Chữ (Typography)
* **Tiêu đề lớn (H1, H2, H3)**: Sử dụng Serif cao cấp (phông chữ có chân mộc mạc hoặc Outfit mượt mà) tạo cảm giác nghệ thuật thủ công.
* **Nội dung hiển thị (Body, Labels, Controls)**: Sử dụng Sans-serif có độ đọc cao (Inter hoặc Outfit) với tỷ lệ khoảng cách dòng (`line-height: 1.6`) rộng rãi.

### 1.3. Hiệu ứng Chuyển Động (Micro-interactions & Animations)
* **Reveal on Scroll**: Các khối section sẽ trượt nhẹ từ dưới lên và tăng dần độ hiển thị (`opacity`) khi cuộn chuột qua.
* **Hover State**:
  * Các thẻ sản phẩm/workshop (`.product-card`, `.workshop-card`) sẽ nâng nhẹ độ cao đổ bóng (`shadow-lg`) và trượt dịch chuyển 2px lên trên.
  * Các nút bấm (`PillButton`) sẽ có hiệu ứng chuyển màu nền mượt mà trong 200ms (`transition-colors`).

---

## 2. Đặc Tả Chi Tiết 5 Giao Diện Cốt Lõi

### 2.1. Trang Chủ (Homepage)
Trang chủ đóng vai trò như một tác phẩm điện ảnh giới thiệu hồn cốt của THỔ Studio.

* **Khu vực Hero - "Clay Cinema"**:
  * **Cấu trúc**: Chiếm trọn khung hình đầu tiên. Video nền định dạng MP4 độ nét cao, chạy lặp vô tận, không âm thanh. Phủ phía trên là lớp gradient chuyển màu mượt mà từ nâu đậm `#26140E` ở góc trái (giúp chữ nổi bật) sang trong suốt ở góc phải.
  * **Điểm tương tác**: Nút kêu gọi hành động lớn dạng bo tròn (`PillButton`) nền màu cát sáng `#FBEEE5`, chữ nâu đất `#361F17` dẫn thẳng tới trang danh sách workshop.
* **Khu vực Hành trình tại THỔ (Customer Journey)**:
  * **Cấu trúc**: Thiết kế dạng thanh tiến trình ngang nằm trên nền màu oliu `#716942`. Mỗi giai đoạn được đại diện bằng một vòng tròn tròn kính mờ (Glassmorphic) chứa biểu tượng nét mảnh độc quyền (`JourneyIcon`).
  * **Micro-animation**: Đường nối giữa các bước sẽ sáng dần lên dựa trên tương tác hover của người dùng.
* **Lưới Thẻ Trải Nghiệm (Workshop Cards Grid)**:
  * **Cấu trúc**: Lưới 3 cột trên Desktop. Mỗi thẻ gồm ảnh chụp phôi gốm ở trên và chi tiết thông số ở dưới.
  * **Điểm UX nổi bật**:
    * Tag góc trái ảnh thể hiện thuộc tính lớp học: "Phù hợp người mới", "Men màu hút khách", "Đi cùng người thương" để định hướng nhu cầu.
    * Nút bấm tách biệt rõ ràng giữa xem "Chi tiết" (Border viền mỏng) và "Đặt chỗ" (Nền đặc màu đậm).

---

### 2.2. Trang Chi Tiết Workshop (Workshop Detail Page)
Giao diện giúp khách hàng tìm hiểu chiều sâu lớp học và ra quyết định đặt lịch.

* **Thiết kế Ảnh Trực Quan**:
  * Khung ảnh chiếm 45% bề ngang, sử dụng tỉ lệ đứng `4:5` để thể hiện được chiều sâu của bình gốm mộc khi đặt trên bàn xoay xưởng nung.
* **Lưới Thông Tin Tác Nghiệp (Info Tiles Grid)**:
  * Được chia thành 4 ô vuông mộc mạc nền kem `#FFF8F2` có viền bo tròn nhẹ:
    1. **Ngày học**: Hiện rõ ngày trong tuần cùng định dạng ngày tháng nổi bật.
    2. **Khung giờ**: Thời gian buổi học kèm icon đồng hồ.
    3. **Nghệ nhân**: Tên giảng viên đứng lớp để tăng độ uy tín nghệ thuật.
    4. **Số slot còn trống**: Cập nhật real-time số ghế khả dụng (Ví dụ: "còn 3/10 slot"). Chữ "còn X slot" sẽ chuyển sang màu đỏ đất nung nếu số slot chỉ còn dưới 3 chỗ.
* **Khung Quy Tắc Giữ Slot (Slot Lock Policy)**:
  * Nằm trực tiếp phía trên nút đặt chỗ. Hộp thông tin nền nhạt viền vàng nâu cảnh báo khách hàng: *Slot của bạn chỉ được hệ thống khóa và giữ chỗ trong vòng 15 phút từ lúc mở cổng thanh toán. Sau 15 phút nếu thanh toán không thành công hoặc khách hàng chủ động hủy, slot lập tức được giải phóng để trả lại cho những người khác đang xếp hàng*.
* **Nút Tùy Biến 3D (3D Customizer CTA)**:
  * Cạnh nút thanh toán là nút dẫn vào "Tạo mẫu gốm thử 3D" để khách tự tay lựa chọn kiểu dáng và màu men mô phỏng trước khi bước vào lớp học thực tế.

---

### 2.3. Giỏ Hàng Lai (Hybrid Cart)
Hỗ trợ giỏ hàng đa năng bao gồm cả vé lớp học (dịch vụ vô hình có thời hạn) và đồ gốm bán sẵn (sản phẩm vật lý cần giao hàng).

* **Phân Tách Nhãn Luồng (Flow Separation)**:
  * **Vé Workshop**: Hiển thị ở trên cùng với nhãn đỏ cam nổi bật. Đồng hồ countdown đếm ngược hiển thị nổi bật dạng `MM:SS` (Ví dụ: "Giữ chỗ còn 14:15") kế bên biểu tượng xoay ngược thời gian.
  * **Sản phẩm vật lý**: Hiển thị phía dưới kèm theo hộp kiểm (`Checkbox`) chọn thanh toán. Cho phép khách hàng chỉ thanh toán một vài món gốm trong giỏ mà không ảnh hưởng đến các món khác.
* **Hộp Thông Tin Cá Nhân Hóa (Customization Info Box)**:
  * **Với quà tặng**: Nếu khách tích chọn mua làm quà, hệ thống mở một khung thông tin nền trắng hiển thị chi tiết dịp tặng, ghi chú thiệp chúc mừng nhập tay, và xác nhận bọc quà.
  * **Với mẫu Custom**: Hiển thị trực quan thông số bộ lọc dáng gốm, loại men nứt/men chảy, ký tự khắc tay của khách và ước tính số ngày chờ phản hồi từ nghệ nhân (mặc định 3 ngày).
* **Cơ Chế Thanh Toán Tách Luồng (Split Checkout Trigger)**:
  * Khi giỏ hàng chứa cả hai loại dịch vụ, Sidebar tóm tắt đơn hàng sẽ xuất hiện 2 nút bấm riêng biệt:
    1. **"Thanh toán sản phẩm"** (Nút màu nâu đậm): Dẫn vào trang nhập địa chỉ nhận hàng, chọn hình thức vận chuyển và tính phí ship.
    2. **"Thanh toán vé workshop"** (Nút viền mảnh): Chuyển thẳng tới trang thanh toán QR giữ slot không yêu cầu địa chỉ giao hàng vật lý để tối ưu thời gian thao tác trong giới hạn 15 phút.

---

### 2.4. Màn Hình Tracker Tiến Độ (Progress Tracker)
Nơi khách hàng nhìn thấy bằng chứng thực tế cho hành trình sản xuất sản phẩm gốm cá nhân sau buổi học.

* **Bộ Lọc Mã Tự Động (Auto-detecting Input)**:
  * Ô nhập mã tra cứu thông minh tự động nhận dạng tiền tố để trả về giao diện phù hợp:
    * Tiền tố `ORD-...`: Đơn hàng gốm chế tác sẵn (Màn hình hiển thị đơn vị vận chuyển, lịch trình giao hàng).
    * Tiền tố `WS-...`: Vé workshop (Hiển thị vé điện tử, mã QR check-in tại lớp).
    * Tiền tố `CUS-...`: Yêu cầu Brief custom sản phẩm riêng (Hiển thị báo giá nghệ nhân, nút đồng ý thanh toán sản phẩm).
    * Tiền tố `CER-...` hoặc `THO-...`: Quy trình hoàn thiện gốm tại lò của workshop.
* **Hành Trình Gốm 7 Giai Đoạn (7-Step Ceramic Kiln Timeline)**:
  * Timeline dọc thể hiện quy trình 7 bước:
    `Đã tham gia workshop -> Tạo hình -> Phơi khô -> Nung sơ -> Tráng men -> Nung hoàn thiện -> Sẵn sàng giao`.
  * Trạng thái mỗi bước hiển thị qua biểu tượng:
    * **Đã xong (Done)**: Vòng tròn màu vàng oliu đặc chứa dấu tick trắng.
    * **Đang làm (Current)**: Vòng tròn trắng viền oliu đậm có nhân nhấp nháy.
    * **Chờ xử lý (Waiting)**: Vòng tròn xám nhạt nét đứt.
  * Mỗi bước hiển thị tên nhân viên phụ trách trực tiếp (Ví dụ: "Phụ trách: Anh Quân") kèm ảnh chụp thực tế phôi gốm tại xưởng.
* **Thư Viện Khoảnh Khắc (Moment Gallery & Mini-Vlog)**:
  * Hiển thị danh sách ảnh/vlog ngắn mà nghệ nhân chụp và tải lên trong quá trình nung gốm. Khách có thể lưu ảnh về máy bằng nút "Lưu khoảnh khắc" hoặc bấm nút "Chia sẻ nhanh" lên Facebook/Instagram.

---

### 2.5. Dashboard Admin & Staff
Giao diện trung tâm tác nghiệp cho chủ studio và các nhân viên xưởng nung.

* **Metric Cards (Chỉ Số Vận Hành)**:
  * Thiết kế 4 khối thẻ trực quan thể hiện: Số lượng khách hôm nay, Doanh thu tuần dạng cột, Lớp học chờ check-in, và Sự cố lò gốm (nứt, lỗi men) để kịp thời đền bù sản xuất cho khách hàng.
* **Thông Báo Điểm Đánh Giá Thấp (Low-Rating Alarm)**:
  * **Vị trí**: Đặt tại khu vực nổi bật nhất trên đầu Dashboard.
  * **Trải nghiệm**: Bất cứ khi nào khách hàng đăng review từ 1 đến 3 sao cho workshop hoặc sản phẩm, một thẻ cảnh báo màu đỏ nhạt `#FFE3E1` viền đỏ gắt `#A33A2F` sẽ xuất hiện ngay lập tức. Trên thẻ hiển thị nội dung phản hồi tiêu cực của khách kèm theo nút hành động nhanh: "Liên hệ xử lý đổi trả/bồi hoàn" để bộ phận CSKH giải quyết khủng hoảng trải nghiệm lập tức.
* **Analytics Phân Khúc Thị Trường**:
  * Gồm 3 bảng xếp hạng tiến trình động (Progress bars) tự động tính toán từ cơ sở dữ liệu:
    * **Khu vực sinh sống**: Xếp hạng các quận khách đặt chỗ nhiều nhất (Quận 1, Quận 3, Bình Thạnh) giúp studio lập chiến dịch giao nhận tối ưu.
    * **Gu màu men/Kiểu dáng**: Thống kê số lượng phôi gốm theo phong cách (Minimal, Wabi-Sabi, Dịu màu) để nhập liệu nguyên liệu chuẩn xác.
    * **Mục đích tặng quà**: Phân loại dịp (Tân gia, Sinh nhật, Kỷ niệm) của đơn hàng quà tặng để đóng gói thiệp chúc phù hợp.
* **Tác Vụ Cập Nhật Lò Gốm**:
  * Bảng điều khiển tác nghiệp của staff gồm bộ lọc nhanh trạng thái gốm trong lò. Nút bấm camera cho phép nhân viên xưởng bật camera điện thoại, chụp phôi gốm nóng hổi ngay tại kệ phơi và tải lên hệ thống trong 3 giây, tự động đồng bộ hóa sang màn hình tra cứu (Tracker) của khách hàng.
