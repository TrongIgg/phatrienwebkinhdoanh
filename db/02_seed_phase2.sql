-- ════════════════════════════════════════════════════
-- THỔ Platform — Complete Database Seed (Phase 2)
-- Generated: 2026-05-10T09:21:06.971638
-- ════════════════════════════════════════════════════

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ── Glaze Options ─────────────────────────────────────
INSERT INTO glaze_options (slug, name, hex_color) VALUES
  ('men_trang', 'Men Trắng', '#F5F5F0'),
  ('men_ngoc', 'Men Ngọc', '#A8D5C2'),
  ('men_ran', 'Men Rạn Cổ Điển', '#E8DCC8'),
  ('men_nau', 'Men Nâu Đất', '#8B6345'),
  ('men_xanh', 'Men Xanh Celadon', '#9DC4B0'),
  ('men_be', 'Men Be Ngà', '#F0E6D2'),
  ('hoa_bien', 'Men Hỏa Biến', '#6B4C8A'),
  ('men_den', 'Men Đen Satin', '#2C2C2C'),
  ('terracotta', 'Terracotta', '#C4663A'),
  ('men_xanh_lam', 'Men Xanh Lam', '#4A7FA5');

-- ── Ceramic Tracker Stages ────────────────────────────
INSERT INTO ceramic_stages (stage_order, slug, name, emoji, duration_days) VALUES
  (1, 'dang_phoi', 'Đang phơi khô', '🌬️', 3),
  (2, 'trang_men', 'Đang tráng men', '🖌️', 2),
  (3, 'cho_nung', 'Chờ vào lò', '⏳', 1),
  (4, 'dang_nung', 'Đang nung lò', '🔥', 1),
  (5, 'lam_nguoi', 'Đang làm nguội', '❄️', 1),
  (6, 'kiem_tra', 'Kiểm tra chất lượng', '🔍', 1),
  (7, 'dong_goi', 'Đang đóng gói', '📦', 1),
  (8, 'san_sang', 'Sẵn sàng lấy / giao', '✅', 0);

-- ── Studios ──────────────────────────────────────────
INSERT INTO studios (id, name, address, city, phone, wheel_count, instructor_count, price_base, price_wheel, rating) VALUES
  (1, 'Bopbi House', '212 Trần Văn Trà, Block C Panorama, Phú Mỹ Hưng, Q.7, TPHCM', 'Hồ Chí Minh', '028-xxxx-xxxx', 8, 3, 400000, 550000, 4.7),
  (2, 'Hey Camel Ceramics', 'Hẻm 45/12 Lê Văn Sỹ, Phường 13, Quận 3, TPHCM', 'Hồ Chí Minh', '090-xxxx-xxxx', 6, 2, 480000, 600000, 4.8),
  (3, 'Meow Pottery Workshop', '100 Trần Quốc Toản, Phường Võ Thị Sáu, Quận 3, TPHCM', 'Hồ Chí Minh', '091-xxxx-xxxx', 10, 4, 400000, 500000, 4.6),
  (4, 'Haru Craft Studio', '100 Trần Quốc Toản, Phường Võ Thị Sáu, Quận 3, TPHCM', 'Hồ Chí Minh', '093-xxxx-xxxx', 5, 2, 450000, 580000, 4.9),
  (5, 'Vietclay Hà Nội', '43 Vạn Kiếp, Phường Chương Dương, Quận Hoàn Kiếm, Hà Nội', 'Hà Nội', '024-xxxx-xxxx', 8, 3, 527000, 650000, 4.8),
  (6, 'Puppets Ceramic Studio', 'Số 06, Ngách 27, Ngõ 161, Thái Hà, Đống Đa, Hà Nội', 'Hà Nội', '096-xxxx-xxxx', 6, 2, 450000, 600000, 4.7);

