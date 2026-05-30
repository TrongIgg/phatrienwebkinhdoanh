-- ════════════════════════════════════════════════════
-- THỔ Platform — Full Schema (PostgreSQL)
-- Khớp với dữ liệu phase2: glaze_options, ceramic_stages,
-- studios, workshops, products (mở rộng), ceramic_tracking
-- ════════════════════════════════════════════════════

-- ── Glaze Options ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS glaze_options (
    slug        VARCHAR(50)  PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    hex_color   VARCHAR(10)  NOT NULL
);

-- ── Ceramic Stages ────────────────────────────────────
CREATE TABLE IF NOT EXISTS ceramic_stages (
    stage_order     INT          PRIMARY KEY,
    slug            VARCHAR(50)  NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    emoji           VARCHAR(10)  NOT NULL,
    duration_days   INT          NOT NULL DEFAULT 1
);

-- ── Studios ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS studios (
    id               SERIAL       PRIMARY KEY,
    name             VARCHAR(200) NOT NULL,
    address          TEXT         NOT NULL,
    city             VARCHAR(100) NOT NULL,
    phone            VARCHAR(30),
    wheel_count      INT          NOT NULL DEFAULT 0,
    instructor_count INT          NOT NULL DEFAULT 0,
    price_base       DECIMAL(12,0) NOT NULL DEFAULT 0,
    price_wheel      DECIMAL(12,0) NOT NULL DEFAULT 0,
    rating           NUMERIC(3,1) NOT NULL DEFAULT 5.0
);

-- ── Products (mở rộng từ phase2) ─────────────────────
CREATE TABLE IF NOT EXISTS products (
    id           SERIAL        PRIMARY KEY,
    sku          VARCHAR(20)   NOT NULL UNIQUE,
    name         VARCHAR(255)  NOT NULL,
    category     VARCHAR(100)  NOT NULL,
    price_vnd    DECIMAL(12,0) NOT NULL,
    price_sale   DECIMAL(12,0),
    glaze_slug   VARCHAR(50)   REFERENCES glaze_options(slug),
    origin       VARCHAR(150),
    stock_qty    INT           NOT NULL DEFAULT 0,
    image_url    TEXT,
    rating       NUMERIC(3,1)  NOT NULL DEFAULT 5.0,
    review_count INT           NOT NULL DEFAULT 0,
    is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_glaze ON products(glaze_slug);

-- ── Workshop Slots ────────────────────────────────────
CREATE TABLE IF NOT EXISTS workshops (
    id               SERIAL        PRIMARY KEY,
    studio_id        INT           NOT NULL REFERENCES studios(id),
    date             DATE          NOT NULL,
    start_time       TIME          NOT NULL,
    end_time         TIME          NOT NULL,
    slot_name        VARCHAR(50)   NOT NULL,
    type             VARCHAR(50)   NOT NULL,   -- wheel_throwing | hand_building | painting
    capacity         INT           NOT NULL DEFAULT 8,
    booked           INT           NOT NULL DEFAULT 0,
    price_vnd        DECIMAL(12,0) NOT NULL,
    instructor_slots INT           NOT NULL DEFAULT 1,
    status           VARCHAR(20)   NOT NULL DEFAULT 'available'
);

CREATE INDEX IF NOT EXISTS idx_workshops_studio_date ON workshops(studio_id, date);
CREATE INDEX IF NOT EXISTS idx_workshops_date ON workshops(date);

-- ── Users ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    user_id       SERIAL       PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(150) NOT NULL,
    phone         VARCHAR(20),
    role          VARCHAR(20)  NOT NULL DEFAULT 'customer',
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── User Addresses ────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_addresses (
    address_id       SERIAL        PRIMARY KEY,
    user_id          INT           NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    label            VARCHAR(50)   NOT NULL DEFAULT 'Nhà',
    recipient_name   VARCHAR(150)  NOT NULL,
    recipient_phone  VARCHAR(20)   NOT NULL,
    street           TEXT          NOT NULL,
    district         VARCHAR(100)  NOT NULL,
    city             VARCHAR(100)  NOT NULL,
    is_default       BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON user_addresses(user_id);

-- ── Workshop Bookings ─────────────────────────────────
CREATE TABLE IF NOT EXISTS workshop_bookings (
    booking_id   SERIAL        PRIMARY KEY,
    booking_code VARCHAR(20)   NOT NULL UNIQUE,
    user_id      INT           REFERENCES users(user_id),
    workshop_id  INT           NOT NULL REFERENCES workshops(id),
    quantity     INT           NOT NULL DEFAULT 1,
    total_price  DECIMAL(12,0) NOT NULL,
    status       VARCHAR(20)   NOT NULL DEFAULT 'confirmed',
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── Ceramic Tracking ─────────────────────────────────
CREATE TABLE IF NOT EXISTS ceramic_tracking (
    tracking_id     VARCHAR(20)  PRIMARY KEY,
    booking_code    VARCHAR(20)  NOT NULL,
    customer_name   VARCHAR(150) NOT NULL,
    workshop_date   DATE         NOT NULL,
    studio_name     VARCHAR(200) NOT NULL,
    product_desc    VARCHAR(255) NOT NULL,
    current_stage   VARCHAR(50)  NOT NULL REFERENCES ceramic_stages(slug),
    estimated_done  DATE,
    stage_history   JSONB        NOT NULL DEFAULT '[]',
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Cart (session-based, optional persist) ────────────
CREATE TABLE IF NOT EXISTS cart_items (
    item_id     SERIAL        PRIMARY KEY,
    session_key VARCHAR(64)   NOT NULL,
    product_id  INT           REFERENCES products(id) ON DELETE CASCADE,
    workshop_id INT           REFERENCES workshops(id) ON DELETE CASCADE,
    quantity    INT           NOT NULL DEFAULT 1,
    added_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cart_item_type CHECK (
        (product_id IS NOT NULL AND workshop_id IS NULL) OR
        (product_id IS NULL AND workshop_id IS NOT NULL)
    )
);

-- ── Orders ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    order_id     SERIAL        PRIMARY KEY,
    order_code   VARCHAR(20)   NOT NULL UNIQUE,
    user_id      INT           REFERENCES users(user_id),
    address_id   INT           REFERENCES user_addresses(address_id),
    total_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
    status       VARCHAR(30)   NOT NULL DEFAULT 'pending',
    note         TEXT,
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    item_id     SERIAL        PRIMARY KEY,
    order_id    INT           NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id  INT           REFERENCES products(id),
    workshop_id INT           REFERENCES workshops(id),
    quantity    INT           NOT NULL DEFAULT 1,
    unit_price  DECIMAL(12,0) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
