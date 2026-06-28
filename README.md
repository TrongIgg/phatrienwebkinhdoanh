# THỔ Studio — Web Thương Mại & Booking Workshop Gốm

<p align="center">
  <img src="image/banner.png" alt="THỔ Studio Banner" width="100%" />
</p>

> **THỔ Studio** là website demo cho một studio gốm thủ công, kết hợp thương mại điện tử sản phẩm gốm, hệ thống đặt lịch workshop, chatbot tư vấn AI, ceramic tracker theo giai đoạn và dashboard quản lý nội bộ dành cho nhân viên.

---

## Mục lục

- [Giới thiệu dự án](#giới-thiệu-dự-án)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Bắt đầu nhanh](#bắt-đầu-nhanh)
  - [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
  - [Chạy Frontend](#chạy-frontend)
  - [Chạy Backend](#chạy-backend)
  - [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Tính năng chính](#tính-năng-chính)
  - [Giao diện khách hàng](#giao-diện-khách-hàng)
  - [Dashboard Staff / Admin](#dashboard-staff--admin)
  - [Backend API](#backend-api)
  - [Cơ sở dữ liệu](#cơ-sở-dữ-liệu)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Kiểm thử](#kiểm-thử)
- [Deploy](#deploy)
- [Hướng phát triển tiếp theo](#hướng-phát-triển-tiếp-theo)
- [Tài liệu dự án](#tài-liệu-dự-án)

---

## Giới thiệu dự án

**THỔ Studio** là nền tảng web toàn diện cho studio gốm thủ công, bao gồm:

- 🛍️ **Thương mại điện tử** — Mua sắm sản phẩm gốm, lọc theo bộ sưu tập, biến thể, giỏ hàng, thanh toán QR
- 🏺 **Booking Workshop** — Đặt lịch workshop cá nhân hóa, chọn phong cách, kỹ thuật, màu men
- 🤖 **Chatbot tư vấn** — AI chatbot hỏi phong cách & kinh nghiệm → gợi ý workshop phù hợp, lưu session
- 📦 **Ceramic Tracker** — Theo dõi sản phẩm gốm của khách qua 7 giai đoạn sản xuất nội bộ
- 👨‍💼 **Dashboard Staff/Admin** — Quản lý booking, tracking, đơn hàng, ceramic jobs

---

## Công nghệ sử dụng

| Lớp | Công nghệ | Phiên bản |
|---|---|---|
| **Frontend** | React + TypeScript + Vite | React 18.3, Vite 6.3 |
| **Styling** | Tailwind CSS v4 + Custom CSS | 4.1.12 |
| **UI Components** | shadcn/ui, Radix UI, MUI | — |
| **Animation** | Motion (Framer Motion v12), IntersectionObserver | 12.x |
| **Routing** | React Router v7 | 7.13 |
| **Charts** | Recharts | 2.15 |
| **Icons** | Lucide React, MUI Icons | — |
| **Backend** | FastAPI (Python) | 0.1.0 |
| **Cơ sở dữ liệu** | SQLite (local), tương thích PostgreSQL | — |
| **Deploy** | Vercel (frontend) | — |
| **Container** | Docker + Docker Compose (backend) | — |

---

## Cấu trúc thư mục

```
phatrienwebkinhdoanh/
│
├── src/                          # Mã nguồn Frontend (React + TypeScript)
│   ├── main.tsx                  # Entry point React
│   ├── app/
│   │   ├── App.tsx               # Root component, Router, Providers
│   │   ├── components/           # Các page component chính
│   │   │   ├── HomePage.tsx          # Trang chủ
│   │   │   ├── ProductPage.tsx        # Danh sách sản phẩm
│   │   │   ├── ProductDetailPage.tsx  # Chi tiết sản phẩm
│   │   │   ├── WorkshopPage.tsx       # Danh sách workshop
│   │   │   ├── WorkshopDetailPage.tsx # Chi tiết workshop
│   │   │   ├── BookingForm.tsx         # Form đặt lịch workshop
│   │   │   ├── WorkshopCustomizer.tsx # Cá nhân hóa workshop
│   │   │   ├── CartPage.tsx           # Giỏ hàng (2 giỏ tách biệt)
│   │   │   ├── CheckoutPage.tsx       # Thanh toán + QR
│   │   │   ├── PaymentSuccess.tsx     # Thành công (confetti)
│   │   │   ├── PaymentFailure.tsx     # Thất bại
│   │   │   ├── TrackingPage.tsx       # Tra cứu đơn / vé / ceramic
│   │   │   ├── ReviewPage.tsx         # Đánh giá sản phẩm & workshop
│   │   │   ├── AboutPage.tsx          # Giới thiệu studio
│   │   │   ├── PolicyPage.tsx         # Chính sách vận chuyển, đổi trả
│   │   │   ├── StaffAdminPage.tsx     # Dashboard staff / admin
│   │   │   ├── FloatingWorkshopChatbot.tsx  # Chatbot nổi góc phải
│   │   │   ├── WorkshopChatbot.tsx    # Chatbot workshop nội tuyến
│   │   │   ├── Header.tsx             # Thanh điều hướng chính
│   │   │   ├── Footer.tsx             # Footer
│   │   │   ├── DesignPrimitives.tsx   # Token màu, typography Figma
│   │   │   ├── FigmaExportPage.tsx    # Trang xuất Figma tokens
│   │   │   ├── ui/                    # shadcn/ui components tái sử dụng
│   │   │   └── figma/                 # Components import từ Figma
│   │   ├── contexts/             # React Context (State toàn cục)
│   │   │   ├── ProductCartContext.tsx  # Giỏ hàng sản phẩm vật lý
│   │   │   └── WorkshopCartContext.tsx # Giỏ hàng booking workshop
│   │   ├── hooks/                # Custom React Hooks
│   │   │   └── useStaffData.ts        # Hook fetch dữ liệu staff dashboard
│   │   ├── lib/                  # Utilities, helpers
│   │   └── pages/                # (Dự phòng mở rộng)
│   ├── assets/                   # Ảnh, SVG, tài nguyên tĩnh
│   └── styles/                   # CSS toàn cục
│       ├── globals.css           # Reset, animations, utility classes
│       ├── theme.css             # CSS custom properties (design tokens)
│       ├── index.css             # Entry CSS
│       ├── tailwind.css          # Tailwind directives
│       ├── fonts.css             # Google Fonts import
│       └── figma-export.css      # Styles trang Figma export
│
├── backend/                      # Mã nguồn Backend (FastAPI + Python)
│   ├── app/
│   │   ├── main.py               # FastAPI app, CORS, router mount
│   │   ├── api/
│   │   │   ├── router.py         # Tổng hợp tất cả routes
│   │   │   └── routes/           # Từng nhóm endpoint
│   │   │       ├── health.py         # GET /health
│   │   │       ├── auth.py           # POST /auth/login
│   │   │       ├── products.py       # GET /products, /products/{id}
│   │   │       ├── workshops.py      # GET /workshops, /workshops/{id}
│   │   │       ├── bookings.py       # POST/GET /bookings
│   │   │       ├── cart.py           # GET/POST/DELETE /cart
│   │   │       ├── orders.py         # POST /orders
│   │   │       ├── tracking.py       # GET/POST /tracking
│   │   │       ├── reviews.py        # GET/POST /reviews
│   │   │       ├── addresses.py      # GET/POST /user/addresses
│   │   │       ├── search.py         # GET /search
│   │   │       ├── chatbot.py        # POST/PATCH /chatbot/session, GET /recommend
│   │   │       └── staff.py          # GET /staff/dashboard, bookings, trackers…
│   │   ├── core/
│   │   │   ├── config.py         # Pydantic settings (đọc .env)
│   │   │   └── logging_config.py # Cấu hình logging
│   │   ├── db/                   # Kết nối và khởi tạo database
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic request/response schemas
│   │   └── services/             # Business logic (tách khỏi routes)
│   ├── tests/                    # Pytest smoke tests
│   ├── .env.example              # Mẫu cấu hình môi trường
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Docker image backend
│   └── docker-compose.yml        # Compose: backend + (tuỳ chọn) DB
│
├── db/                           # SQL schema và seed data
│   ├── 01_schema.sql             # Schema gốc
│   ├── 02_seed_phase2.sql        # Dữ liệu mẫu giai đoạn 2
│   ├── 03_sqlite_schema.sql      # Schema SQLite đầy đủ (auto-init)
│   └── tho_demo.sqlite           # File database SQLite local
│
├── doc/                          # Tài liệu đồ án (báo cáo, sitemap, use case)
├── docs/                         # Tài liệu kỹ thuật bổ sung
├── figma-captures/               # Ảnh chụp Figma design
├── figma-captures-sliced/        # Ảnh Figma đã cắt theo component
├── figma-html-imports/           # HTML export từ Figma
├── guidelines/                   # Quy tắc code, design guidelines
├── image/                        # Ảnh tĩnh dùng trong UI
├── scripts/                      # Build/utility scripts (Node.js)
│   ├── capture-figma-pages.mjs   # Script chụp màn Figma tự động
│   └── make-figma-html-imports.mjs # Script tạo HTML import từ Figma
├── test/                         # Test files khác (ngoài pytest)
│
├── index.html                    # HTML entry point (Vite)
├── vite.config.ts                # Cấu hình Vite + plugins
├── postcss.config.mjs            # PostCSS config
├── package.json                  # Dependencies & scripts npm/pnpm
├── pnpm-workspace.yaml           # pnpm workspace config
├── vercel.json                   # Cấu hình deploy Vercel
├── default_shadcn_theme.css      # Theme mặc định shadcn/ui
├── ATTRIBUTIONS.md               # Ghi công thư viện bên thứ ba
└── README.md                     # Tài liệu này
```

---

## Bắt đầu nhanh

### Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---|---|
| Node.js | 18+ |
| npm / pnpm | npm 9+ hoặc pnpm 8+ |
| Python | 3.10+ |
| pip | 23+ |
| (Tuỳ chọn) Docker | 24+ |

---

### Chạy Frontend

```bash
# 1. Cài dependencies
npm install
# hoặc: pnpm install

# 2. Khởi động dev server (http://localhost:5173)
npm run dev
```

> **Lưu ý:** Frontend kết nối với backend ở `http://localhost:8000`. Nếu backend chưa chạy, các tính năng gọi API sẽ báo lỗi CORS/network — điều này bình thường khi dev riêng.

#### Scripts npm có sẵn

| Script | Mô tả |
|---|---|
| `npm run dev` | Khởi động Vite dev server với HMR |
| `npm run build` | Build production bundle ra `dist/` |
| `npm run capture:figma` | Chụp ảnh tự động từ Figma |
| `npm run figma:html-imports` | Tạo HTML import từ Figma captures |

---

### Chạy Backend

#### Cách 1 — Chạy trực tiếp (Python)

```bash
# 1. Vào thư mục backend
cd backend

# 2. (Khuyến nghị) Tạo virtual environment
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS / Linux

# 3. Cài dependencies
pip install -r requirements.txt

# 4. Cấu hình môi trường
copy .env.example .env
# Mở .env và sửa các biến nếu cần (xem mục Cấu hình môi trường)

# 5. Khởi động server (http://localhost:8000)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Cách 2 — Docker Compose

```bash
cd backend
docker compose up --build
```

> Backend tự động khởi tạo schema SQLite và seed data khi khởi động lần đầu.  
> Tài liệu API tương tác có sẵn tại: `http://localhost:8000/docs`

---

### Cấu hình môi trường

Sao chép file mẫu và chỉnh sửa theo nhu cầu:

```bash
cd backend
copy .env.example .env
```

| Biến | Giá trị mặc định | Mô tả |
|---|---|---|
| `APP_NAME` | `Tho Platform Backend` | Tên app FastAPI |
| `APP_ENV` | `development` | Môi trường (`development` / `production`) |
| `APP_DEBUG` | `true` | Bật debug mode |
| `APP_HOST` | `0.0.0.0` | Host bind |
| `APP_PORT` | `8000` | Port bind |
| `API_PREFIX` | `/api/v1` | Prefix tất cả API endpoint |
| `DATABASE_URL` | `sqlite:///db/tho_demo.sqlite` | URL kết nối DB (SQLite hoặc PostgreSQL) |
| `JWT_SECRET` | `replace-me` | **Bắt buộc đổi** khi production |
| `JWT_EXPIRE_MINUTES` | `120` | Thời gian hết hạn JWT (phút) |
| `IMAGE_API_PROVIDER` | `mock` | Provider ảnh (`mock` hoặc API thật) |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis (dự phòng cache/queue) |

> ⚠️ **Không commit file `.env` lên Git.** File này đã được thêm vào `.gitignore`.

---

## Tính năng chính

### Giao diện khách hàng

| Trang | Route | Mô tả |
|---|---|---|
| Trang chủ | `/` | Hero section, bộ sưu tập nổi bật, workshop gợi ý, CTA |
| Danh sách sản phẩm | `/product` | Lọc theo bộ sưu tập, loại, giá; badge hết hàng |
| Chi tiết sản phẩm | `/product/:id` | Ảnh, biến thể, thêm giỏ, kiểm tra tồn kho |
| Danh sách workshop | `/workshop` | Lọc audience, type, khoảng ngày, khoảng giá (slider) |
| Chi tiết workshop | `/workshop/:id` | Thông tin đầy đủ, slot còn lại, đặt ngay |
| Booking form | `/booking/:id` | Chọn ngày giờ, số người, thông tin khách |
| Workshop Customizer | `/workshop-customizer` | Chọn phong cách, kỹ thuật, màu men cá nhân hóa |
| Giỏ hàng | `/cart` | Hai giỏ tách biệt: sản phẩm vật lý + workshop booking |
| Checkout | `/checkout` | Form thông tin, chọn vận chuyển, thanh toán QR |
| Thanh toán thành công | `/success` | Hiệu ứng confetti, mã booking, hướng dẫn tiếp theo |
| Thanh toán thất bại | `/payment-failed` | Thông báo lỗi, nút thử lại |
| Tracking | `/tracking` | Tra cứu `ORD…` (đơn hàng), `WS…` (vé workshop), `THO…`/`CER…` (ceramic) |
| Đánh giá | `/review` | Xem và gửi review, lọc rating, studio reply |
| Giới thiệu | `/about` | Studio, đội ngũ, quy trình gốm |
| Chính sách | `/policy` | Vận chuyển, đổi trả, bảo hành |

#### Tính năng UI đặc biệt

- **Floating Chatbot** — nổi góc phải màn hình mọi trang (ẩn khi checkout/staff), tư vấn workshop
- **Workshop Chatbot** — hỏi phong cách → kinh nghiệm → mục đích → gợi ý workshop phù hợp, lưu session vào DB
- **Scroll reveal animation** — hiệu ứng fade-in khi scroll, tôn trọng `prefers-reduced-motion`
- **Page transition** — fade nhẹ khi chuyển route (React Router + CSS)
- **Design Primitives** (`/figma-export`) — xuất toàn bộ color token, typography cho Figma handoff

---

### Dashboard Staff / Admin

Route `/staff` và `/admin` dùng chung `StaffAdminPage`:

| Tab | Nội dung |
|---|---|
| **Dashboard** | Tổng booking hôm nay/tuần, doanh thu, check-in pending, tracker cần cập nhật, QC issues |
| **Quản lý Booking** | Bảng booking workshop: khách, ngày, slot, check-in, payment, tracking code, chatbot note |
| **Ceramic Tracker** | Theo dõi từng sản phẩm qua 7 giai đoạn; cập nhật stage → tự đồng bộ timeline phía khách |
| **Quản lý sản phẩm** | Danh sách đơn hàng sản phẩm vật lý theo stage xử lý |
| **Tracking nội bộ** | Gắn tracking code, xem tiến độ từ góc nhìn nhân viên |

---

### Backend API

Tất cả endpoint có prefix `/api/v1`. Swagger UI: `http://localhost:8000/docs`

| Nhóm | Endpoint chính |
|---|---|
| **Health** | `GET /health` |
| **Auth** | `POST /auth/login` |
| **Sản phẩm** | `GET /products`, `GET /products/{id}` |
| **Workshop** | `GET /workshops` *(filter: audience, type, date_range, min_price, max_price)*, `GET /workshops/{id}` |
| **Booking** | `POST /bookings`, `GET /bookings` |
| **Giỏ hàng** | `GET /cart`, `POST /cart`, `DELETE /cart` |
| **Đơn hàng** | `POST /orders` |
| **Tracking** | `GET /tracking/{code}`, `POST /tracking` *(bulk upsert)* |
| **Review** | `GET /reviews`, `POST /reviews` |
| **Địa chỉ** | `GET /user/addresses`, `POST /user/addresses` |
| **Tìm kiếm** | `GET /search` |
| **Chatbot** | `POST /chatbot/session`, `PATCH /chatbot/session/{id}`, `GET /chatbot/recommend` |
| **Staff** | `GET /staff/dashboard`, `/staff/bookings`, `/staff/trackers`, `/staff/product-jobs`, `PATCH /staff/trackers/{id}`, `GET /staff/chatbot-notes/{booking_id}` |

---

### Cơ sở dữ liệu

Schema được tự động khởi tạo khi backend start lần đầu (file `db/03_sqlite_schema.sql`).

| Bảng | Nội dung |
|---|---|
| `products` | Sản phẩm gốm, tồn kho, style_tags, biến thể |
| `workshops` | Workshop, slot, audience, type, khoảng giá |
| `workshop_bookings` | Booking của khách: ngày, slot, check-in, payment, tracking |
| `reviews` | Review sản phẩm/workshop, studio reply, helpful count, ảnh |
| `tracking_records` | Bản ghi tracking đơn hàng / workshop vé / ceramic |
| `tracking_timeline` | Từng bước timeline tracking hiển thị cho khách |
| `ceramic_trackers` | Theo dõi sản phẩm gốm qua 7 giai đoạn sản xuất nội bộ |
| `ceramic_product_jobs` | Job xử lý từng sản phẩm trong xưởng |
| `chatbot_sessions` | Lưu phiên chatbot: phong cách, kinh nghiệm, mục đích, gợi ý |
| `booking_chatbot_links` | Liên kết booking ↔ chatbot session |
| `user_addresses` | Địa chỉ giao hàng của khách |
| `orders` | Đơn hàng sản phẩm vật lý |
| `cart` | Giỏ hàng tạm thời |

> **Chuyển sang PostgreSQL:** Chỉ cần đổi `DATABASE_URL` trong `.env` thành chuỗi kết nối PostgreSQL — không cần sửa code.

---

## Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────┐
│                   TRÌNH DUYỆT                        │
│                                                     │
│  React 18 + TypeScript + Vite                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Product  │  │Workshop  │  │  Staff/Admin      │  │
│  │ Cart CTX │  │ Cart CTX │  │  Dashboard        │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│        │              │               │             │
│        └──────────────┴───────────────┘             │
│                       │                             │
│              React Router v7                        │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/REST  (fetch API)
                   │ CORS: localhost:5173 ↔ :8000
┌──────────────────▼──────────────────────────────────┐
│               FASTAPI BACKEND                        │
│                                                     │
│  /api/v1/{products, workshops, bookings, ...}        │
│  JWT Auth  │  Pydantic schemas  │  Service layer    │
└──────────────────┬──────────────────────────────────┘
                   │ SQLAlchemy / raw SQLite
┌──────────────────▼──────────────────────────────────┐
│             DATABASE (SQLite / PostgreSQL)            │
│                                                     │
│  db/tho_demo.sqlite   ←→   db/03_sqlite_schema.sql  │
└─────────────────────────────────────────────────────┘
```

### Luồng dữ liệu Ceramic Tracker

```
Staff cập nhật stage (Dashboard)
        │
        ▼
PATCH /api/v1/staff/trackers/{id}
        │
        ▼
Cập nhật ceramic_trackers + ceramic_product_jobs
        │
        ▼
Rebuild tracking_timeline → tracking_records
        │
        ▼
Khách tra cứu GET /tracking/THO-xxxx → thấy cập nhật mới
```

---

## Kiểm thử

### Chạy smoke tests (pytest)

```bash
cd backend

# Đảm bảo .env đã được cấu hình
pytest -q
```

### Kết quả tests hiện tại

| Test | Kết quả |
|---|---|
| `test_health` | ✅ `GET /health → 200` |
| `test_login` | ✅ `POST /auth/login → access_token` |
| `test_create_address` | ✅ `POST /user/addresses → address_id` |
| `test_list_workshops` | ✅ `GET /workshops → list >= 1` |
| `test_tracking_lookup` | ✅ `GET /tracking/THO-2024-0847 → ceramic type` |
| `test_create_tracking` | ✅ `POST /tracking → 201, GET lookup đúng data` |
| `test_staff_sync` | ✅ `bookings, trackers, dashboard đều trả đúng` |
| `test_create_review` | ✅ `POST /reviews → review_id` |

---

## Deploy

### Frontend — Vercel

Dự án đã cấu hình sẵn `vercel.json`. Push lên GitHub và kết nối Vercel:

```bash
# Build production
npm run build

# Deploy (Vercel CLI)
vercel --prod
```

> Vercel tự động nhận diện Vite và build `dist/` làm output directory.

### Backend — Docker

```bash
cd backend

# Build và chạy container
docker compose up --build -d

# Xem logs
docker compose logs -f
```

---

## Hướng phát triển tiếp theo

- [ ] **Thanh toán thật** — Tích hợp VNPay / MoMo / ZaloPay
- [ ] **Slot reservation** — Giữ slot workshop 15 phút khi đang thanh toán (`slot_reservations` table)
- [ ] **Vận chuyển thật** — Kết nối API GHN / GHTK, tính phí ship realtime
- [ ] **Email notification** — Thông báo khi sản phẩm có hàng lại, cập nhật trạng thái đơn
- [ ] **Đăng nhập mạng xã hội** — Google / Facebook OAuth
- [ ] **Dashboard analytics** — Biểu đồ doanh thu theo ngày/tháng, hành vi khách hàng
- [ ] **Bảo vệ review** — Chỉ cho phép review sau khi mua hàng hoặc hoàn thành workshop
- [ ] **Scale production** — Chuyển sang PostgreSQL + Redis cache
- [ ] **About Us nâng cấp** — Nghệ nhân, không gian xưởng, quy trình gốm video

---

## Tài liệu dự án

Thư mục `doc/` chứa tài liệu đồ án đầy đủ:

| File | Nội dung |
|---|---|
| `BAO_CAO_THO_STUDIO.md` | Báo cáo đồ án đầy đủ (Chương 1–5) |
| `01_sitemap_wireframe.md` | Sitemap và wireframe tất cả màn hình |
| `02_prototype_ui.md` | Mô tả prototype Figma |
| `03_case_study.md` | Phân tích use case và BPMN |
| `04_use_case_detail.md` | Chi tiết use case từng actor |
| `CHUONG_4_SITEMAP_WIREFRAME_PROTOTYPE_CASE_STUDY.md` | Tổng hợp Chương 4 |

---

<p align="center">
  Made with ❤️ for <strong>THỔ Studio</strong> — where clay meets craft.
</p>
