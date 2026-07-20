/* ===== THỔ Studio - Data (from DesignPrimitives.tsx) ===== */

const IMAGE_BASE = 'image';

const logoImage = `${IMAGE_BASE}/logo/logo.jpg`;

const workshopImages = {
  hero: `${IMAGE_BASE}/workshop/workshop_02_Yx0ge-ua.jpg`,
  wheelBw: `${IMAGE_BASE}/workshop/workshop_03_IMU94a5Q.jpg`,
  artisanBw: `${IMAGE_BASE}/workshop/workshop_04_zmgDUOX9.jpg`,
  handsWarm: `${IMAGE_BASE}/workshop/workshop_06_-aebrWVm.jpg`,
  largePot: `${IMAGE_BASE}/workshop/workshop_07_6MJ0jtzI.jpg`,
  detailBw: `${IMAGE_BASE}/workshop/workshop_20_aVXIc03K.jpg`,
};

const workshopExtraImages = [
  `${IMAGE_BASE}/workshop/User attachment.png`,
  `${IMAGE_BASE}/workshop/Userattachment2.png`,
  `${IMAGE_BASE}/workshop/Userattachment3.png`,
  `${IMAGE_BASE}/workshop/Userattachment4.png`,
  `${IMAGE_BASE}/workshop/Userattachment5.png`,
  `${IMAGE_BASE}/workshop/Userattachment6.png`,
  `${IMAGE_BASE}/workshop/Userattachment7.png`,
  `${IMAGE_BASE}/workshop/Userattachment8.png`,
  `${IMAGE_BASE}/workshop/Userattachment9.png`,
  `${IMAGE_BASE}/workshop/Userattachment10.png`,
];

const workshopImagePool = [
  ...workshopExtraImages,
  workshopImages.handsWarm,
  workshopImages.detailBw,
  workshopImages.wheelBw,
  workshopImages.hero,
  workshopImages.largePot,
  workshopImages.artisanBw,
];

const productImages = {
  cupSet: `${IMAGE_BASE}/product/products_15_15yTrDMi.jpg`,
  tealVase: `${IMAGE_BASE}/product/products_20_jpxDBK5P.jpg`,
  crackleBowls: `${IMAGE_BASE}/product/products_21_zx4XcOtv.jpg`,
  blackVase: `${IMAGE_BASE}/product/products_23_BNTfGq5m.jpg`,
  patternedVase: `${IMAGE_BASE}/product/products_26_S2DsBnRc.jpg`,
  decor1: `${IMAGE_BASE}/product/products_30_FLCCgXjh.jpg`,
  decor2: `${IMAGE_BASE}/product/products_33_DQTODkVG.jpg`,
  decor3: `${IMAGE_BASE}/product/products_49_uheAnGAt.jpg`,
};

const heroClayVideo = '../src/assets/video/hero-clay.mp4';

