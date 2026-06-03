# THO Studio E-commerce UX

Website demo cho THO Studio, tập trung vào sản phẩm gốm thủ công, đặt workshop, thanh toán, review và tracking sau mua hàng.

## Chạy dự án

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Database local dùng SQLite:

- File mặc định khi chạy từ thư mục `backend`: `backend/db/tho_demo.sqlite`
- Schema/seed: `db/03_sqlite_schema.sql`
- Cấu hình: `backend/.env` với `DATABASE_URL=sqlite:///db/tho_demo.sqlite`

## Yêu cầu UX cần chỉnh

### Workshop

- Bộ lọc workshop cần tinh tế hơn:
  - Không lọc giá bằng 3 mức quá cơ bản.
  - Nếu vẫn cần giá, đổi thành gói rõ nghĩa: cơ bản dưới 300k, trải nghiệm tiêu chuẩn, cao cấp trên 1tr.
  - Ưu tiên filter dạng thanh trượt giống website du lịch.
  - Thêm lọc theo nhóm khách: workshop, family friendly, couple friendly, single friendly.
  - Cột lọc thứ 3 không dùng “rẻ nhất/đắt nhất” vì trùng với giá; đổi thành thời gian tuần tới/tháng tới.
- Danh sách workshop:
  - Bỏ phần “khách hàng nghĩ gì” khỏi danh sách workshop.
  - Hiển thị nhiều workshop hơn và làm danh sách dài hơn.
  - Thêm trang chi tiết cho từng workshop.
- Thanh toán workshop:
  - Workshop checkout không được lẫn thêm sản phẩm vật lý nếu flow đang là đặt workshop riêng.
  - Không hiển thị địa chỉ đề xuất nếu khách chưa đăng nhập hoặc chưa từng lưu địa chỉ.
  - Chỉ dùng một loại vận chuyển, hoặc ghi rõ phí từng loại và cộng vào tổng tiền.
  - Nếu chọn một loại vận chuyển: ghi rõ chính sách từ đầu, ví dụ đơn được vận chuyển 3 ngày sau workshop và đến tay khách trong khoảng 2 tuần nội thành.
  - QR thanh toán phải có countdown 15 phút.
  - Cần định nghĩa rõ giữ slot 15 phút: hủy thanh toán có trả slot ngay không, đặt lại có giữ được slot cuối cùng không.
  - Thêm tải biên lai sau thanh toán.
  - Làm rõ “giao hàng có bảo hiểm” nghĩa là gì, ví dụ vỡ có đền không, điều kiện đền thế nào.

### Products

- Thêm trang chi tiết cho từng sản phẩm.
- Trang products đang có bộ sưu tập ở đầu, phía dưới nên chia danh sách theo bộ sưu tập nổi bật.
- Làm danh sách sản phẩm dài hơn.
- Cuối danh sách tách riêng các sản phẩm hết hàng thành một dòng/section riêng.
- Optional: thêm nút nhắc khi có hàng, mở popup nhập email.
- Optional: card sản phẩm có thể hiển thị sao đánh giá overall.
- Khi chọn số lượng vượt tồn kho, hiện popup báo không đủ hàng.
- Giỏ hàng: “quay lại mua sắm” và “tiếp tục mua sắm” đang giống nhau, cần bỏ bớt hoặc phân biệt hành vi.

### Review

- Header “Review” là review sản phẩm.
- Review cho từng sản phẩm nằm trong trang chi tiết sản phẩm.
- Cần tách rõ review sản phẩm và review workshop.
- Form review phải ghi rõ field nào bắt buộc.
- Review phải có số sao đánh giá.
- Cần quyết định rule đăng review:
  - MVP hiện tại cho phép khách không đăng nhập review.
  - Bản hoàn thiện nên cân nhắc chỉ cho review sau mua/đặt workshop để tránh review ảo.

### Search

- Nút tìm kiếm không nên đưa người dùng về tracking vì đã có trang tracking riêng.
- Search nên tập trung tìm sản phẩm, workshop, bộ sưu tập hoặc bài chính sách liên quan.

### Tracking

- Tracking gốm:
  - Nút liên hệ studio và hướng dẫn bảo quản hiện chưa hoạt động.
  - Hướng dẫn bảo quản có thể chưa cần nếu khách chưa nhận hàng.
- Nên phân loại tracking code ngay từ lúc tạo:
  - `WS...` cho workshop.
  - `ORD...` cho đơn hàng.
  - `THO...` hoặc `CER...` cho tracking gốm.
- Có thể thêm thông tin nhân viên phụ trách.
- Đơn hàng cần trạng thái rõ: đã gói, đợi đơn vị vận chuyển, đang giao, đã nhận, chờ review, đã hủy.
- Workshop tracking cần thêm số người tham gia và tình trạng check-in.

### About Us và chính sách

- About Us cần làm hoành tráng hơn, thể hiện rõ studio, tinh thần thủ công, không gian, nghệ nhân và quy trình gốm.
- Toàn bộ thông tin chính sách phải có trang riêng, không chỉ chuyển về About Us.
- Dãy cuối trang đang trùng nội dung với phía trên và không có nút hoạt động, nên xóa.

## Backend SQLite đã bắt đầu tối ưu

Đã chuyển backend local sang SQLite để chạy nhanh, không cần Docker/PostgreSQL trong giai đoạn demo.

Các phần đã có nền:

- `DatabaseClient` hỗ trợ SQLite mặc định và vẫn giữ nhánh PostgreSQL cũ.
- Tự khởi tạo SQLite schema/seed khi backend import database client.
- `GET /api/v1/products` đọc từ bảng `products`.
- `GET /api/v1/workshops` đọc từ bảng `workshops`.
- `GET /api/v1/reviews` và `POST /api/v1/reviews` đọc/ghi bảng `reviews`.
- `GET /api/v1/tracking/{code}` đọc từ `tracking_records` và `tracking_timeline`.

Schema SQLite hiện có:

- `products`
- `workshops`
- `reviews`
- `tracking_records`
- `tracking_timeline`

## Backend TODO tiếp theo

1. Thêm API chi tiết:
   - `GET /api/v1/products/{id}`
   - `GET /api/v1/workshops/{id}`
2. Thêm filter query cho workshop:
   - `audience`
   - `workshop_type`
   - `date_range`
   - `min_price`
   - `max_price`
3. Thêm kiểm tra tồn kho khi thêm giỏ hàng hoặc checkout.
4. Tách order sản phẩm và booking workshop ở backend.
5. Thêm bảng giữ slot workshop với hạn 15 phút.
6. Thêm trạng thái thanh toán, countdown QR, biên lai và tracking code sau thanh toán.
7. Thêm bảng notify email khi sản phẩm có hàng lại.
8. Thêm chính sách vận chuyển/bảo hiểm vào database hoặc content config.

## Kiểm thử nhanh

```bash
cd backend
pytest -q
```

Smoke tests hiện kiểm tra health, login, address, workshop, tracking và review.
