Thiết kế UI/UX điều chỉnh cho website THỔ - nền tảng gốm thủ công, tập trung vào việc hoàn thiện luồng Product, Workshop Booking, Hybrid Cart và Checkout.

Mục tiêu:
Giữ nguyên cấu trúc layout chính hiện có, không redesign toàn bộ. Chỉ chỉnh sửa các điểm nghiệp vụ đang thiếu hoặc chưa rõ: bổ sung page Product, sửa header bị trùng Workshop/Booking, làm rõ trạng thái slot workshop, xử lý add to cart cho workshop và product vật lý, tách checkout theo loại item, đồng bộ màu sắc/button/font theo mẫu endpage đã chọn.

Phong cách thiết kế:
- Giữ tinh thần minimalist, ấm, thủ công, tinh tế.
- Tone màu theo mẫu endpage/footer: nâu gốm, trắng ngà, terracotta, sage/celadon.
- Không dùng màu neon hoặc quá corporate.
- Giữ các section/layout chính hiện có, chỉ chỉnh nội dung, trạng thái, button và form.
- Card bo góc nhẹ, spacing thoáng, typography rõ ràng.
- Button đồng bộ: primary terracotta, secondary outline nâu/sage, disabled xám nhạt, danger đỏ đất muted.
- Không thay đổi footer/endpage, giữ màu và bố cục footer hiện tại.

Cần chỉnh các frame chính:

1. Header / Navigation
Mục tiêu: sửa lỗi header có 2 mục Workshop và Booking bị trùng nghĩa.
Yêu cầu:
- Giữ header hiện có.
- Đổi menu "Booking" thành "Product".
- Header sau chỉnh gồm: Home, Workshop, Product, About Us, Review, Cart icon.
- Workshop link đến danh sách workshop/booking.
- Product link đến trang Product mới.
- Không thêm navigation dư nếu không cần.

2. Product Page
Mục tiêu: bổ sung page sản phẩm vật lý vì hiện header có Product và hệ thống có bán sản phẩm gốm.
Thành phần:
- Header và footer giữ cùng style hiện có.
- Tiêu đề: "Sản phẩm gốm thủ công"
- Mô tả ngắn: "Những món gốm và bộ DIY kit có thể mua trực tiếp tại THỔ."
- Grid sản phẩm gồm vài sản phẩm:
  - Bình gốm men celadon — Dáng oval S
  - Bộ DIY Kit — Tô màu men cơ bản
  - Ly gốm thủ công
  - Đĩa gốm trang trí
- Mỗi product card có:
  - Ảnh sản phẩm
  - Tên sản phẩm
  - Mô tả ngắn
  - Giá
  - Badge tồn kho: Còn hàng / Sắp hết / Hết hàng
  - Button "Thêm vào giỏ"
- Nếu hết hàng: disable hoặc ẩn button "Thêm vào giỏ".

3. Workshop Listing / Booking Cards
Mục tiêu: làm rõ trạng thái booking và slot workshop.
Yêu cầu:
- Giữ layout card workshop hiện có.
- Mỗi card cần hiển thị:
  - Tên workshop/package
  - Ngày hoặc thứ cố định
  - Giờ cố định
  - Số người/package
  - Giá
  - Slot còn lại
  - Trạng thái slot
- Ví dụ workshop cố định:
  - Thứ 2: Nặn gốm cơ bản
  - Thứ 3: Tô màu gốm
  - Thứ 7: Combo nặn gốm + tô màu
- Trạng thái:
  - Còn slot: hiển thị "Còn 12/16 slot" và button "Book now".
  - Ít slot: hiển thị "Chỉ còn 3/12 slot", badge "Sắp hết slot", vẫn có button "Book now".
  - Hết slot: hiển thị "Hết slot", không hiện button "Book now", có thể hiện button phụ "Xem lịch khác".
  - Thiếu instructor/equipment: hiển thị cảnh báo và không hiện button "Book now".

4. Booking Form Sau Khi Chọn Workshop
Mục tiêu: user chỉ nhập thông tin cần thiết vì workshop đã cố định ngày giờ.
Yêu cầu:
- Khi user click "Book now", form tự động điền:
  - Tên workshop
  - Ngày
  - Giờ
  - Instructor
  - Giá
  - Package
- Không yêu cầu user chọn lại ngày/giờ.
- User chỉ nhập:
  - Họ tên
  - Số điện thoại
  - Email
  - Ghi chú không bắt buộc
- Gói 1 người: số vé mặc định 1, không cần chỉnh.
- Gói 2 người: số vé mặc định 2, label "Combo 2 người".
- Gói linh hoạt: cho chỉnh số vé nhưng không vượt quá slot còn lại.
- Helper text:
  "Ngày và giờ đã được cố định theo workshop bạn chọn. Bạn chỉ cần nhập thông tin liên hệ để giữ chỗ."