const workshops = [
  {
    id: '1', name: 'Nặn gốm cơ bản',
    day: 'APR', date: '14',
    fullDate: 'Thứ Bảy, 31/05/2026', startDate: '2026-05-31',
    time: '09:00 - 11:30', instructor: 'Nghệ nhân Minh Châu',
    price: 490000, package: '1 người', audience: 'single_friendly',
    workshopType: 'basic',
    description: 'Làm quen với đất sét, nặn dáng cơ bản và tạo vân thủ công.',
    slots: { available: 8, total: 12 },
    image: workshopImages.handsWarm,
  },
  {
    id: '2', name: 'Trang trí gốm bằng men màu',
    day: 'AUG', date: '20',
    fullDate: 'Chủ Nhật, 01/06/2026', startDate: '2026-06-01',
    time: '14:00 - 16:30', instructor: 'Nghệ nhân Hoài An',
    price: 380000, package: '1 người', audience: 'single_friendly',
    workshopType: 'painting',
    description: 'Tô men, vẽ họa tiết và hoàn thiện sản phẩm đã nung mộc.',
    slots: { available: 4, total: 10 },
    image: workshopImages.detailBw,
  },
  {
    id: '3', name: 'Combo "Có đôi có cặp"',
    day: 'SEP', date: '18',
    fullDate: 'Thứ Bảy, 07/06/2026', startDate: '2026-06-07',
    time: '09:00 - 12:00', instructor: 'Nghệ nhân Minh Châu',
    price: 600000, package: '2 người', audience: 'couple_friendly',
    workshopType: 'combo',
    description: 'Gói trải nghiệm cho hai người, cùng tạo hình một cặp đồ gốm.',
    slots: { available: 6, total: 10 },
    image: workshopImages.wheelBw,
  },
  {
    id: '4', name: 'Gia đình cùng nặn đất',
    day: '', date: '08',
    fullDate: 'Chủ Nhật, 08/06/2026', startDate: '2026-06-08',
    time: '09:00 - 11:30', instructor: 'Nghệ nhân Bảo Trân',
    price: 1250000, package: 'Gia đình 3-4 người', audience: 'family_friendly',
    workshopType: 'family',
    description: 'Nhịp làm chậm cho gia đình, có trợ giảng kèm trẻ nhỏ và góc chụp thành phẩm.',
    slots: { available: 3, total: 8 },
    image: workshopImagePool[3],
  },
  {
    id: '5', name: 'Bàn xoay premium riêng',
    day: '', date: '14',
    fullDate: 'Thứ Bảy, 14/06/2026', startDate: '2026-06-14',
    time: '15:00 - 18:00', instructor: 'Nghệ nhân Minh Châu',
    price: 1450000, package: '1 người', audience: 'single_friendly',
    workshopType: 'premium',
    description: 'Bàn xoay riêng, thời lượng dài hơn, nghệ nhân đi sát từng dáng tay và độ nghiêng của đất.',
    slots: { available: 2, total: 6 },
    image: workshopImagePool[4],
  },
  {
    id: '6', name: 'Chén trà và men sữa',
    day: '', date: '15',
    fullDate: 'Chủ Nhật, 15/06/2026', startDate: '2026-06-15',
    time: '09:30 - 12:00', instructor: 'Nghệ nhân An Nhiên',
    price: 520000, package: '1 người', audience: 'single_friendly',
    workshopType: 'tea',
    description: 'Nặn chén trà nhỏ, nghe về men và học cách nhìn một chiếc chén bằng tay trước khi bằng mắt.',
    slots: { available: 7, total: 12 },
    image: workshopImagePool[5],
  },
  {
    id: '7', name: 'Tượng gốm mini cuối tuần',
    day: '', date: '21',
    fullDate: 'Thứ Bảy, 21/06/2026', startDate: '2026-06-21',
    time: '13:30 - 16:00', instructor: 'Nghệ nhân Hoài An',
    price: 450000, package: '1 người', audience: 'single_friendly',
    workshopType: 'sculpture',
    description: 'Tạo tượng gốm nhỏ theo hình thú, nhà, mây hoặc ký hiệu riêng của bạn.',
    slots: { available: 9, total: 14 },
    image: workshopImagePool[6],
  },
  {
    id: '8', name: 'Nhóm bạn vẽ đĩa gốm',
    day: '', date: '22',
    fullDate: 'Chủ Nhật, 22/06/2026', startDate: '2026-06-22',
    time: '15:00 - 17:30', instructor: 'Nghệ nhân Bảo Trân',
    price: 880000, package: 'Nhóm 3 người', audience: 'couple_friendly',
    workshopType: 'painting',
    description: 'Dành cho người mê màu men: chọn bảng màu, vẽ nét, phủ men lên phôi đã nung mộc.',
    slots: { available: 5, total: 12 },
    image: workshopImagePool[7],
  },
  {
    id: '9', name: 'Gốm và hoa khô gia đình',
    day: '', date: '28',
    fullDate: 'Thứ Bảy, 28/06/2026', startDate: '2026-06-28',
    time: '09:00 - 11:30', instructor: 'Nghệ nhân An Nhiên',
    price: 1180000, package: 'Gia đình 3 người', audience: 'family_friendly',
    workshopType: 'family',
    description: 'Nhịp làm chậm cho gia đình, có trợ giảng kèm trẻ nhỏ và góc chụp thành phẩm.',
    slots: { available: 4, total: 9 },
    image: workshopImagePool[8],
  },
  {
    id: '10', name: 'Đêm đất và ánh nến',
    day: '', date: '29',
    fullDate: 'Chủ Nhật, 29/06/2026', startDate: '2026-06-29',
    time: '18:00 - 20:30', instructor: 'Nghệ nhân Minh Châu',
    price: 990000, package: '2 người', audience: 'couple_friendly',
    workshopType: 'combo',
    description: 'Đi cùng một người thương hoặc bạn thân, mỗi người làm một món rồi ghép thành một cặp.',
    slots: { available: 6, total: 10 },
    image: workshopImagePool[9],
  },
];

