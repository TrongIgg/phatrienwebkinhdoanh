PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    collection TEXT NOT NULL DEFAULT 'Signature',
    price_vnd INTEGER NOT NULL,
    image_url TEXT,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    style_tags TEXT NOT NULL DEFAULT '[]',
    rating REAL NOT NULL DEFAULT 5.0,
    review_count INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_qty);

CREATE TABLE IF NOT EXISTS workshops (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    full_date TEXT NOT NULL,
    start_date TEXT NOT NULL,
    time TEXT NOT NULL,
    instructor TEXT NOT NULL,
    price_vnd INTEGER NOT NULL,
    package TEXT NOT NULL,
    audience TEXT NOT NULL DEFAULT 'single_friendly',
    workshop_type TEXT NOT NULL DEFAULT 'ceramic',
    available_slots INTEGER NOT NULL DEFAULT 0,
    total_slots INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'available',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workshops_start_date ON workshops(start_date);
CREATE INDEX IF NOT EXISTS idx_workshops_audience ON workshops(audience);
CREATE INDEX IF NOT EXISTS idx_workshops_type ON workshops(workshop_type);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_logins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    email TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_logins_user ON social_logins(user_id);

CREATE TABLE IF NOT EXISTS chatbot_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    style_preference TEXT,
    experience_level TEXT,
    purpose TEXT,
    custom_request TEXT,
    recommended_workshop_id INTEGER REFERENCES workshops(id),
    behavior_tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_user ON chatbot_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_recommend ON chatbot_sessions(recommended_workshop_id);

CREATE TABLE IF NOT EXISTS user_behavior_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    tag TEXT NOT NULL,
    source TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_behavior_tags_user ON user_behavior_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_tags_tag ON user_behavior_tags(tag);

CREATE TABLE IF NOT EXISTS reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_type TEXT NOT NULL DEFAULT 'product',
    target_id INTEGER,
    parent_id INTEGER REFERENCES reviews(review_id),
    is_studio_reply INTEGER NOT NULL DEFAULT 0,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    review_type TEXT,
    has_verified_purchase INTEGER NOT NULL DEFAULT 0,
    image_urls TEXT NOT NULL DEFAULT '[]',
    name TEXT NOT NULL,
    title TEXT,
    comment TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_target ON reviews(target_type, target_id);

CREATE TABLE IF NOT EXISTS tracking_records (
    code TEXT PRIMARY KEY,
    tracking_type TEXT NOT NULL,
    status TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    manager_name TEXT,
    participant_count INTEGER,
    checkin_status TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracking_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_code TEXT NOT NULL REFERENCES tracking_records(code) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    label TEXT NOT NULL,
    state TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tracking_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_code TEXT REFERENCES tracking_records(code) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    stage TEXT,
    title TEXT,
    url TEXT NOT NULL,
    uploaded_by TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tracking_media_code ON tracking_media(tracking_code);

INSERT OR IGNORE INTO products
    (id, sku, name, category, collection, price_vnd, image_url, stock_qty, rating, review_count)
VALUES
    (1, 'THO-CELADON-S', 'Binh gom men celadon', 'decor', 'Men xanh nhe', 380000, NULL, 8, 4.8, 24),
    (2, 'THO-DIY-KIT', 'Bo DIY Kit to mau men', 'kit', 'Tu tay lam gom', 220000, NULL, 24, 4.7, 18),
    (3, 'THO-CUP-MOON', 'Ly gom trang anh trang', 'cup', 'Ban tra cham', 260000, NULL, 14, 4.9, 31),
    (4, 'THO-VASE-SAND', 'Lo hoa dat moc than cao', 'decor', 'Dat moc hien dai', 760000, NULL, 5, 4.6, 12),
    (5, 'THO-PLATE-LOTUS', 'Dia gom hoa sen ve tay', 'tableware', 'Ban an nghe thuat', 540000, NULL, 0, 4.8, 20),
    (6, 'THO-PLATE-STONE', 'Dia da moc', 'tableware', 'Ban an nghe thuat', 460000, NULL, 7, 4.6, 18),
    (7, 'THO-VASE-BLACK', 'Binh den khoi', 'decor', 'Dat moc hien dai', 820000, NULL, 4, 4.9, 16),
    (8, 'THO-VASE-SAND', 'Binh cat bien', 'decor', 'Dat moc hien dai', 690000, NULL, 6, 4.7, 19),
    (9, 'THO-JAR-MILK', 'Hu sua men kem', 'decor', 'Men sua', 330000, NULL, 10, 4.8, 27),
    (10, 'THO-TRAY-CLOUD', 'Khay may men trang', 'decor', 'Men sua', 290000, NULL, 11, 4.7, 15),
    (11, 'THO-INCENSE-ASH', 'De huong tro xam', 'decor', 'Men khoi', 180000, NULL, 18, 4.6, 13),
    (12, 'THO-CANDLE-CLAY', 'Chen nen dat nung', 'decor', 'Men khoi', 240000, NULL, 14, 4.8, 21),
    (13, 'THO-KIT-FAMILY', 'DIY kit gia dinh', 'kit', 'Tu tay lam gom', 620000, NULL, 8, 4.9, 29),
    (14, 'THO-KIT-COUPLE', 'DIY kit cap doi', 'kit', 'Tu tay lam gom', 390000, NULL, 12, 4.8, 25),
    (15, 'THO-SCULPT-BIRD', 'Tuong gom chim nho', 'decor', 'Tuong nho', 350000, NULL, 6, 4.6, 11),
    (16, 'THO-SCULPT-HOUSE', 'Nha gom mini', 'decor', 'Tuong nho', 410000, NULL, 3, 4.8, 14),
    (17, 'THO-LAMP-WARM', 'Den gom anh am', 'decor', 'Anh sang gom', 1180000, NULL, 2, 4.9, 9),
    (18, 'THO-LAMP-MOON', 'Den trang men sua', 'decor', 'Anh sang gom', 1320000, NULL, 0, 4.9, 7),
    (19, 'THO-CUP-DAWN', 'Ly su binh minh', 'cup', 'Ban tra cham', 260000, NULL, 12, 4.8, 34),
    (20, 'THO-CUP-MOSS', 'Cap ly men reu', 'cup', 'Ban tra cham', 420000, NULL, 9, 4.9, 41);

INSERT OR IGNORE INTO workshops
    (id, name, full_date, start_date, time, instructor, price_vnd, package, audience, workshop_type, available_slots, total_slots)
VALUES
    (1, 'Nan gom co ban', 'Thu Bay, 31/05/2026', '2026-05-31', '09:00 - 11:30', 'Nghe nhan Minh Chau', 490000, '1 nguoi', 'single_friendly', 'basic', 8, 12),
    (2, 'Trang tri gom co ban', 'Chu Nhat, 01/06/2026', '2026-06-01', '14:00 - 16:30', 'Nghe nhan Hoai An', 380000, '1 nguoi', 'single_friendly', 'painting', 4, 10),
    (3, 'Combo co doi co cap', 'Thu Bay, 07/06/2026', '2026-06-07', '09:00 - 12:00', 'Nghe nhan Minh Chau', 600000, '2 nguoi', 'couple_friendly', 'combo', 6, 10),
    (4, 'Workshop gia dinh cuoi tuan', 'Chu Nhat, 08/06/2026', '2026-06-08', '09:00 - 11:30', 'Nghe nhan Bao Tran', 1250000, 'Gia dinh 3-4 nguoi', 'family_friendly', 'family', 3, 8),
    (5, 'Goi premium ban xoay rieng', 'Thu Bay, 14/06/2026', '2026-06-14', '15:00 - 18:00', 'Nghe nhan Minh Chau', 1450000, '1 nguoi', 'single_friendly', 'premium', 2, 6),
    (6, 'Chen tra va men sua', 'Chu Nhat, 15/06/2026', '2026-06-15', '09:30 - 12:00', 'Nghe nhan An Nhien', 520000, '1 nguoi', 'single_friendly', 'tea', 7, 12),
    (7, 'Tuong gom mini cuoi tuan', 'Thu Bay, 21/06/2026', '2026-06-21', '13:30 - 16:00', 'Nghe nhan Hoai An', 450000, '1 nguoi', 'single_friendly', 'sculpture', 9, 14),
    (8, 'Nhom ban ve dia gom', 'Chu Nhat, 22/06/2026', '2026-06-22', '15:00 - 17:30', 'Nghe nhan Bao Tran', 880000, 'Nhom 3 nguoi', 'couple_friendly', 'painting', 5, 12),
    (9, 'Gom va hoa kho gia dinh', 'Thu Bay, 28/06/2026', '2026-06-28', '09:00 - 11:30', 'Nghe nhan An Nhien', 1180000, 'Gia dinh 3 nguoi', 'family_friendly', 'family', 4, 9),
    (10, 'Dem dat va anh nen', 'Chu Nhat, 29/06/2026', '2026-06-29', '18:00 - 20:30', 'Nghe nhan Minh Chau', 990000, '2 nguoi', 'couple_friendly', 'combo', 6, 10);

INSERT OR IGNORE INTO users
    (id, email, display_name, phone)
VALUES
    (1, 'thuha@email.com', 'Nguyen Thu Ha', '0978123456'),
    (2, 'minha@email.com', 'Nguyen Minh A', '0912345678');

INSERT OR IGNORE INTO chatbot_sessions
    (session_id, user_id, style_preference, experience_level, purpose, custom_request, recommended_workshop_id, behavior_tags)
VALUES
    ('chat-demo-gift', 1, 'colorful', 'first_time', 'gift', 'Muon lam cap ly tang ban than, mau am va co the viet ten nho.', 3, '["gifting","first_timer","color_lover","duo"]'),
    ('chat-demo-calm', 2, 'natural', 'some', 'relax', 'Muon mot chiec chen tra don gian de ban lam viec.', 6, '["evening_learner","natural"]');

INSERT OR IGNORE INTO user_behavior_tags
    (user_id, tag, source)
VALUES
    (1, 'gifting', 'chatbot'),
    (1, 'duo', 'chatbot'),
    (2, 'evening_learner', 'chatbot'),
    (2, 'natural', 'chatbot');

INSERT OR IGNORE INTO reviews
    (review_id, target_type, target_id, name, title, comment, rating)
VALUES
    (1, 'workshop', 1, 'Nguyen Thu Ha', 'Rat dang thu', 'Khong gian am, nghe nhan chi tung buoc nen minh khong bi ngop.', 5),
    (2, 'product', 3, 'Le Minh Anh', 'Ly dep va cam chac tay', 'Men sang, dong goi can than, hop lam qua tang.', 5),
    (3, 'product', 4, 'Pham Gia Han', 'Mon qua co hon', 'Dia men kem len mau mem, nhin gan thay ro net co thu cong.', 5),
    (4, 'workshop', 5, 'Do Nhat Nam', 'Workshop vua du cham', 'Buoi ban xoay rieng khong voi, du thoi gian sua dang ly theo dung tay minh.', 5),
    (5, 'workshop', 6, 'Mai Thanh Van', 'Theo doi thanh pham ro rang', 'Sau workshop co ma tracking nen biet san pham dang phoi kho hay vao lo.', 4),
    (6, 'product', 8, 'Hoang Bao Ngoc', 'Dong goi yen tam', 'Binh nho den tay nguyen ven, lop men ngoai doi sau hon anh.', 5),
    (7, 'product', 15, 'Tran Quynh Chi', 'Hop cho gia dinh', 'DIY kit co nhieu phoi, mau men de dung va hop mot buoi toi cuoi tuan.', 5),
    (8, 'workshop', 9, 'Nguyen Duc Anh', 'Di cung nha rat vui', 'Workshop gia dinh co nhip huong dan nhe, tre con cung theo kip.', 5);

INSERT OR IGNORE INTO tracking_records
    (code, tracking_type, status, title, message, manager_name, participant_count, checkin_status)
VALUES
    ('THO-2024-0847', 'ceramic', 'drying', 'Ly gom - Nguyen Minh A', 'San pham dang phoi kho sau workshop.', 'Nhan vien 2', 1, NULL),
    ('WS052826', 'workshop', 'confirmed', 'Ve workshop Nan gom co ban', 'Ve da xac nhan. QR check-in gui qua email/SMS.', 'Anh Quan', 2, 'pending'),
    ('ORD28052026', 'order', 'packed_waiting_carrier', 'Don hang THO Studio', 'Don hang da thanh toan va dang cho don vi van chuyen.', 'Chi Linh', NULL, NULL);

INSERT OR IGNORE INTO tracking_timeline
    (tracking_code, stage, label, state, position)
VALUES
    ('THO-2024-0847', 'forming', 'Da tao hinh', 'done', 1),
    ('THO-2024-0847', 'drying', 'Phoi kho', 'current', 2),
    ('THO-2024-0847', 'bisque_firing', 'Nung so', 'waiting', 3),
    ('THO-2024-0847', 'glazing', 'Trang men', 'waiting', 4),
    ('ORD28052026', 'packed', 'Da dong goi', 'done', 1),
    ('ORD28052026', 'waiting_carrier', 'Doi don vi van chuyen', 'current', 2),
    ('ORD28052026', 'delivering', 'Dang giao', 'waiting', 3),
    ('ORD28052026', 'received', 'Da nhan', 'waiting', 4);

-- ── Staff back-office (dong bo customer + staff) ─────────────────────────────

CREATE TABLE IF NOT EXISTS workshop_bookings (
    booking_code TEXT PRIMARY KEY,
    workshop_id INTEGER REFERENCES workshops(id),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    product_name TEXT NOT NULL DEFAULT '',
    booking_date TEXT NOT NULL,
    booking_time TEXT NOT NULL,
    people_count INTEGER NOT NULL DEFAULT 1,
    price_vnd INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_status TEXT NOT NULL DEFAULT 'waiting',
    staff_name TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    checkin_status TEXT NOT NULL DEFAULT 'pending',
    chatbot_session_id TEXT REFERENCES chatbot_sessions(session_id),
    tracking_code TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_workshop ON workshop_bookings(workshop_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON workshop_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_checkin ON workshop_bookings(checkin_status);

CREATE TABLE IF NOT EXISTS booking_chatbot_links (
    booking_code TEXT PRIMARY KEY REFERENCES workshop_bookings(booking_code) ON DELETE CASCADE,
    session_id TEXT NOT NULL REFERENCES chatbot_sessions(session_id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_booking_chatbot_session ON booking_chatbot_links(session_id);

CREATE TABLE IF NOT EXISTS ceramic_trackers (
    tracker_id TEXT PRIMARY KEY,
    booking_code TEXT NOT NULL REFERENCES workshop_bookings(booking_code),
    tracking_code TEXT REFERENCES tracking_records(code),
    customer_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    workshop_name TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'created',
    qc_status TEXT NOT NULL DEFAULT 'normal',
    updated_at TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    kiln_batch TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_trackers_booking ON ceramic_trackers(booking_code);
CREATE INDEX IF NOT EXISTS idx_trackers_stage ON ceramic_trackers(stage);

CREATE TABLE IF NOT EXISTS ceramic_product_jobs (
    job_id TEXT PRIMARY KEY,
    booking_code TEXT NOT NULL REFERENCES workshop_bookings(booking_code),
    customer_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    stage TEXT NOT NULL,
    job_status TEXT NOT NULL,
    image_note TEXT NOT NULL DEFAULT '',
    owner_name TEXT NOT NULL,
    due_date TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_jobs_status ON ceramic_product_jobs(job_status);

INSERT OR IGNORE INTO workshop_bookings
    (booking_code, workshop_id, customer_name, phone, email, product_name, booking_date, booking_time, people_count, price_vnd, status, payment_status, staff_name, note, checkin_status, tracking_code)
VALUES
    ('BK010', 1, 'Nguyen Minh A', '0912345678', 'minha@email.com', 'Ly gom', '24/05/2026', '09:00', 2, 500000, 'pending', 'paid', 'Nhan vien 2', 'Khach can check-in va tao tracker.', 'pending', NULL),
    ('BK011', 1, 'Pham Thi D', '0923456789', 'phamd@email.com', 'To gom', '24/05/2026', '10:30', 2, 500000, 'confirmed', 'paid', 'Nhan vien 1', 'Chuan bi ban doi.', 'checked_in', NULL),
    ('BK008', 5, 'Le Van C', '0934567890', 'levanc@email.com', 'Bat gom', '23/05/2026', '14:00', 1, 750000, 'completed', 'paid', 'Nhan vien 3', 'Da gui anh thanh pham.', 'checked_in', NULL),
    ('BK009', 2, 'Tran Thi B', '0945678901', 'tranb@email.com', 'Dia gom', '23/05/2026', '15:30', 3, 660000, 'confirmed', 'waiting', 'Nhan vien 1', 'Nhac thanh toan truoc ca.', 'pending', NULL),
    ('BK007', 3, 'Nguyen Van A', '0956789012', 'vana@email.com', 'Binh gom', '22/05/2026', '17:00', 2, 600000, 'completed', 'paid', 'Nhan vien 2', 'Da tao tracker.', 'checked_in', NULL),
    ('BK006', 1, 'Hoang Anh Q', '0967890123', 'anhq@email.com', 'Chen gom', '22/05/2026', '11:00', 1, 350000, 'cancelled', 'refund', 'Nhan vien 2', 'Da xu ly hoan tien.', 'cancelled', NULL),
    ('WS052826', 1, 'Nguyen Thu Ha', '0978123456', 'thuha@email.com', 'Ly gom tu workshop', '31/05/2026', '09:00', 2, 490000, 'confirmed', 'paid', 'Anh Quan', 'Ve workshop tu web customer.', 'pending', 'WS052826');

INSERT OR IGNORE INTO booking_chatbot_links
    (booking_code, session_id)
VALUES
    ('WS052826', 'chat-demo-gift'),
    ('BK010', 'chat-demo-calm');

INSERT OR IGNORE INTO ceramic_trackers
    (tracker_id, booking_code, tracking_code, customer_name, product_name, workshop_name, stage, qc_status, updated_at, owner_name, kiln_batch)
VALUES
    ('TRK018', 'BK008', NULL, 'Le Van C', 'Bat gom', 'Goi premium ban xoay rieng', 'created', 'normal', '23/05/2026 16:30', 'Xuong A', 'Batch F01'),
    ('TRK021', 'BK010', 'THO-2024-0847', 'Nguyen Minh A', 'Ly gom', 'Nan gom co ban', 'drying', 'normal', '24/05/2026 10:15', 'Nhan vien 2', 'Batch F01'),
    ('TRK022', 'BK009', NULL, 'Tran Thi B', 'Dia gom', 'Trang tri gom co ban', 'bisque', 'glaze_error', '23/05/2026 14:20', 'Xuong B', 'Batch F02'),
    ('TRK023', 'BK011', NULL, 'Pham Thi D', 'To gom', 'Nan gom co ban', 'glazing', 'normal', '24/05/2026 08:45', 'Xuong A', 'Batch F01'),
    ('TRK024', 'BK007', NULL, 'Nguyen Van A', 'Binh gom', 'Combo co doi co cap', 'ready', 'normal', '22/05/2026 17:10', 'Xuong A', 'Batch F03'),
    ('TRK025', 'BK006', NULL, 'Hoang Anh Q', 'Chen gom', 'Nan gom co ban', 'done', 'cracked', '22/05/2026 11:05', 'QC', 'Batch F02');

INSERT OR IGNORE INTO ceramic_product_jobs
    (job_id, booking_code, customer_name, product_name, stage, job_status, image_note, owner_name, due_date)
VALUES
    ('PRD021', 'BK010', 'Nguyen Minh A', 'Ly gom', 'drying', 'photo_needed', 'Can anh sau phoi kho', 'Nhan vien 2', '25/05/2026'),
    ('PRD022', 'BK009', 'Tran Thi B', 'Dia gom', 'bisque', 'in_progress', 'Da co anh QC', 'Xuong B', '26/05/2026'),
    ('PRD023', 'BK011', 'Pham Thi D', 'To gom', 'glazing', 'waiting', 'Chua co anh', 'Xuong A', '27/05/2026'),
    ('PRD024', 'BK007', 'Nguyen Van A', 'Binh gom', 'ready', 'ready', 'Anh thanh pham da duyet', 'Nhan vien 1', '24/05/2026'),
    ('PRD025', 'BK008', 'Le Van C', 'Bat gom', 'done', 'delivered', 'Da ban giao', 'Nhan vien 3', '23/05/2026');