5. Hybrid Cart
Mục tiêu: xử lý giỏ hàng có cả vé workshop và sản phẩm vật lý.
Yêu cầu:
- Workshop ticket và product vật lý được hiển thị thành 2 loại item khác nhau.
- Workshop item có timer giữ slot 15 phút.
- Product item không có timer slot.
- Timer chỉ nằm trong block workshop, không áp dụng toàn giỏ hàng.
- Nếu timer hết hạn:
  - Chỉ workshop ticket bị release.
  - Product vật lý vẫn ở trong giỏ.
  - Workshop item chuyển sang trạng thái "Slot đã hết hạn".
  - Button đổi thành "Chọn slot khác".
- Text giải thích:
  "Slot workshop được giữ trong 15 phút. Nếu quá hạn, chỉ vé workshop được giải phóng; sản phẩm vật lý vẫn ở trong giỏ hàng."

6. Checkout
Mục tiêu: checkout chỉ hỏi thông tin phù hợp theo loại item.
Trường hợp A — Chỉ có workshop:
- Hiển thị form "Thông tin liên hệ".
- Không hiển thị địa chỉ giao hàng.
- Summary hiển thị workshop, ngày giờ, số vé, instructor, tổng tiền.
- CTA: "Thanh toán và nhận QR".
- Helper text:
  "Vé workshop không cần địa chỉ giao hàng. QR check-in sẽ được gửi qua email/SMS sau khi thanh toán."

Trường hợp B — Chỉ có product:
- Hiển thị form "Thông tin liên hệ".
- Hiển thị "Địa chỉ giao hàng".
- Summary hiển thị sản phẩm vật lý, số lượng, phí ship, tổng tiền.
- CTA: "Thanh toán đơn hàng".

Trường hợp C — Có cả workshop và product:
- Hiển thị "Thông tin liên hệ".
- Hiển thị "Địa chỉ giao hàng" nhưng ghi rõ:
  "Địa chỉ này chỉ dùng để giao sản phẩm vật lý."
- Summary tách thành:
  - Workshop Ticket
  - Shipping Order
- CTA: "Thanh toán".
- Helper text:
  "Bạn đang thanh toán một lần cho vé workshop và sản phẩm vật lý. Sau thanh toán, hệ thống sẽ tách thành Workshop Ticket và Shipping Order."

7. Payment / Success / QR
Mục tiêu: guest không cần đăng nhập nhưng vẫn có minh chứng đặt booking.
Yêu cầu:
- Giữ popup MOMO/VNPAY hiện có.
- Timer thanh toán cần ghi rõ:
  "Slot workshop được giữ đến 12:05."
- Payment fail:
  - Nếu slot còn hạn: có button "Thử thanh toán lại".
  - Nếu slot hết hạn: có button "Chọn slot khác".
- Success page hiển thị:
  - Order Code
  - Workshop Ticket Code
  - QR Check-in
  - Email/SMS đã gửi thông tin
- Phân biệt rõ:
  - Order Code: tra cứu đơn hàng/thanh toán.
  - Workshop Ticket Code: mã vé workshop.
  - QR Check-in: minh chứng khi đến studio.
  - Ceramic Tracking Code: tạo sau workshop khi staff tạo tracker cho thành phẩm.
- Text cần có:
  "Mã tracking gốm sẽ được gửi sau khi workshop kết thúc hoặc sau khi staff tạo tracker cho thành phẩm."

8. Footer / Endpage
Mục tiêu: giữ lại endpage theo mẫu nhóm chọn.
Yêu cầu:
- Không thay đổi bố cục footer chính.
- Giữ màu nâu gốm đậm.
- Giữ các nhóm link chính sách, dịch vụ, social, hotline.
- Đồng bộ font và spacing để footer không lệch với các page còn lại.

9. Đồng bộ UI Components
Yêu cầu:
- Đồng bộ button, input, badge, card, table row.
- Primary button: terracotta.
- Secondary button: outline nâu/sage.
- Disabled button: xám nhạt.
- Danger button: đỏ đất muted.
- Badge slot:
  - Còn slot: xanh sage.
  - Sắp hết slot: vàng đất.
  - Hết slot/lỗi tài nguyên: đỏ đất muted.
- Font:
  - Heading serif hoặc style đang dùng trong file.
  - Body sans-serif dễ đọc.
- Không trộn quá nhiều font, không dùng màu ngoài palette.

Output mong muốn:
- Giữ các frame/layer chính hiện có.
- Chỉ thêm frame Product nếu chưa có.
- Chỉnh các frame hiện có:
  1. Header / Navigation
  2. Product Page
  3. Workshop Listing
  4. Booking Form
  5. Hybrid Cart
  6. Checkout
  7. Payment / Success QR
  8. Footer / Endpage
- Giao diện đủ thực tế để đưa vào báo cáo UI/UX và giải thích được nghiệp vụ Product, Workshop Booking, Hybrid Cart, Guest Checkout.