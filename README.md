# THỔ Studio — Website Thương Mại & Booking Workshop Gốm

Website demo cho **THỔ Studio**, một studio gốm thủ công. Hệ thống kết hợp thương mại điện tử sản phẩm gốm, đặt lịch workshop, chatbot tư vấn, ceramic tracker và dashboard quản lý nội bộ.

---

## Công nghệ sử dụng

| Lớp | Công nghệ |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS v4 |
| UI Components | shadcn/ui, Radix UI, MUI, Lucide Icons |
| Animation | Motion (Framer Motion v12), IntersectionObserver tự build |
| Backend | FastAPI (Python) |
| Cơ sở dữ liệu | SQLite (mặc định local), tương thích PostgreSQL |
| Routing | React Router v7 |
| Charts | Recharts |
| Deploy | Vercel (frontend) |

---

## Chạy dự án

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Database

Database local dùng SQLite, tự khởi tạo khi backend khởi động:

- File mặc định: `db/tho_demo.sqlite`
- Schema + seed: `db/03_sqlite_schema.sql`
- Cấu hình: copy `backend/.env.example` thành `backend/.env`, sửa `DATABASE_URL` nếu cần

### Kiểm thử nhanh

```bash
cd backend
pytest -q
```

---

## Những gì đã làm được

### Frontend — Trang khách hàng

| Trang | Route | Mô tả |
|---|---|---|
| Trang chủ | `/` | Hero section, bộ sưu tập nổi bật, workshop gợi ý, CTA |
| Danh sách sản phẩm | `/product` | Lọc theo bộ sưu tập, loại, giá; hiển thị hết hàng riêng |
| Chi tiết sản phẩm | `/product/:id` | Ảnh, biến thể, thêm giỏ, kiểm tra tồn kho |
| Danh sách workshop | `/workshop` | Lọc audience, type, date_range, khoảng giá; slider giá |
| Chi tiết workshop | `/workshop/:id` | Thông tin đầy đủ, slot còn lại, nút đặt ngay |
| Booking form | `/booking/:id` | Chọn ngày giờ, số người, thông tin khách |
| Workshop Customizer | `/workshop-customizer` | Chọn phong cách, kỹ thuật, màu men cá nhân hóa |
| Giỏ hàng | `/cart` | Hai giỏ tách biệt: sản phẩm vật lý + workshop booking |
| Checkout | `/checkout` | Form thông tin, chọn vận chuyển, thanh toán QR |
| Thanh toán thành công | `/success` | Hiệu ứng confetti, mã booking, hướng dẫn tiếp theo |
| Thanh toán thất bại | `/payment-failed` | Thông báo lỗi, nút thử lại |
| Tracking | `/tracking` | Tra cứu đơn hàng (`ORD…`), vé workshop (`WS…`), ceramic tracker (`THO…` / `CER…`) |
| Review | `/review` | Xem và gửi review, lọc theo loại, rating, studio reply |
| About | `/about` | Giới thiệu studio, đội ngũ, quy trình gốm |
| Chính sách | `/policy` | Chính sách vận chuyển, đổi trả, bảo hành |

### Frontend — Giao diện đặc biệt

- **Floating Chatbot** — nổi góc phải mọi trang (trừ checkout/staff), hỗ trợ tư vấn workshop
- **Workshop Chatbot** — hỏi phong cách, kinh nghiệm, mục đích → gợi ý workshop phù hợp, lưu session
- **Design Primitives** — trang `/figma-export` xuất toàn bộ token màu, typography để dùng trong Figma
- **Scroll animation** — hiệu ứng reveal on scroll toàn bộ section, tôn trọng `prefers-reduced-motion`
- **Page transition** — fade nhẹ khi chuyển route

### Frontend — Dashboard Staff / Admin

Route `/staff` và `/admin` (dùng chung `StaffAdminPage`):

| Tab | Nội dung |
|---|---|
| Dashboard | Tổng booking hôm nay/tuần, doanh thu, check-in, tracker cần cập nhật, QC issues |
| Quản lý Booking | Bảng booking workshop: khách, ngày, slot, check-in, thanh toán, tracking code, chatbot note |
| Ceramic Tracker | Theo dõi từng sản phẩm qua 7 giai đoạn nung; cập nhật stage → tự đồng bộ tracking khách |
| Quản lý sản phẩm | Danh sách đơn hàng sản phẩm vật lý theo stage xử lý |
| Tracking nội bộ | Gắn tracking code, xem tiến độ từ góc nhìn staff |

### Backend — API FastAPI

Tất cả endpoint có prefix `/api/v1`:

