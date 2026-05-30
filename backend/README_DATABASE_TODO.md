# README — Database cần chỉnh cho dự án THỔ

File này ghi lại các điểm cần sửa database để khớp với nghiệp vụ đã chốt cho website THỔ, đặc biệt là 3 luồng:

1. Đặt lịch workshop.
2. Checkout giỏ hàng lai: sản phẩm vật lý + vé workshop.
3. Ceramic Tracker và Final Disposition sau workshop.

> Trạng thái hiện tại: database đã có nền tảng cho product, studio, workshop, user, order và ceramic tracking cơ bản. Tuy nhiên schema hiện tại chưa đủ để thể hiện đúng nghiệp vụ tách biệt giữa `Order Tracking` và `Ceramic Tracker`.

---

## 1. Các vấn đề lớn hiện tại

### 1.1. Ceramic Tracking đang còn đơn giản quá

Hiện bảng `ceramic_tracking` đang lưu nhiều thông tin dạng text trực tiếp:

- `booking_code`
- `customer_name`
- `studio_name`
- `product_desc`
- `stage_history JSONB`

Cách này dùng được cho demo nhanh, nhưng chưa tốt nếu cần đúng ERD/nghiệp vụ vì:

- chưa liên kết trực tiếp với vé workshop/ticket;
- chưa có bảng lịch sử stage riêng;
- chưa có ảnh thành phẩm sau khi Ready;
- chưa có QC status;
- chưa có trạng thái tracker tổng thể;
- chưa có final disposition;
- chưa có shipping order riêng cho thành phẩm workshop.

### 1.2. Chưa tách rõ Shipping Order và Ceramic Tracker

Database hiện có `orders` và `order_items`, nhưng chưa có:

- `payments`
- `shipping_orders`
- `workshop_tickets`
- `tracker_shipping_orders`
- `final_dispositions`

Điều này làm hệ thống dễ bị hiểu sai rằng thành phẩm workshop được giao/thu phí ship ngay trong checkout ban đầu. Theo nghiệp vụ đã chốt, điều này là sai.

### 1.3. Workshop resource chưa đủ để kiểm tra slot đúng nghiệp vụ

Hiện bảng `workshops` có:

- `capacity`
- `booked`
- `instructor_slots`

Nhưng BPMN 1 yêu cầu kiểm tra đồng thời:

- slot còn chỗ;
- instructor có rảnh;
- equipment đủ và đang hoạt động.

Vì vậy nên bổ sung các bảng:

- `instructors`
- `slot_instructors`
- `equipment`

### 1.4. Seed data chưa đủ cho UI demo

File seed hiện có nhiều product/studio/workshop, nhưng còn thiếu dữ liệu quan trọng cho UI:

- users/customer mẫu;
- addresses;
- orders mẫu;
- workshop bookings/tickets;
- ceramic trackers ở nhiều trạng thái;
- notifications;
- final disposition;
- tracker shipping order.

---

## 2. Bảng nên bổ sung

## 2.1. `payments`

Dùng để lưu cả thanh toán checkout ban đầu và thanh toán phí ship phát sinh sau khi thành phẩm workshop Ready.

```sql
CREATE TABLE IF NOT EXISTS payments (
    payment_id      SERIAL PRIMARY KEY,
    order_id        INT REFERENCES orders(order_id),
    tracking_id     VARCHAR(20) REFERENCES ceramic_tracking(tracking_id),
    payment_type    VARCHAR(40) NOT NULL,
    amount          DECIMAL(12,0) NOT NULL,
    method          VARCHAR(40) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'pending',
    paid_at         TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_payment_owner CHECK (
        order_id IS NOT NULL OR tracking_id IS NOT NULL
    ),
    CONSTRAINT chk_payment_type CHECK (
        payment_type IN ('CHECKOUT', 'WORKSHOP_PRODUCT_SHIPPING')
    )
);
```

Ý nghĩa:

- `CHECKOUT`: thanh toán sản phẩm vật lý + vé workshop ban đầu.
- `WORKSHOP_PRODUCT_SHIPPING`: phí ship riêng cho thành phẩm workshop sau khi Ready.

---

## 2.2. `shipping_orders`

Dùng cho sản phẩm vật lý mua sẵn trong ecommerce.

