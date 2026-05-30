-- Demo workflow data for THO Studio UX prototype.
-- This file mirrors the frontend demo flow:
-- Product / Workshop -> Hybrid Cart -> Checkout Payment -> Ticket / Shipping / Tracking.

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
    CONSTRAINT chk_demo_payment_owner CHECK (order_id IS NOT NULL OR tracking_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS shipping_orders (
    shipping_order_id SERIAL PRIMARY KEY,
    order_id          INT NOT NULL REFERENCES orders(order_id),
    address_id        INT NOT NULL REFERENCES user_addresses(address_id),
    logistics_partner VARCHAR(100),
    shipping_fee      DECIMAL(12,0) NOT NULL DEFAULT 0,
    status            VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS tracker_history (
    history_id    SERIAL PRIMARY KEY,
    tracking_id   VARCHAR(20) NOT NULL REFERENCES ceramic_tracking(tracking_id) ON DELETE CASCADE,
    stage_slug    VARCHAR(50) NOT NULL REFERENCES ceramic_stages(slug),
    updated_by    INT REFERENCES users(user_id),
    note          TEXT,
    image_url     TEXT,
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS final_dispositions (
    disposition_id          SERIAL PRIMARY KEY,
    tracking_id             VARCHAR(20) NOT NULL UNIQUE REFERENCES ceramic_tracking(tracking_id) ON DELETE CASCADE,
    action                  VARCHAR(40) NOT NULL,
    note                    TEXT,
    confirmed_by_customer   BOOLEAN NOT NULL DEFAULT FALSE,
    decided_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO payments (order_id, payment_type, amount, method, status, paid_at)
VALUES
    (1, 'CHECKOUT', 1350000, 'momo', 'paid', NOW())
ON CONFLICT DO NOTHING;

INSERT INTO shipping_orders (order_id, address_id, logistics_partner, shipping_fee, status)
VALUES
    (1, 1, 'GHN Demo', 40000, 'packing')
ON CONFLICT DO NOTHING;

INSERT INTO workshop_tickets (booking_id, order_item_id, workshop_id, user_id, qr_code, check_in_status)
VALUES
    (1, 1, 1, 1, 'WS-6491-01', 'not_checked_in')
ON CONFLICT DO NOTHING;

INSERT INTO tracker_history (tracking_id, stage_slug, note, updated_at)
VALUES
    ('THO-2024-0847', 'forming', 'Da tao hinh sau workshop.', NOW() - INTERVAL '7 days'),
    ('THO-2024-0847', 'drying', 'Da phoi kho tu nhien.', NOW() - INTERVAL '4 days'),
    ('THO-2024-0847', 'bisque_firing', 'Dang nung so 900C.', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

INSERT INTO final_dispositions (tracking_id, action, note, confirmed_by_customer)
VALUES
    ('THO-2024-0847', 'PICKUP_AT_STORE', 'Khach chon nhan tai studio.', TRUE)
ON CONFLICT DO NOTHING;