const products = [
  {
    id: "1", sku: "THO-CUP-DAWN", name: "Ly sứ bình minh", detailName: "Ly sứ bình minh",
    description: "Thành ly mảnh, men chuyển sắc hồng đất, hợp cà phê sáng.",
    category: "cup", collection: "Bàn trà chậm", price: 260000, stockQty: 12, rating: 4.8, reviewCount: 34,
    image: `${IMAGE_BASE}/product/products_15_15yTrDMi.jpg`
  },
  {
    id: "2", sku: "THO-CUP-MOSS", name: "Cặp ly men rêu", detailName: "Cặp ly men rêu",
    description: "Hai chiếc ly thấp, lòng men loang như rêu sau mưa.",
    category: "cup", collection: "Bàn trà chậm", price: 420000, stockQty: 9, rating: 4.9, reviewCount: 41,
    image: `${IMAGE_BASE}/product/products_20_jpxDBK5P.jpg`
  },
  {
    id: "3", sku: "THO-CUP-MOON", name: "Ly gốm ánh trăng", detailName: "Ly gốm ánh trăng",
    description: "Ly gốm trắng ánh trăng, cầm chắc tay, dùng hằng ngày hoặc làm quà.",
    category: "cup", collection: "Bàn trà chậm", price: 260000, stockQty: 14, rating: 4.9, reviewCount: 31,
    image: `${IMAGE_BASE}/product/products_21_zx4XcOtv.jpg`
  },
  {
    id: "4", sku: "THO-CUP-SOUL", name: "Ly gốm mộc bản", detailName: "Ly gốm mộc bản",
    description: "Ly gốm dáng cao, màu đất mộc thô nhám, tạo cảm giác ấm áp tinh tế.",
    category: "cup", collection: "Bàn trà chậm", price: 290000, stockQty: 15, rating: 4.8, reviewCount: 16,
    image: `${IMAGE_BASE}/product/products_22_BQ7UG7wM.jpg`
  },
  {
    id: "5", sku: "THO-BOWL-RAIN", name: "Bát men mưa", detailName: "Bát men mưa",
    description: "Bát sâu lòng, vệt men chảy nhẹ, dùng cho trà, cháo hoặc decor.",
    category: "tableware", collection: "Bàn ăn nghệ thuật", price: 310000, stockQty: 16, rating: 4.7, reviewCount: 22,
    image: `${IMAGE_BASE}/product/products_23_BNTfGq5m.jpg`
  },
  {
    id: "6", sku: "THO-PLATE-LOTUS", name: "Đĩa sen vẽ tay", detailName: "Đĩa sen vẽ tay",
    description: "Nét sen mảnh trên nền men kem, mỗi chiếc có một nhịp cọ riêng.",
    category: "tableware", collection: "Bàn ăn nghệ thuật", price: 540000, stockQty: 0, rating: 4.8, reviewCount: 20,
    image: `${IMAGE_BASE}/product/products_24_7G0kIv62.jpg`
  },
  {
    id: "7", sku: "THO-PLATE-STONE", name: "Đĩa đá mộc", detailName: "Đĩa đá mộc",
    description: "Bề mặt nhám vừa phải, sắc đất trầm, hợp bày bánh và trái cây.",
    category: "tableware", collection: "Bàn ăn nghệ thuật", price: 460000, stockQty: 7, rating: 4.6, reviewCount: 18,
    image: `${IMAGE_BASE}/product/products_25_oBkdr5tE.jpg`
  },
  {
    id: "8", sku: "THO-PLATE-LEAF", name: "Đĩa tạo hình chiếc lá", detailName: "Đĩa tạo hình chiếc lá",
    description: "Đĩa tạo hình chiếc lá độc đáo, men chảy nhẹ viền mộc, hợp đựng bánh kẹo.",
    category: "tableware", collection: "Bàn ăn nghệ thuật", price: 340000, stockQty: 10, rating: 4.7, reviewCount: 12,
    image: `${IMAGE_BASE}/product/products_26_S2DsBnRc.jpg`
  },
  {
    id: "9", sku: "THO-CELADON-S", name: "Bình men celadon oval", detailName: "Bình men celadon oval",
    description: "Dáng oval nhỏ, men celadon xanh ngọc, hợp bàn trà hoặc kệ decor.",
    category: "decor", collection: "Men xanh nhẹ", price: 380000, stockQty: 8, rating: 4.8, reviewCount: 24,
    image: `${IMAGE_BASE}/product/products_30_FLCCgXjh.jpg`
  },
  {
    id: "10", sku: "THO-PLATE-CELADON", name: "Đĩa men ngọc Celadon", detailName: "Đĩa men ngọc Celadon",
    description: "Đĩa nông lòng men celadon bóng mịn, tôn lên sắc xanh ngọc bích sang trọng.",
    category: "tableware", collection: "Men xanh nhẹ", price: 320000, stockQty: 12, rating: 4.8, reviewCount: 15,
    image: `${IMAGE_BASE}/product/products_33_DQTODkVG.jpg`
  },
  {
    id: "11", sku: "THO-BOWL-CELADON", name: "Bát ăn men ngọc", detailName: "Bát ăn men ngọc",
    description: "Bát ăn gốm tròn dày, giữ nhiệt tốt, men ngọc thanh nhã cho mâm cơm.",
    category: "tableware", collection: "Men xanh nhẹ", price: 280000, stockQty: 14, rating: 4.9, reviewCount: 19,
    image: `${IMAGE_BASE}/product/products_34_dmo5Oqi3.jpg`
  },
  {
    id: "12", sku: "THO-CUP-CELADON", name: "Ly men ngọc dáng lùn", detailName: "Ly men ngọc dáng lùn",
    description: "Ly nhỏ không quai, giữ hơi ấm lâu, men ngọc sáng dịu cho buổi thưởng trà.",
    category: "cup", collection: "Men xanh nhẹ", price: 220000, stockQty: 8, rating: 4.7, reviewCount: 11,
    image: `${IMAGE_BASE}/product/products_35_H5fvYySi.jpg`
  },
  {
    id: "13", sku: "THO-VASE-TALL", name: "Lọ hoa thân cao đất mộc", detailName: "Lọ hoa thân cao đất mộc",
    description: "Dáng cao thanh, sắc đất cháy ấm, đẹp với một cành khô.",
    category: "decor", collection: "Đất mộc hiện đại", price: 760000, stockQty: 5, rating: 4.6, reviewCount: 12,
    image: `${IMAGE_BASE}/product/products_36_--3LKfkt.jpg`
  },
  {
    id: "14", sku: "THO-VASE-BLACK", name: "Bình đen khói", detailName: "Bình đen khói",
    description: "Nền men đen sâu, miệng nhỏ, tạo điểm lặng cho góc phòng.",
    category: "decor", collection: "Đất mộc hiện đại", price: 820000, stockQty: 4, rating: 4.9, reviewCount: 16,
    image: `${IMAGE_BASE}/product/products_37_YfzwprHv.jpg`
  },
  {
    id: "15", sku: "THO-VASE-SAND", name: "Bình cát biển", detailName: "Bình cát biển",
    description: "Men cát mờ, thân gốm hơi lệch cố ý để giữ cảm giác thủ công.",
    category: "decor", collection: "Đất mộc hiện đại", price: 690000, stockQty: 6, rating: 4.7, reviewCount: 19,
    image: `${IMAGE_BASE}/product/products_39_GYTvV5NK.jpg`
  },
  {
    id: "16", sku: "THO-VASE-ROCK", name: "Lọ hoa mộc vân đá", detailName: "Lọ hoa mộc vân đá",
    description: "Bình cắm hoa vân đá xám đất, dáng thắt eo nhẹ nghệ thuật.",
    category: "decor", collection: "Đất mộc hiện đại", price: 720000, stockQty: 5, rating: 4.8, reviewCount: 14,
    image: `${IMAGE_BASE}/product/products_40_Uo2W75MB.jpg`
  },
  {
    id: "17", sku: "THO-JAR-MILK", name: "Hũ sữa men kem", detailName: "Hũ sữa men kem",
    description: "Hũ nhỏ có nắp, dùng đựng trà, muối tắm hoặc vật kỷ niệm.",
    category: "decor", collection: "Men sữa", price: 330000, stockQty: 10, rating: 4.8, reviewCount: 27,
    image: `${IMAGE_BASE}/product/products_44_ZtYNSUxF.jpg`
  },
  {
    id: "18", sku: "THO-TRAY-CLOUD", name: "Khay mây men trắng", detailName: "Khay mây men trắng",
    description: "Khay thấp, vành cong nhẹ, dùng đặt trang sức hoặc tách trà.",
    category: "decor", collection: "Men sữa", price: 290000, stockQty: 11, rating: 4.7, reviewCount: 15,
    image: `${IMAGE_BASE}/product/products_46_L6TO4Nnl.jpg`
  },
  {
    id: "19", sku: "THO-CUP-MILK", name: "Ly quai tròn men sữa", detailName: "Ly quai tròn men sữa",
    description: "Ly uống trà sữa hoặc cafe có quai tròn to bản dễ thương, men kem ấm.",
    category: "cup", collection: "Men sữa", price: 270000, stockQty: 13, rating: 4.8, reviewCount: 22,
    image: `${IMAGE_BASE}/product/products_47_K_HhVlO4.jpg`
  },
  {
    id: "20", sku: "THO-PLATE-MILK", name: "Đĩa tròn men sữa viền nâu", detailName: "Đĩa tròn men sữa viền nâu",
    description: "Đĩa sứ men sữa loang nhẹ ở viền nâu mộc mạc, phù hợp tráng miệng.",
    category: "tableware", collection: "Men sữa", price: 310000, stockQty: 9, rating: 4.7, reviewCount: 18,
    image: `${IMAGE_BASE}/product/products_49_uheAnGAt.jpg`
  },
  {
    id: "21", sku: "THO-INCENSE-ASH", name: "Đế hương tro xám", detailName: "Đế hương tro xám",
    description: "Một miếng gốm nhỏ cho góc thiền, men xám tro và vệt hỏa biến.",
    category: "decor", collection: "Men khói", price: 180000, stockQty: 18, rating: 4.6, reviewCount: 13,
    image: `${IMAGE_BASE}/product/products_50_W6iNMkzM.jpg`
  },
  {
    id: "22", sku: "THO-CANDLE-CLAY", name: "Chén nến đất nung", detailName: "Chén nến đất nung",
    description: "Chén gốm dày giữ nhiệt tốt, thơm mùi đất khi đặt cạnh nến.",
    category: "decor", collection: "Men khói", price: 240000, stockQty: 14, rating: 4.8, reviewCount: 21,
    image: `${IMAGE_BASE}/product/products_10_1ebeJYSP.jpg`
  },
  {
    id: "23", sku: "THO-BOWL-ASH", name: "Bát trà men khói trầm", detailName: "Bát trà men khói trầm",
    description: "Chén trà sâu lòng màu men xám khói loang lổ cá tính.",
    category: "tableware", collection: "Men khói", price: 290000, stockQty: 11, rating: 4.8, reviewCount: 14,
    image: `${IMAGE_BASE}/product/products_11_dwM0Y9nV.jpg`
  },
  {
    id: "24", sku: "THO-HOLDER-SMOKE", name: "Đế hương men đen khói", detailName: "Đế hương men đen khói",
    description: "Đế gốm tròn nhỏ nâng nén hương trầm, thiết kế tinh xảo.",
    category: "decor", collection: "Men khói", price: 160000, stockQty: 20, rating: 4.6, reviewCount: 8,
    image: `${IMAGE_BASE}/product/products_12_6Vco5y3w.jpg`
  },
  {
    id: "25", sku: "THO-KIT-GLAZE", name: "DIY kit tô men cơ bản", detailName: "DIY kit tô men cơ bản",
    description: "Bộ phôi gốm, cọ, màu men và hướng dẫn để tiếp tục chơi đất tại nhà.",
    category: "kit", collection: "Tự tay làm gốm", price: 220000, stockQty: 24, rating: 4.7, reviewCount: 18,
    image: `${IMAGE_BASE}/product/products_13_ff3evspk.jpg`
  },
  {
    id: "26", sku: "THO-KIT-FAMILY", name: "DIY kit gia đình", detailName: "DIY kit gia đình",
    description: "Bộ phôi nhiều kích thước cho 3-4 người, có bảng gợi ý họa tiết.",
    category: "kit", collection: "Tự tay làm gốm", price: 620000, stockQty: 8, rating: 4.9, reviewCount: 29,
    image: `${IMAGE_BASE}/product/products_16_dwuFK3D-.jpg`
  },
  {
    id: "27", sku: "THO-KIT-COUPLE", name: "DIY kit cặp đôi", detailName: "DIY kit cặp đôi",
    description: "Hai phôi ly, màu men đôi và thiệp nhỏ để ghi ngày làm cùng nhau.",
    category: "kit", collection: "Tự tay làm gốm", price: 390000, stockQty: 12, rating: 4.8, reviewCount: 25,
    image: `${IMAGE_BASE}/product/products_17_RK68Yhtc.jpg`
  },
  {
    id: "28", sku: "THO-KIT-SOLO", name: "DIY kit cá nhân tự làm", detailName: "DIY kit cá nhân tự làm",
    description: "Bộ đất sét tự khô, dụng cụ điêu khắc cơ bản và màu acrylic tự vẽ tại nhà.",
    category: "kit", collection: "Tự tay làm gốm", price: 250000, stockQty: 15, rating: 4.8, reviewCount: 30,
    image: `${IMAGE_BASE}/product/products_18_JeyBqJt2.jpg`
  },
  {
    id: "29", sku: "THO-SCULPT-BIRD", name: "Tượng gốm chim nhỏ", detailName: "Tượng gốm chim nhỏ",
    description: "Một dáng chim tối giản, đặt cạnh sách hoặc khung cửa sổ.",
    category: "decor", collection: "Tượng nhỏ", price: 350000, stockQty: 6, rating: 4.6, reviewCount: 11,
    image: `${IMAGE_BASE}/product/products_19_HnBaRLbR.jpg`
  },
  {
    id: "30", sku: "THO-SCULPT-HOUSE", name: "Nhà gốm mini", detailName: "Nhà gốm mini",
    description: "Mái nhà nâu, thân men kem, hợp làm quà tân gia.",
    category: "decor", collection: "Tượng nhỏ", price: 410000, stockQty: 3, rating: 4.8, reviewCount: 14,
    image: `${IMAGE_BASE}/product/products_31_b9_KBLT6.jpg`
  },
  {
    id: "31", sku: "THO-SCULPT-FISH", name: "Tượng cá nhỏ tối giản", detailName: "Tượng cá nhỏ tối giản",
    description: "Tượng cá nhỏ tối giản mang ý nghĩa bình an, thích hợp bàn làm việc.",
    category: "decor", collection: "Tượng nhỏ", price: 380000, stockQty: 7, rating: 4.7, reviewCount: 12,
    image: `${IMAGE_BASE}/product/products_32_xMSsQzJr.jpg`
  },
  {
    id: "32", sku: "THO-SCULPT-CAT", name: "Tượng mèo lười cuộn tròn", detailName: "Tượng mèo lười cuộn tròn",
    description: "Tượng mèo lười cuộn tròn nghỉ ngơi tinh nghịch, men kem đất sét.",
    category: "decor", collection: "Tượng nhỏ", price: 340000, stockQty: 10, rating: 4.9, reviewCount: 25,
    image: `${IMAGE_BASE}/product/products_45_IIXtlWow.jpg`
  },
  {
    id: "33", sku: "THO-LAMP-WARM", name: "Đèn gốm ánh ấm", detailName: "Đèn gốm ánh ấm",
    description: "Chao đục lỗ thủ công, ánh sáng rơi thành những chấm mềm.",
    category: "decor", collection: "Ánh sáng gốm", price: 1180000, stockQty: 2, rating: 4.9, reviewCount: 9,
    image: `${IMAGE_BASE}/product/products_01_BgvtIMZW.jpg`
  },
  {
    id: "34", sku: "THO-LAMP-MOON", name: "Đèn trăng men sữa", detailName: "Đèn trăng men sữa",
    description: "Khối đèn tròn, men trắng đục, dành cho bàn ngủ hoặc góc đọc.",
    category: "decor", collection: "Ánh sáng gốm", price: 1320000, stockQty: 0, rating: 4.9, reviewCount: 7,
    image: `${IMAGE_BASE}/product/products_10_1ebeJYSP.jpg`
  },
  {
    id: "35", sku: "THO-LAMP-DESK", name: "Đèn bàn gốm cổ điển", detailName: "Đèn bàn gốm cổ điển",
    description: "Thân đèn gốm men chảy kết hợp chao vải ấm áp cho phòng làm việc.",
    category: "decor", collection: "Ánh sáng gốm", price: 1250000, stockQty: 4, rating: 4.8, reviewCount: 10,
    image: `${IMAGE_BASE}/product/products_11_dwM0Y9nV.jpg`
  },
  {
    id: "36", sku: "THO-LAMP-STONE", name: "Đèn ngủ gốm mộc dáng nấm", detailName: "Đèn ngủ gốm mộc dáng nấm",
    description: "Đèn ngủ gốm mộc phác thảo hình cây nấm rừng dễ thương.",
    category: "decor", collection: "Ánh sáng gốm", price: 980000, stockQty: 6, rating: 4.7, reviewCount: 5,
    image: `${IMAGE_BASE}/product/products_12_6Vco5y3w.jpg`
  }
];