```sql
CREATE TABLE IF NOT EXISTS shipping_orders (
    shipping_order_id SERIAL PRIMARY KEY,
    order_id          INT NOT NULL REFERENCES orders(order_id),
    address_id        INT NOT NULL REFERENCES user_addresses(address_id),
    logistics_partner VARCHAR(100),
    shipping_fee      DECIMAL(12,0) NOT NULL DEFAULT 0,
    status            VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Trạng thái đề xuất:

```text
pending, packing, shipping, delivered, failed, cancelled
```

Lưu ý: bảng này chỉ dành cho sản phẩm vật lý có sẵn, không dùng cho thành phẩm workshop.

---

## 2.3. `workshop_tickets`

Dùng để lưu vé workshop và QR check-in sau khi khách thanh toán thành công.

```sql
CREATE TABLE IF NOT EXISTS workshop_tickets (
    ticket_id        SERIAL PRIMARY KEY,
    booking_id       INT REFERENCES workshop_bookings(booking_id),
    order_item_id    INT REFERENCES order_items(item_id),
    workshop_id      INT NOT NULL REFERENCES workshops(id),
    user_id          INT REFERENCES users(user_id),
    qr_code          TEXT NOT NULL,
    check_in_status  VARCHAR(30) NOT NULL DEFAULT 'not_checked_in',
    checked_in_at    TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Trạng thái đề xuất:

```text
not_checked_in, checked_in, cancelled
```

---

## 2.4. `tracker_history`

Nên tách lịch sử stage ra khỏi JSONB để dễ query, lọc, hiển thị timeline và kiểm tra thứ tự stage.

```sql
CREATE TABLE IF NOT EXISTS tracker_history (
    history_id    SERIAL PRIMARY KEY,
    tracking_id   VARCHAR(20) NOT NULL REFERENCES ceramic_tracking(tracking_id) ON DELETE CASCADE,
    stage_slug    VARCHAR(50) NOT NULL REFERENCES ceramic_stages(slug),
    updated_by    INT REFERENCES users(user_id),
    note          TEXT,
    image_url     TEXT,
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 2.5. `final_dispositions`

Lưu quyết định cuối cùng của khách sau khi sản phẩm Ready.

```sql
CREATE TABLE IF NOT EXISTS final_dispositions (
    disposition_id          SERIAL PRIMARY KEY,
    tracking_id             VARCHAR(20) NOT NULL UNIQUE REFERENCES ceramic_tracking(tracking_id) ON DELETE CASCADE,
    action                  VARCHAR(40) NOT NULL,
    note                    TEXT,
    confirmed_by_customer   BOOLEAN NOT NULL DEFAULT FALSE,
    decided_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_disposition_action CHECK (
        action IN ('PICKUP_AT_STORE', 'SHIPPED', 'DONATED_TO_STUDIO')
    )
);
```

---

## 2.6. `tracker_shipping_orders`

Dùng riêng cho giao thành phẩm workshop sau khi khách đã thanh toán phí ship riêng.

```sql
CREATE TABLE IF NOT EXISTS tracker_shipping_orders (
    tracker_shipping_id SERIAL PRIMARY KEY,
    tracking_id          VARCHAR(20) NOT NULL UNIQUE REFERENCES ceramic_tracking(tracking_id) ON DELETE CASCADE,
    address_id           INT NOT NULL REFERENCES user_addresses(address_id),
    shipping_payment_id  INT REFERENCES payments(payment_id),
    logistics_partner    VARCHAR(100),
    shipping_fee         DECIMAL(12,0) NOT NULL DEFAULT 0,
    status               VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Trạng thái đề xuất:

```text
pending, packing, shipping, delivered, failed, cancelled
```

Nếu phạm vi UI chỉ dừng ở “lập hồ sơ vận chuyển” thì chỉ cần dùng status `pending` hoặc `created` là đủ.

---

## 2.7. `notifications`

Dùng để lưu thông báo cho customer.

```sql
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    tracking_id     VARCHAR(20) REFERENCES ceramic_tracking(tracking_id),
    order_id        INT REFERENCES orders(order_id),
    type            VARCHAR(40) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    read_status     BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at         TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Loại notification đề xuất:

```text
BOOKING, ORDER, TRACKER_STAGE, READY, KILN_EXCEPTION, SHIPPING, REMINDER
```

Lưu ý nghiệp vụ: không cần gửi notification ở mọi stage. Hệ thống vẫn lưu đủ stage history, nhưng chỉ thông báo ở các mốc khách cần biết hoặc cần hành động.

---

## 2.8. `instructors`, `equipment`, `slot_instructors`

Dùng để hỗ trợ BPMN 1: kiểm tra slot + instructor + equipment.

```sql
CREATE TABLE IF NOT EXISTS instructors (
    instructor_id    SERIAL PRIMARY KEY,
    user_id          INT REFERENCES users(user_id),
    bio              TEXT,
    buffer_time_min  INT NOT NULL DEFAULT 15,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS slot_instructors (
    workshop_id    INT NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    instructor_id  INT NOT NULL REFERENCES instructors(instructor_id) ON DELETE CASCADE,
    PRIMARY KEY (workshop_id, instructor_id)
);

CREATE TABLE IF NOT EXISTS equipment (
    equipment_id    SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    type            VARCHAR(100) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'available',
    studio_id       INT REFERENCES studios(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Trạng thái equipment đề xuất:

```text
available, maintenance, broken, reserved
```

---

## 3. Bảng hiện có nên mở rộng

## 3.1. `ceramic_tracking`

Nên thêm các cột sau:

```sql
ALTER TABLE ceramic_tracking
ADD COLUMN IF NOT EXISTS ticket_id INT REFERENCES workshop_tickets(ticket_id),
ADD COLUMN IF NOT EXISTS qc_status VARCHAR(30) NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS product_image_url TEXT,
ADD COLUMN IF NOT EXISTS tracker_status VARCHAR(40) NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS disposition_action VARCHAR(40),
ADD COLUMN IF NOT EXISTS ready_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP;
```

Giá trị `tracker_status` đề xuất:

```text
active, ready, waiting_decision, waiting_shipping_payment, closed, exception
```

Giá trị `qc_status` đề xuất:

```text
pending, passed, failed
```

Giá trị `disposition_action`:

```text
PICKUP_AT_STORE, SHIPPED, DONATED_TO_STUDIO
```

---

## 3.2. `orders`

Nên bổ sung `payment_status` để tách trạng thái đơn và trạng thái thanh toán.

```sql
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) NOT NULL DEFAULT 'pending';
```

Giá trị đề xuất:

```text
pending, paid, failed, refunded
```

---

## 3.3. `order_items`

Hiện bảng `order_items` đang có `product_id` và `workshop_id`. Cách này dùng được, nhưng nếu muốn đúng ERD hơn có thể thêm:

```sql
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS item_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS ref_id INT;
```

Nếu muốn giữ schema hiện tại đơn giản thì không bắt buộc. Chỉ cần đảm bảo rule:

- item có `product_id` → sản phẩm vật lý;
- item có `workshop_id` → vé workshop.

---

## 4. Ceramic stages cần chỉnh lại cho đúng nghiệp vụ

Hiện seed đang dùng các stage kiểu:

```text
dang_phoi, trang_men, cho_nung, dang_nung, lam_nguoi, kiem_tra, dong_goi, san_sang
```

Nên đổi hoặc bổ sung stage chuẩn theo BPMN 3:

```text
forming
Drying
bisque_firing
Glazing
glaze_firing
qc_check
ready
closed
```

Đề xuất seed:

```sql
INSERT INTO ceramic_stages (stage_order, slug, name, emoji, duration_days) VALUES
  (1, 'forming', 'Forming', '🏺', 0),
  (2, 'drying', 'Drying', '🌬️', 3),
  (3, 'bisque_firing', 'Bisque Firing', '🔥', 1),
  (4, 'glazing', 'Glazing', '🎨', 2),
  (5, 'glaze_firing', 'Glaze Firing', '🔥', 1),
  (6, 'qc_check', 'QC Check', '🔍', 1),
  (7, 'ready', 'Ready', '✅', 0),
  (8, 'closed', 'Closed', '📦', 0)
ON CONFLICT (stage_order) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  duration_days = EXCLUDED.duration_days;
```

---

## 5. Seed data cần bổ sung

Để UI demo đủ đẹp, cần seed ít nhất các nhóm dữ liệu sau.

### 5.1. Users

Tối thiểu:

- 5 customer;
- 2 staff/admin;
- 2 instructor.

Ví dụ:

```text
Nguyễn Minh Anh
Trần Gia Hân
Lê Hoàng Nam
Phạm Khánh Linh
Võ An Nhiên
```

### 5.2. Addresses

Mỗi customer nên có ít nhất 1 địa chỉ để demo giao hàng.

### 5.3. Orders và order_items

Cần có case:

1. Order chỉ có sản phẩm vật lý.
2. Order chỉ có vé workshop.
3. Hybrid order: vừa có sản phẩm vật lý vừa có vé workshop.

Case số 3 rất quan trọng để chứng minh BPMN 2 split order đúng.

### 5.4. Workshop tickets

Mỗi booking workshop sau thanh toán thành công cần có ticket + QR.

### 5.5. Ceramic trackers

Cần ít nhất 6 tracker mẫu:

| Tracking ID | Trạng thái | Mục đích UI |
|---|---|---|
| TRK-THO-1001 | Drying | Đang xử lý |
| TRK-THO-1002 | Glazing | Đang xử lý giữa quy trình |
| TRK-THO-1003 | Ready | Chờ khách chọn cách nhận |
| TRK-THO-1004 | Exception - Cracked | Lỗi nung / lỗi QC |
| TRK-THO-1005 | Closed + PICKUP_AT_STORE | Đã tự đến lấy |
| TRK-THO-1006 | Closed + DONATED_TO_STUDIO | Đã tặng lại studio |

### 5.6. Notifications

Seed các thông báo:

- tracker created;
- stage update quan trọng;
- product ready;
- kiln exception;
- reminder chọn cách nhận;
- shipping payment success.

---

## 6. API sẽ cần sau khi sửa database

Sau khi DB ổn, backend nên có các route phục vụ UI:

```text
GET    /api/v1/tracking/{tracking_id}
GET    /api/v1/tracking/user/{user_id}
POST   /api/v1/tracking/{tracking_id}/stage
POST   /api/v1/tracking/{tracking_id}/qc
POST   /api/v1/tracking/{tracking_id}/disposition
POST   /api/v1/tracking/{tracking_id}/shipping-payment
GET    /api/v1/notifications/user/{user_id}
```

Trong đó:

- customer dùng `GET tracking` và `POST disposition`;
- staff/admin dùng `POST stage`, `POST qc`;
- hệ thống dùng notifications để báo Ready/Exception/Reminder.

---

## 7. Checklist ưu tiên làm

### Ưu tiên 1 — để UI tracking chạy được

- [ ] Thêm cột mới vào `ceramic_tracking`.
- [ ] Thêm bảng `tracker_history`.
- [ ] Thêm bảng `final_dispositions`.
- [ ] Seed 6 tracker mẫu.
- [ ] Seed stage history cho từng tracker.

### Ưu tiên 2 — để đúng nghiệp vụ checkout và order splitting

- [ ] Thêm bảng `payments`.
- [ ] Thêm bảng `shipping_orders`.
- [ ] Thêm bảng `workshop_tickets`.
- [ ] Seed hybrid order gồm sản phẩm vật lý + vé workshop.

### Ưu tiên 3 — để đúng final disposition

- [ ] Thêm bảng `tracker_shipping_orders`.
- [ ] Seed tracker Ready chọn giao tận nhà.
- [ ] Seed payment phí ship riêng.
- [ ] Seed tracker donate/pickup/ship closed.

### Ưu tiên 4 — để đúng BPMN 1 resource check

- [ ] Thêm bảng `instructors`.
- [ ] Thêm bảng `slot_instructors`.
- [ ] Thêm bảng `equipment`.
- [ ] Seed case instructor/equipment đủ và không đủ.

---

## 8. Lưu ý quan trọng cho báo cáo

### Order Tracking và Ceramic Tracker phải tách nhau

- `shipping_orders` dùng cho sản phẩm vật lý mua sẵn.
- `ceramic_tracking` dùng cho tiến độ hoàn thiện thành phẩm workshop.
- `tracker_shipping_orders` chỉ phát sinh sau khi ceramic tracker đạt Ready và khách chọn giao tận nhà.

### Không thu phí ship thành phẩm workshop ở checkout ban đầu

Khi khách mua vé workshop, hệ thống chỉ tạo:

- booking;
- workshop ticket;
- QR check-in.

Thành phẩm workshop chưa tồn tại tại thời điểm checkout, nên không được tạo shipping order cho nó ở BPMN 2.

### Notification không cần bắn ở mọi stage

Database vẫn lưu đầy đủ stage history. Notification chỉ nên gửi ở các mốc:

- tracker được tạo;
- sản phẩm Ready;
- có lỗi nung/QC;
- reminder khi khách chưa chọn cách nhận;
- thanh toán phí ship thành công.

---

## 9. Gợi ý cách làm để không phá code hiện tại

Không nên xóa schema cũ ngay. Nên làm theo hướng an toàn:

1. Giữ các bảng hiện có.
2. Dùng `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` để mở rộng.
3. Tạo thêm bảng mới bằng `CREATE TABLE IF NOT EXISTS`.
4. Seed thêm dữ liệu demo bằng `ON CONFLICT DO NOTHING`.
5. Sau khi UI/API ổn mới refactor lại schema nếu cần.

---

## 10. Kết luận

Database hiện tại đủ để demo product/workshop cơ bản, nhưng chưa đủ cho toàn bộ nghiệp vụ THỔ. Phần cần ưu tiên nhất là hoàn thiện cụm tracking:

```text
WorkshopTicket → CeramicTracking → TrackerHistory → Ready → FinalDisposition → TrackerShippingOrder nếu giao tận nhà
```

Khi cụm này rõ, UI tracking, BPMN 3, Use Case và ERD sẽ khớp nhau hơn nhiều.