-- ── Products ─────────────────────────────────────────
INSERT INTO products (id, sku, name, category, price_vnd, glaze_slug, origin, stock_qty, image_url, rating) VALUES
  (1, 'THO-LY_-0001', 'Ly sứ men ngọc vẽ tay hoa tulip - Độc bản', 'ly_su', 90000, 'men_ran', 'Bàu Trúc, Ninh Thuận', 28, 'https://images.unsplash.com/photo-1595359808229-8f9f9a0c02de?w=400', 4.4),
  (2, 'THO-LY_-0002', 'Ly sứ có nắp men trắng họa tiết (Handmade)', 'ly_su', 125000, 'men_ngoc', 'Thanh Hà, Hội An', 14, 'https://images.unsplash.com/photo-1555181943-61caff64c4c6?w=400', 4.7),
  (3, 'THO-LY_-0003', 'Cốc sứ không quai men rạn cổ điển', 'ly_su', 79000, 'hoa_bien', 'Thanh Hà, Hội An', 1, 'https://images.unsplash.com/photo-1612540139150-4b5c9b541d97?w=400', 4.7),
  (4, 'THO-LY_-0004', 'Ly espresso men xanh celadon - Độc bản', 'ly_su', 80000, 'men_nau', 'Bàu Trúc, Ninh Thuận', 13, 'https://images.unsplash.com/photo-1563302111-eab4b145e6c9?w=400', 4.8),
  (5, 'THO-LY_-0005', 'Ly sứ màu nâu đất sét tự nhiên - Độc bản', 'ly_su', 109000, 'men_trang', 'Bàu Trúc, Ninh Thuận', 21, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400', 4.9),
  (6, 'THO-LY_-0006', 'Ly sứ màu be pastel mộc mạc - Độc bản', 'ly_su', 103000, 'men_xanh', 'Thanh Hà, Hội An', 5, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400', 4.6),
  (7, 'THO-LO_-0007', 'Lọ hoa dáng phích men xanh ngọc - Độc bản', 'lo_hoa', 206000, 'men_trang', 'Thanh Hà, Hội An', 30, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400', 4.8),
  (8, 'THO-LO_-0008', 'Bình hoa gốm vuốt tay dáng bầu - Độc bản', 'lo_hoa', 387000, 'men_ran', 'Thanh Hà, Hội An', 16, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400', 4.6),
  (9, 'THO-LO_-0009', 'Lọ hoa nhỏ men rạn trắng ngà', 'lo_hoa', 201000, 'men_den', 'Bát Tràng, Hà Nội', 18, 'https://images.unsplash.com/photo-1493106641515-5480b4b09d07?w=400', 4.3),
  (10, 'THO-LO_-0010', 'Bình hoa dáng trụ men nâu terracotta - Độc bản', 'lo_hoa', 247000, 'men_ngoc', 'Thanh Hà, Hội An', 13, 'https://images.unsplash.com/photo-1493106641515-5480b4b09d07?w=400', 4.8),
  (11, 'THO-LO_-0011', 'Lọ hoa mini men xanh lam vẽ vàng - Độc bản', 'lo_hoa', 441000, 'men_den', 'Bát Tràng, Hà Nội', 14, 'https://images.unsplash.com/photo-1555181943-61caff64c4c6?w=400', 4.8),
  (12, 'THO-AM_-0012', 'Bộ ấm chén 6 người men ngọc vân mây (Handmade)', 'am_chen', 647000, 'men_nau', 'Bàu Trúc, Ninh Thuận', 29, 'https://images.unsplash.com/photo-1563302111-eab4b145e6c9?w=400', 4.8),
  (13, 'THO-AM_-0013', 'Ấm chén hỏa biến men rạn cổ (Handmade)', 'am_chen', 445000, 'men_xanh', 'Bàu Trúc, Ninh Thuận', 6, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400', 4.5),
  (14, 'THO-AM_-0014', 'Bộ ấm chén trà men trắng vẽ tay - Độc bản', 'am_chen', 663000, 'men_be', 'Bàu Trúc, Ninh Thuận', 12, 'https://images.unsplash.com/photo-1563302111-eab4b145e6c9?w=400', 4.8),
  (15, 'THO-AM_-0015', 'Ấm độc ẩm men xanh celadon', 'am_chen', 333000, 'men_nau', 'Bát Tràng, Hà Nội', 19, 'https://images.unsplash.com/photo-1595359808229-8f9f9a0c02de?w=400', 4.2),
  (16, 'THO-BAT-0016', 'Chén cơm men nâu đất gốm Bát Tràng (Handmade)', 'bat_dia', 57000, 'hoa_bien', 'Bát Tràng, Hà Nội', 14, 'https://images.unsplash.com/photo-1563302111-eab4b145e6c9?w=400', 4.4),
  (17, 'THO-BAT-0017', 'Đĩa ăn tròn men trắng họa tiết trúc - Độc bản', 'bat_dia', 93000, 'men_xanh_lam', 'Thanh Hà, Hội An', 11, 'https://images.unsplash.com/photo-1555181943-61caff64c4c6?w=400', 4.4),
  (18, 'THO-BAT-0018', 'Bộ 6 chén tô men xanh celadon', 'bat_dia', 398000, 'men_trang', 'Thanh Hà, Hội An', 25, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400', 4.5),
  (19, 'THO-PHU-0019', 'Cốc lọc trà gốm men ngọc có lưới', 'phu_kien', 147000, 'men_xanh_lam', 'Bàu Trúc, Ninh Thuận', 11, 'https://images.unsplash.com/photo-1493106641515-5480b4b09d07?w=400', 4.3),
  (20, 'THO-PHU-0020', 'Đĩa lót ly sứ men nâu mộc', 'phu_kien', 55000, 'men_trang', 'Thanh Hà, Hội An', 1, 'https://images.unsplash.com/photo-1595359808229-8f9f9a0c02de?w=400', 4.3),
  (21, 'THO-PHU-0021', 'Gác đũa gốm dáng mây men trắng', 'phu_kien', 81000, 'men_xanh_lam', 'Bàu Trúc, Ninh Thuận', 18, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400', 4.2),
  (22, 'THO-LY_-0022', 'Ly sứ men ngọc vẽ tay hoa tulip - Độc bản', 'ly_su', 93000, 'men_trang', 'Thanh Hà, Hội An', 13, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400', 4.6),
  (23, 'THO-LY_-0023', 'Ly sứ có nắp men trắng họa tiết', 'ly_su', 159000, 'terracotta', 'Bàu Trúc, Ninh Thuận', 15, 'https://images.unsplash.com/photo-1555181943-61caff64c4c6?w=400', 4.5),
  (24, 'THO-LY_-0024', 'Cốc sứ không quai men rạn cổ điển (Handmade)', 'ly_su', 85000, 'men_be', 'Bát Tràng, Hà Nội', 17, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400', 5.0),
  (25, 'THO-LY_-0025', 'Ly espresso men xanh celadon - Độc bản', 'ly_su', 107000, 'terracotta', 'Thanh Hà, Hội An', 29, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400', 4.6),
  (26, 'THO-LY_-0026', 'Ly sứ màu nâu đất sét tự nhiên - Độc bản', 'ly_su', 105000, 'men_nau', 'Thanh Hà, Hội An', 20, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400', 4.8),
  (27, 'THO-LY_-0027', 'Ly sứ màu be pastel mộc mạc', 'ly_su', 87000, 'terracotta', 'Bát Tràng, Hà Nội', 17, 'https://images.unsplash.com/photo-1595359808229-8f9f9a0c02de?w=400', 4.5),
  (28, 'THO-LO_-0028', 'Lọ hoa dáng phích men xanh ngọc', 'lo_hoa', 220000, 'men_trang', 'Thanh Hà, Hội An', 4, 'https://images.unsplash.com/photo-1555181943-61caff64c4c6?w=400', 4.8),
  (29, 'THO-LO_-0029', 'Bình hoa gốm vuốt tay dáng bầu - Độc bản', 'lo_hoa', 276000, 'terracotta', 'Bàu Trúc, Ninh Thuận', 10, 'https://images.unsplash.com/photo-1493106641515-5480b4b09d07?w=400', 4.6),
  (30, 'THO-LO_-0030', 'Lọ hoa nhỏ men rạn trắng ngà', 'lo_hoa', 248000, 'men_be', 'Bàu Trúc, Ninh Thuận', 25, 'https://images.unsplash.com/photo-1563302111-eab4b145e6c9?w=400', 4.3),
  (31, 'THO-LO_-0031', 'Bình hoa dáng trụ men nâu terracotta (Handmade)', 'lo_hoa', 205000, 'men_ngoc', 'Bát Tràng, Hà Nội', 5, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400', 4.6),
  (32, 'THO-LO_-0032', 'Lọ hoa mini men xanh lam vẽ vàng (Handmade)', 'lo_hoa', 298000, 'hoa_bien', 'Thanh Hà, Hội An', 30, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400', 4.5),
  (33, 'THO-AM_-0033', 'Bộ ấm chén 6 người men ngọc vân mây', 'am_chen', 683000, 'men_trang', 'Bàu Trúc, Ninh Thuận', 24, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400', 4.9),
  (34, 'THO-AM_-0034', 'Ấm chén hỏa biến men rạn cổ', 'am_chen', 700000, 'men_xanh_lam', 'Thanh Hà, Hội An', 25, 'https://images.unsplash.com/photo-1493106641515-5480b4b09d07?w=400', 4.3),
  (35, 'THO-AM_-0035', 'Bộ ấm chén trà men trắng vẽ tay (Handmade)', 'am_chen', 539000, 'men_xanh', 'Bát Tràng, Hà Nội', 12, 'https://images.unsplash.com/photo-1612540139150-4b5c9b541d97?w=400', 5.0),
  (36, 'THO-AM_-0036', 'Ấm độc ẩm men xanh celadon (Handmade)', 'am_chen', 290000, 'men_be', 'Bát Tràng, Hà Nội', 28, 'https://images.unsplash.com/photo-1493106641515-5480b4b09d07?w=400', 4.7),
  (37, 'THO-BAT-0037', 'Chén cơm men nâu đất gốm Bát Tràng - Độc bản', 'bat_dia', 64000, 'hoa_bien', 'Thanh Hà, Hội An', 6, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400', 5.0),
  (38, 'THO-BAT-0038', 'Đĩa ăn tròn men trắng họa tiết trúc', 'bat_dia', 134000, 'hoa_bien', 'Thanh Hà, Hội An', 6, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400', 4.7),
  (39, 'THO-BAT-0039', 'Bộ 6 chén tô men xanh celadon (Handmade)', 'bat_dia', 421000, 'men_nau', 'Bát Tràng, Hà Nội', 20, 'https://images.unsplash.com/photo-1555181943-61caff64c4c6?w=400', 5.0),
  (40, 'THO-PHU-0040', 'Cốc lọc trà gốm men ngọc có lưới - Độc bản', 'phu_kien', 117000, 'men_ran', 'Thanh Hà, Hội An', 4, 'https://images.unsplash.com/photo-1563302111-eab4b145e6c9?w=400', 4.7),
  (41, 'THO-PHU-0041', 'Đĩa lót ly sứ men nâu mộc', 'phu_kien', 42000, 'terracotta', 'Thanh Hà, Hội An', 3, 'https://images.unsplash.com/photo-1563302111-eab4b145e6c9?w=400', 4.3),
  (42, 'THO-PHU-0042', 'Gác đũa gốm dáng mây men trắng', 'phu_kien', 94000, 'men_ran', 'Bát Tràng, Hà Nội', 27, 'https://images.unsplash.com/photo-1493106641515-5480b4b09d07?w=400', 4.8),
  (43, 'THO-LY_-0043', 'Ly sứ men ngọc vẽ tay hoa tulip', 'ly_su', 89000, 'men_nau', 'Thanh Hà, Hội An', 12, 'https://images.unsplash.com/photo-1493106641515-5480b4b09d07?w=400', 5.0),
  (44, 'THO-LY_-0044', 'Ly sứ có nắp men trắng họa tiết (Handmade)', 'ly_su', 147000, 'men_ngoc', 'Thanh Hà, Hội An', 24, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400', 4.3),
  (45, 'THO-LY_-0045', 'Cốc sứ không quai men rạn cổ điển', 'ly_su', 110000, 'men_xanh_lam', 'Thanh Hà, Hội An', 10, 'https://images.unsplash.com/photo-1555181943-61caff64c4c6?w=400', 4.8),
  (46, 'THO-LY_-0046', 'Ly espresso men xanh celadon', 'ly_su', 92000, 'men_trang', 'Bàu Trúc, Ninh Thuận', 19, 'https://images.unsplash.com/photo-1493106641515-5480b4b09d07?w=400', 4.3),
  (47, 'THO-LY_-0047', 'Ly sứ màu nâu đất sét tự nhiên', 'ly_su', 118000, 'men_be', 'Thanh Hà, Hội An', 14, 'https://images.unsplash.com/photo-1595359808229-8f9f9a0c02de?w=400', 4.3),
  (48, 'THO-LY_-0048', 'Ly sứ màu be pastel mộc mạc', 'ly_su', 99000, 'men_ngoc', 'Thanh Hà, Hội An', 15, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400', 4.9),
  (49, 'THO-LO_-0049', 'Lọ hoa dáng phích men xanh ngọc - Độc bản', 'lo_hoa', 224000, 'men_be', 'Bàu Trúc, Ninh Thuận', 4, 'https://images.unsplash.com/photo-1563302111-eab4b145e6c9?w=400', 4.3),
  (50, 'THO-LO_-0050', 'Bình hoa gốm vuốt tay dáng bầu', 'lo_hoa', 450000, 'hoa_bien', 'Bát Tràng, Hà Nội', 13, 'https://images.unsplash.com/photo-1595359808229-8f9f9a0c02de?w=400', 4.3);

SET FOREIGN_KEY_CHECKS = 1;
-- ══ End of Seed ══