const reviews = [
  { name: 'Nguyễn Thu Hà', date: '15/05/2026', rating: 5, title: 'Rất đáng thử', comment: 'Không gian ấm, nghệ nhân chỉ từng bước nên mình không bị ngợp dù lần đầu chạm đất.' },
  { name: 'Trần Minh Tuấn', date: '18/05/2026', rating: 5, title: 'Đi theo nhóm vui', comment: 'Combo đôi hợp để đi cuối tuần, có mã theo dõi thành phẩm sau workshop nên yên tâm.' },
  { name: 'Lê Phương Anh', date: '20/05/2026', rating: 4, title: 'Men đẹp', comment: 'Sản phẩm đóng gói kỹ. Màu men ngoài đời dịu hơn, mình sẽ quay lại làm bộ ly.' },
  { name: 'Phạm Gia Hân', date: '22/05/2026', rating: 5, title: 'Một món quà rất có hồn', comment: 'Chiếc đĩa men kem lên màu mềm, nhìn gần thấy rõ nét cọ nên cảm giác rất riêng.' },
  { name: 'Đỗ Nhật Nam', date: '24/05/2026', rating: 5, title: 'Workshop vừa đủ chậm', comment: 'Buổi nặn gốm không vội. Mình thích nhất đoạn được tự sửa dáng ly cho đến khi đúng tay mình.' },
  { name: 'Mai Thanh Vân', date: '26/05/2026', rating: 4, title: 'Theo dõi thành phẩm rõ ràng', comment: 'Sau workshop có mã tracking, biết món của mình đang phơi khô hay vào lò nên đỡ sốt ruột.' },
  { name: 'Hoàng Bảo Ngọc', date: '27/05/2026', rating: 5, title: 'Đóng gói rất yên tâm', comment: 'Bình nhỏ đến tay nguyên vẹn, lớp men ngoài đời sâu hơn ảnh và hợp đặt cạnh hoa khô.' },
];