| Nhóm | Endpoint chính |
|---|---|
| Health | `GET /health` |
| Auth | `POST /auth/login` |
| Sản phẩm | `GET /products`, `GET /products/{id}` |
| Workshop | `GET /workshops` (filter: audience, type, date_range, min_price, max_price), `GET /workshops/{id}` |
| Booking | `POST /bookings`, `GET /bookings` |
| Giỏ hàng | `GET/POST/DELETE /cart` |
| Đơn hàng | `POST /orders` |
| Tracking | `GET /tracking/{code}`, `POST /tracking` (bulk upsert) |
| Review | `GET /reviews`, `POST /reviews` |
| Địa chỉ | `GET/POST /user/addresses` |
| Tìm kiếm | `GET /search` |
| Chatbot | `POST /chatbot/session`, `PATCH /chatbot/session/{id}`, `GET /chatbot/recommend` |
| Staff | `GET /staff/dashboard`, `GET /staff/bookings`, `GET /staff/trackers`, `GET /staff/product-jobs`, `PATCH /staff/trackers/{id}`, `GET /staff/chatbot-notes/{booking_id}` |

### Backend — Database SQLite

Schema hiện có (tự khởi tạo + migration inline):

| Bảng | Nội dung |
|---|---|
| `products` | Sản phẩm gốm, tồn kho, style_tags |
| `workshops` | Workshop, slot, audience, type, giá |
| `workshop_bookings` | Booking của khách, check-in, payment, tracking |
| `reviews` | Review sản phẩm/workshop, reply studio, helpful count, ảnh |
| `tracking_records` | Bản ghi tracking đơn hàng/workshop/ceramic |
| `tracking_timeline` | Từng bước timeline của tracking |
| `ceramic_trackers` | Theo dõi sản phẩm gốm qua 7 giai đoạn nội bộ |
| `ceramic_product_jobs` | Job xử lý từng sản phẩm trong xưởng |
| `chatbot_sessions` | Lưu phiên chatbot: phong cách, kinh nghiệm, mục đích, gợi ý |
| `booking_chatbot_links` | Liên kết booking ↔ chatbot session |
| `user_addresses` | Địa chỉ giao hàng của khách |
| `orders` | Đơn hàng sản phẩm vật lý |
| `cart` | Giỏ hàng tạm |

### Tính năng đặc thù đã hoàn thiện

1. **Hai giỏ hàng tách biệt** — `ProductCartContext` và `WorkshopCartContext` riêng, checkout không lẫn nghiệp vụ
2. **Ceramic Tracker** — 7 giai đoạn: tạo hình → phơi khô → nung sơ → tráng men → nung hoàn thiện → sẵn sàng → hoàn tất; staff cập nhật stage → tự đồng bộ timeline phía khách
3. **Chatbot tư vấn workshop** — hỏi phong cách (tối giản / màu sắc / tự nhiên), kinh nghiệm, mục đích → gợi ý workshop_id → lưu DB → staff đọc được trong dashboard
4. **Tracking đa loại** — phân biệt `ORD…` (đơn hàng), `WS…` (workshop/vé), `THO…`/`CER…` (ceramic tracker)
5. **Staff ↔ Customer sync** — khi staff cập nhật stage gốm, `tracking_timeline` phía khách được rebuild tự động

### Tài liệu dự án

Thư mục `doc/`:

- `BAO_CAO_THO_STUDIO.md` — báo cáo đồ án đầy đủ (Chương 1–5)
- `01_sitemap_wireframe.md` — sitemap và wireframe tất cả màn hình
- `02_prototype_ui.md` — mô tả prototype Figma
- `03_case_study.md` — phân tích use case và BPMN
- `04_use_case_detail.md` — chi tiết use case từng actor
- `CHUONG_4_SITEMAP_WIREFRAME_PROTOTYPE_CASE_STUDY.md` — tổng hợp Chương 4

---

## Smoke tests bao phủ

```
test_health               ✓  GET /health → 200
test_login                ✓  POST /auth/login → access_token
test_create_address       ✓  POST /user/addresses → address_id
test_list_workshops       ✓  GET /workshops → danh sách >= 1
test_tracking_lookup      ✓  GET /tracking/THO-2024-0847 → ceramic type
test_create_tracking_...  ✓  POST /tracking → 201, GET lookup đúng data
test_staff_sync_...       ✓  bookings, trackers, dashboard đều trả đúng
test_create_review        ✓  POST /reviews → review_id
```

---

## Hướng phát triển tiếp theo

- [ ] Tích hợp thanh toán thật (VNPay / MoMo)
- [ ] Giữ slot workshop 15 phút khi thanh toán (bảng slot_reservations)
- [ ] Tích hợp đơn vị vận chuyển thật, cộng phí vào tổng tiền
- [ ] Notify email khi sản phẩm có hàng lại
- [ ] Trang About Us nâng cấp: nghệ nhân, không gian, quy trình gốm hoành tráng hơn
- [ ] Đăng nhập Google / Facebook
- [ ] Dashboard analytics nâng cao (biểu đồ doanh thu, hành vi khách)
- [ ] Chỉ cho phép review sau khi mua / đặt workshop xác nhận
- [ ] Nâng PostgreSQL khi scale production