/* Helper: format price in VND */
function formatVND(amount) {
  return amount.toLocaleString('vi-VN') + 'đ';
}

/* Dynamically generate upcoming workshop weekend dates starting from current local time */
function formatDynamicDates() {
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

  function getUpcomingWeekendDay(offsetWeeks, isSunday) {
    const d = new Date();
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    
    // Days until next Saturday (6)
    let daysUntilSat = 6 - dayOfWeek;
    if (daysUntilSat < 0) {
      daysUntilSat += 7;
    }
    
    let targetDays = daysUntilSat + (offsetWeeks * 7);
    if (isSunday) {
      targetDays += 1;
    }
    
    d.setDate(d.getDate() + targetDays);
    return d;
  }

  if (typeof workshops !== 'undefined' && Array.isArray(workshops)) {
    workshops.forEach((ws, index) => {
      // Alternate between Saturday and Sunday
      const isSunday = index % 2 === 1;
      const offsetWeeks = Math.floor(index / 2);
      const dateObj = getUpcomingWeekendDay(offsetWeeks, isSunday);
      
      const dd = String(dateObj.getDate()).padStart(2, '0');
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const yyyy = dateObj.getFullYear();
      
      ws.date = String(dateObj.getDate());
      ws.day = monthNames[dateObj.getMonth()];
      ws.startDate = `${yyyy}-${mm}-${dd}`;
      ws.fullDate = `${dayNames[dateObj.getDay()]}, ${dd}/${mm}/${yyyy}`;
    });
  }
}

// Call dynamic date formatting immediately
formatDynamicDates();

