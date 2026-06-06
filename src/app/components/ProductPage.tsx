import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router';
import { Bell, Check, ChevronLeft, ChevronRight, FolderOpen, Palette, Rotate3D, Search, ShoppingCart, Sparkles, Star, Type, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { useProductCart } from '../contexts/ProductCartContext';
import { api, type ApiProduct } from '../lib/api';
import { AssetImage, productImages } from './DesignPrimitives';

type CatalogProduct = {
  id: string;
  sku: string;
  name: string;
  detailName: string;
  description: string;
  category: string;
  collection: string;
  price: number;
  stockQty: number;
  rating: number;
  reviewCount: number;
  image: string;
};

type CustomizerShapeId = 'cup' | 'vase' | 'plate' | 'lamp';
type CustomizerGlazeId = 'milk' | 'moss' | 'amber' | 'ink';
type CustomizerFeatureId = 'handle' | 'speckles' | 'stamp' | 'wavyRim';

const customizerShapes: Array<{ id: CustomizerShapeId; label: string; brief: string }> = [
  { id: 'cup', label: 'Ly gốm', brief: 'Thân thấp, dễ tặng và dễ cá nhân hóa tên.' },
  { id: 'vase', label: 'Bình hoa', brief: 'Dáng cao, hợp ảnh draft có đường cong mềm.' },
  { id: 'plate', label: 'Đĩa decor', brief: 'Bề mặt rộng để thử chữ, logo hoặc hoa văn.' },
  { id: 'lamp', label: 'Đèn gốm', brief: 'Khối đứng, xem hiệu ứng lỗ sáng trên men.' },
];

const customizerGlazes: Array<{ id: CustomizerGlazeId; label: string; tone: string; shadow: string }> = [
  { id: 'milk', label: 'Men sữa', tone: '#F4E4D2', shadow: '#C7A98F' },
  { id: 'moss', label: 'Men rêu', tone: '#768A74', shadow: '#425846' },
  { id: 'amber', label: 'Đất nung', tone: '#C46F42', shadow: '#7F3F25' },
  { id: 'ink', label: 'Đen khói', tone: '#2D2A28', shadow: '#171412' },
];

const customizerFeatures: Array<{ id: CustomizerFeatureId; label: string }> = [
  { id: 'handle', label: 'Tay cầm' },
  { id: 'speckles', label: 'Chấm men' },
  { id: 'stamp', label: 'Dấu ký hiệu' },
  { id: 'wavyRim', label: 'Miệng lượn' },
];

const customizerShapeClass: Record<CustomizerShapeId, string> = {
  cup: 'h-44 w-32 rounded-b-[38px] rounded-t-[18px]',
  vase: 'h-56 w-32 rounded-b-[58px] rounded-t-[80px]',
  plate: 'h-20 w-64 rounded-[999px]',
  lamp: 'h-52 w-36 rounded-b-[44px] rounded-t-[18px]',
};

const imagePool = [
  productImages.cupSet,
  productImages.tealVase,
  productImages.crackleBowls,
  new URL('../../../image/product/products_22_BQ7UG7wM.jpg', import.meta.url).href,
  productImages.blackVase,
  new URL('../../../image/product/products_24_7G0kIv62.jpg', import.meta.url).href,
  new URL('../../../image/product/products_25_oBkdr5tE.jpg', import.meta.url).href,
  productImages.patternedVase,
  productImages.decor1,
  productImages.decor2,
  new URL('../../../image/product/products_34_dmo5Oqi3.jpg', import.meta.url).href,
  new URL('../../../image/product/products_35_H5fvYySi.jpg', import.meta.url).href,
  new URL('../../../image/product/products_36_--3LKfkt.jpg', import.meta.url).href,
  new URL('../../../image/product/products_37_YfzwprHv.jpg', import.meta.url).href,
  new URL('../../../image/product/products_39_GYTvV5NK.jpg', import.meta.url).href,
  new URL('../../../image/product/products_40_Uo2W75MB.jpg', import.meta.url).href,
  new URL('../../../image/product/products_44_ZtYNSUxF.jpg', import.meta.url).href,
  new URL('../../../image/product/products_46_L6TO4Nnl.jpg', import.meta.url).href,
  new URL('../../../image/product/products_47_K_HhVlO4.jpg', import.meta.url).href,
  productImages.decor3,
  new URL('../../../image/product/products_50_W6iNMkzM.jpg', import.meta.url).href,
];

const localDescriptions: Record<string, string> = {
  'THO-CELADON-S': 'Dáng oval nhỏ, men celadon xanh ngọc, hợp bàn trà hoặc kệ decor.',
  'THO-DIY-KIT': 'Bộ nguyên liệu, phôi gốm nhỏ, cọ và hướng dẫn để tự làm tại nhà.',
  'THO-CUP-MOON': 'Ly gốm trắng ánh trăng, cầm chắc tay, dùng hằng ngày hoặc làm quà.',
  'THO-VASE-SAND': 'Lọ hoa thân cao, đất mộc ấm, mỗi vân men khác nhau theo mẻ nung.',
  'THO-PLATE-LOTUS': 'Đĩa vẽ tay hoa sen, tách riêng ở khu hết hàng để khách đăng ký nhắc.',
  'THO-PLATE-STONE': 'Bề mặt nhám vừa phải, sắc đất trầm, hợp bày bánh và trái cây.',
  'THO-VASE-BLACK': 'Nền men đen sâu, miệng nhỏ, tạo điểm lặng cho góc phòng.',
  'THO-JAR-MILK': 'Hũ nhỏ có nắp, dùng đựng trà, muối tắm hoặc vật kỷ niệm.',
  'THO-TRAY-CLOUD': 'Khay thấp, vành cong nhẹ, dùng đặt trang sức hoặc tách trà.',
  'THO-INCENSE-ASH': 'Một miếng gốm nhỏ cho góc thiền, men xám tro và vệt hỏa biến.',
  'THO-CANDLE-CLAY': 'Chén gốm dày giữ nhiệt tốt, thơm mùi đất khi đặt cạnh nến.',
  'THO-KIT-FAMILY': 'Bộ phôi nhiều kích thước cho 3-4 người, có bảng gợi ý họa tiết.',
  'THO-KIT-COUPLE': 'Hai phôi ly, màu men đôi và thiệp nhỏ để ghi ngày làm cùng nhau.',
  'THO-SCULPT-BIRD': 'Một dáng chim tối giản, đặt cạnh sách hoặc khung cửa sổ.',
  'THO-SCULPT-HOUSE': 'Mái nhà nâu, thân men kem, hợp làm quà tân gia.',
  'THO-LAMP-WARM': 'Chao đục lỗ thủ công, ánh sáng rơi thành những chấm mềm.',
  'THO-LAMP-MOON': 'Khối đèn tròn, men trắng đục, dành cho bàn ngủ hoặc góc đọc.',
  'THO-CUP-DAWN': 'Thành ly mảnh, men chuyển sắc hồng đất, hợp cà phê sáng.',
  'THO-CUP-MOSS': 'Hai chiếc ly thấp, lòng men loang như rêu sau mưa.',
};

function mapApiProduct(product: ApiProduct, index: number): CatalogProduct {
  return {
    id: String(product.id),
    sku: product.sku,
    name: product.name,
    detailName: product.name,
    description: localDescriptions[product.sku] ?? 'Sản phẩm gốm thủ công được hoàn thiện từng chiếc tại THỔ Studio.',
    category: product.category,
    collection: product.collection,
    price: product.price_vnd,
    stockQty: product.stock_qty,
    rating: product.rating,
    reviewCount: product.review_count,
    image: product.image_url ?? imagePool[index % imagePool.length],
  };
}

function fallbackCatalog(): CatalogProduct[] {
  const seeds = [
    ['THO-CUP-DAWN', 'Ly sứ bình minh', 'Thành ly mảnh, men chuyển sắc hồng đất, hợp cà phê sáng.', 'cup', 'Bàn trà chậm', 260000, 12, 4.8, 34],
    ['THO-CUP-MOSS', 'Cặp ly men rêu', 'Hai chiếc ly thấp, lòng men loang như rêu sau mưa.', 'cup', 'Bàn trà chậm', 420000, 9, 4.9, 41],
    ['THO-BOWL-RAIN', 'Bát men mưa', 'Bát sâu lòng, vệt men chảy nhẹ, dùng cho trà, cháo hoặc decor.', 'tableware', 'Bàn ăn nghệ thuật', 310000, 16, 4.7, 22],
    ['THO-PLATE-LOTUS', 'Đĩa sen vẽ tay', 'Nét sen mảnh trên nền men kem, mỗi chiếc có một nhịp cọ riêng.', 'tableware', 'Bàn ăn nghệ thuật', 540000, 0, 4.8, 20],
    ['THO-PLATE-STONE', 'Đĩa đá mộc', 'Bề mặt nhám vừa phải, sắc đất trầm, hợp bày bánh và trái cây.', 'tableware', 'Bàn ăn nghệ thuật', 460000, 7, 4.6, 18],
    ['THO-VASE-CELADON', 'Bình men celadon oval', 'Dáng oval nhỏ, men celadon xanh ngọc, hợp bàn trà hoặc kệ decor.', 'decor', 'Men xanh nhẹ', 380000, 8, 4.8, 24],
    ['THO-VASE-TALL', 'Lọ hoa thân cao đất mộc', 'Dáng cao thanh, sắc đất cháy ấm, đẹp với một cành khô.', 'decor', 'Đất mộc hiện đại', 760000, 5, 4.6, 12],
    ['THO-VASE-BLACK', 'Bình đen khói', 'Nền men đen sâu, miệng nhỏ, tạo điểm lặng cho góc phòng.', 'decor', 'Đất mộc hiện đại', 820000, 4, 4.9, 16],
    ['THO-VASE-SAND', 'Bình cát biển', 'Men cát mờ, thân gốm hơi lệch cố ý để giữ cảm giác thủ công.', 'decor', 'Đất mộc hiện đại', 690000, 6, 4.7, 19],
    ['THO-JAR-MILK', 'Hũ sữa men kem', 'Hũ nhỏ có nắp, dùng đựng trà, muối tắm hoặc vật kỷ niệm.', 'decor', 'Men sữa', 330000, 10, 4.8, 27],
    ['THO-TRAY-CLOUD', 'Khay mây men trắng', 'Khay thấp, vành cong nhẹ, dùng đặt trang sức hoặc tách trà.', 'decor', 'Men sữa', 290000, 11, 4.7, 15],
    ['THO-INCENSE-ASH', 'Đế hương tro xám', 'Một miếng gốm nhỏ cho góc thiền, men xám tro và vệt hỏa biến.', 'decor', 'Men khói', 180000, 18, 4.6, 13],
    ['THO-CANDLE-CLAY', 'Chén nến đất nung', 'Chén gốm dày giữ nhiệt tốt, thơm mùi đất khi đặt cạnh nến.', 'decor', 'Men khói', 240000, 14, 4.8, 21],
    ['THO-KIT-GLAZE', 'DIY kit tô men cơ bản', 'Bộ phôi gốm, cọ, màu men và hướng dẫn để tiếp tục chơi đất tại nhà.', 'kit', 'Tự tay làm gốm', 220000, 24, 4.7, 18],
    ['THO-KIT-FAMILY', 'DIY kit gia đình', 'Bộ phôi nhiều kích thước cho 3-4 người, có bảng gợi ý họa tiết.', 'kit', 'Tự tay làm gốm', 620000, 8, 4.9, 29],
    ['THO-KIT-COUPLE', 'DIY kit cặp đôi', 'Hai phôi ly, màu men đôi và thiệp nhỏ để ghi ngày làm cùng nhau.', 'kit', 'Tự tay làm gốm', 390000, 12, 4.8, 25],
    ['THO-SCULPT-BIRD', 'Tượng gốm chim nhỏ', 'Một dáng chim tối giản, đặt cạnh sách hoặc khung cửa sổ.', 'decor', 'Tượng nhỏ', 350000, 6, 4.6, 11],
    ['THO-SCULPT-HOUSE', 'Nhà gốm mini', 'Mái nhà nâu, thân men kem, hợp làm quà tân gia.', 'decor', 'Tượng nhỏ', 410000, 3, 4.8, 14],
    ['THO-LAMP-WARM', 'Đèn gốm ánh ấm', 'Chao đục lỗ thủ công, ánh sáng rơi thành những chấm mềm.', 'decor', 'Ánh sáng gốm', 1180000, 2, 4.9, 9],
    ['THO-LAMP-MOON', 'Đèn trăng men sữa', 'Khối đèn tròn, men trắng đục, dành cho bàn ngủ hoặc góc đọc.', 'decor', 'Ánh sáng gốm', 1320000, 0, 4.9, 7],
  ] as const;

  return seeds.map(([sku, detailName, description, category, collection, price, stockQty, rating, reviewCount], index) => ({
    id: String(index + 1),
    sku,
    name: detailName,
    detailName,
    description,
    category,
    collection,
    price,
    stockQty,
    rating,
    reviewCount,
    image: imagePool[index % imagePool.length],
  }));
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function collectionAnchor(name: string) {
  return `collection-${normalize(name).replace(/[^a-z0-9]+/g, '-')}`;
}

export function ProductPage() {
  const { addProduct } = useProductCart();
  const navigate = useNavigate();
  const collectionRailRef = useRef<HTMLDivElement | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>(fallbackCatalog);
  const [query, setQuery] = useState('');
  const [collection, setCollection] = useState('all');
  const [stockMode, setStockMode] = useState('all');
  const [page, setPage] = useState(1);
  const [notifyProduct, setNotifyProduct] = useState<CatalogProduct | null>(null);
  const [notifyEmail, setNotifyEmail] = useState('');

  useEffect(() => {
    api.products()
      .then((rows) => setProducts(rows.map(mapApiProduct)))
      .catch(() => setProducts(fallbackCatalog()));
  }, []);

  const collections = useMemo(() => ['all', ...Array.from(new Set(products.map((item) => item.collection)))], [products]);
  const visibleCollections = collections.filter((item) => item !== 'all');

  useEffect(() => {
    setPage(1);
  }, [query, collection, stockMode]);

  const matchingProducts = products.filter((product) => {
    const text = normalize(`${product.name} ${product.detailName} ${product.description} ${product.collection}`);
    const queryOk = !query || text.includes(normalize(query));
    const collectionOk = collection === 'all' || product.collection === collection;
    return queryOk && collectionOk;
  });

  const filteredProducts = stockMode === 'soldout' ? [] : matchingProducts.filter((product) => product.stockQty > 0);
  const outOfStockProducts = stockMode === 'available' ? [] : matchingProducts.filter((product) => product.stockQty === 0);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const groupedProducts = visibleCollections
    .map((name) => ({ name, items: filteredProducts.filter((product) => product.collection === name) }))
    .filter((group) => group.items.length > 0);

  const jumpToCollection = (name: string) => {
    setCollection('all');
    window.setTimeout(() => {
      document.getElementById(collectionAnchor(name))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const scrollCollectionRail = (direction: 'left' | 'right') => {
    collectionRailRef.current?.scrollBy({
      left: direction === 'left' ? -360 : 360,
      behavior: 'smooth',
    });
  };

  const addOne = (product: CatalogProduct, goToCart = false) => {
    if (product.stockQty <= 0) {
      setNotifyProduct(product);
      return;
    }

    const ok = addProduct({
      id: product.id,
      name: product.detailName,
      price: product.price,
      quantity: 1,
      stockQty: product.stockQty,
      image: product.image,
    });

    if (!ok) {
      toast.error(`Chỉ còn ${product.stockQty} sản phẩm trong kho.`);
      return;
    }

    toast.success(`Đã thêm "${product.detailName}" vào giỏ hàng`);
    if (goToCart) navigate('/cart');
  };

  const submitNotify = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success('THỔ sẽ gửi email khi sản phẩm có hàng lại.');
    setNotifyEmail('');
    setNotifyProduct(null);
  };

  return (
    <div className="min-h-screen bg-[#FBEEE5] text-[#361F17]">
      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-20">
        <h1 className="text-center text-[56px] font-bold leading-tight text-[#643A2A]">Sản phẩm gốm thủ công</h1>
        <p className="mx-auto mt-4 max-w-3xl text-center text-xl leading-8 text-[#3F3F35]">
          Duyệt theo bộ sưu tập, xem tồn kho thật và mở trang chi tiết trước khi thêm vào giỏ.
        </p>

        <div className="mt-10 rounded-[18px] border border-[#C0AC8B] bg-[#FFF8F2] p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_230px_190px_auto]">
            <label className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#716942]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 w-full rounded-full border border-[#C0AC8B] bg-white pl-12 pr-5 outline-none focus:ring-2 focus:ring-[#716942]/25"
                placeholder="Tìm ly gốm, bình men, DIY kit..."
              />
            </label>
            <select value={collection} onChange={(event) => setCollection(event.target.value)} className="h-12 rounded-full border border-[#C0AC8B] bg-white px-5">
              {collections.map((item) => (
                <option key={item} value={item}>{item === 'all' ? 'Tất cả bộ sưu tập' : item}</option>
              ))}
            </select>
            <select value={stockMode} onChange={(event) => setStockMode(event.target.value)} className="h-12 rounded-full border border-[#C0AC8B] bg-white px-5">
              <option value="all">Tất cả tồn kho</option>
              <option value="available">Còn hàng</option>
              <option value="soldout">Hết hàng</option>
            </select>
            <button type="button" onClick={() => { setQuery(''); setCollection('all'); setStockMode('all'); setPage(1); }} className="h-12 rounded-full border border-[#716942]/40 px-5 font-semibold text-[#716942] hover:bg-[#716942] hover:text-white">
              Xóa lọc
            </button>
          </div>
        </div>

        <ProductMiniCustomizer />

        <section className="mt-12 grid gap-5 md:grid-cols-3">
          {visibleCollections.slice(0, 3).map((item, index) => (
            <button
              key={item}
              type="button"
              onClick={() => jumpToCollection(item)}
              className="overflow-hidden rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <AssetImage src={imagePool[index]} alt={item} className="h-44" />
              <div className="p-5">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#716942]">Bộ sưu tập</p>
                <h2 className="mt-2 text-2xl font-bold">{item}</h2>
              </div>
            </button>
          ))}
        </section>

        {visibleCollections.length > 0 && (
          <div className="mt-8 rounded-lg border border-[#D9BFAE] bg-[#FFF8F2] p-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => scrollCollectionRail('left')}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#C0AC8B] text-[#716942] hover:bg-[#716942] hover:text-white"
                aria-label="Xem bộ sưu tập trước"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div ref={collectionRailRef} className="flex flex-1 gap-3 overflow-x-auto scroll-smooth px-1 py-1">
                {visibleCollections.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => jumpToCollection(item)}
                    className="inline-flex min-w-max items-center gap-2 rounded-full border border-[#C0AC8B] bg-white px-5 py-3 text-sm font-bold text-[#716942] hover:bg-[#716942] hover:text-white"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EFE2D6] text-xs text-[#3B2118]">{index + 1}</span>
                    {item}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => scrollCollectionRail('right')}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#C0AC8B] text-[#716942] hover:bg-[#716942] hover:text-white"
                aria-label="Xem bộ sưu tập tiếp theo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-14 space-y-14">
          {groupedProducts.map((group) => (
            <section key={group.name} id={collectionAnchor(group.name)} className="scroll-mt-28">
              <div className="mb-5 flex items-end justify-between gap-4">
                <h2 className="text-3xl font-bold">{group.name}</h2>
                <span className="text-sm text-[#7A6A58]">{group.items.length} sản phẩm</span>
              </div>
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
                {group.items.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={() => addOne(product)} onBuy={() => addOne(product, true)} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {filteredProducts.length === 0 && outOfStockProducts.length === 0 && (
          <div className="mt-12 rounded-[18px] border border-[#EFD8C7] bg-[#FFF8F2] p-10 text-center text-[#6A5D52]">
            Chưa có sản phẩm phù hợp. Hãy xóa lọc hoặc thử từ khóa khác.
          </div>
        )}

        {outOfStockProducts.length > 0 && (
          <section className="mt-16 border-t border-[#D9BFAE] pt-10">
            <h2 className="text-3xl font-bold">Sản phẩm đang hết hàng</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {outOfStockProducts.map((product) => (
                <article key={product.id} className="rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-5 opacity-90">
                  <div className="relative">
                    <AssetImage src={product.image} alt={product.name} className="h-40 rounded-md" />
                    <span className="absolute left-3 top-3 rounded-full bg-[#A33A2F] px-3 py-1 text-xs font-bold text-white">
                      Hết hàng
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{product.detailName}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6A5D52]">{product.description}</p>
                  <button onClick={() => setNotifyProduct(product)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#716942] py-3 font-bold text-[#716942] hover:bg-[#716942] hover:text-white">
                    <Bell className="h-4 w-4" />
                    Nhắc khi có hàng
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>

      {notifyProduct && createPortal(
        <div className="fixed inset-0 z-[999] grid place-items-center bg-black/50 px-5 py-8">
          <form onSubmit={submitNotify} className="w-full max-w-md rounded-lg bg-[#FFF8F2] p-7 shadow-2xl">
            <h2 className="text-2xl font-bold">Nhắc khi có hàng</h2>
            <p className="mt-2 text-[#6A5D52]">{notifyProduct.detailName}</p>
            <input
              required
              type="email"
              value={notifyEmail}
              onChange={(event) => setNotifyEmail(event.target.value)}
              className="mt-5 h-12 w-full rounded-lg border border-[#C0AC8B] px-4 outline-none focus:ring-2 focus:ring-[#716942]/25"
              placeholder="email@example.com"
            />
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setNotifyProduct(null)} className="flex-1 rounded-full border border-[#716942]/40 py-3">Hủy</button>
              <button className="flex-1 rounded-full bg-[#716942] py-3 font-bold text-white">Gửi</button>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </div>
  );
}

function ProductCard({ product, onAdd, onBuy }: { product: CatalogProduct; onAdd: () => void; onBuy: () => void }) {
  return (
    <article className="product-card overflow-hidden rounded-lg bg-white shadow-[0_14px_36px_rgba(119,115,170,0.12)]">
      <Link to={`/product/${product.id}`}>
        <AssetImage src={product.image} alt={product.name} className="h-[190px]" />
      </Link>
      <div className="flex min-h-[250px] flex-col p-5">
        <div className="product-title-layer flex min-h-[74px] items-start justify-between gap-3">
          <Link to={`/product/${product.id}`} className="max-w-[220px] text-[21px] font-bold leading-[1.35] text-black hover:text-[#716942]">{product.detailName}</Link>
          <span className="shrink-0 rounded-full bg-[#EFE7E1] px-3 py-1 text-xs font-bold text-[#7A6A45]">
            Còn {product.stockQty}
          </span>
        </div>
        <p className="mt-2 min-h-[72px] border-t border-[#EFE2D6] pt-4 text-[15px] leading-7 text-[#6A6A6A]">{product.description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-[#716942]">
          <Star className="h-4 w-4 fill-[#716942]" />
          <span>{product.rating.toFixed(1)} · {product.reviewCount} đánh giá</span>
        </div>
        <p className="mt-4 text-2xl font-bold text-[#643A2A]">{product.price.toLocaleString('vi-VN')}đ</p>
        <div className="mt-auto flex gap-3 pt-5">
          <button onClick={onAdd} className="flex-1 rounded-full border border-[#716942] px-4 py-3 text-sm font-bold text-[#716942] hover:bg-[#716942] hover:text-white">
            Thêm giỏ
          </button>
          <button onClick={onBuy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#716942] px-4 py-3 text-sm font-bold text-white hover:opacity-85">
            <ShoppingCart className="h-4 w-4" />
            Mua ngay
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductMiniCustomizer() {
  const { addProduct } = useProductCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [shape, setShape] = useState<CustomizerShapeId>('cup');
  const [glaze, setGlaze] = useState<CustomizerGlazeId>('milk');
  const [features, setFeatures] = useState<CustomizerFeatureId[]>(['speckles', 'stamp']);
  const [engraving, setEngraving] = useState('THỔ 2026');
  const [brief, setBrief] = useState('Men chảy nhẹ, cảm giác thủ công, dùng làm quà tặng.');
  const [rotation, setRotation] = useState(24);
  const [draftImage, setDraftImage] = useState('');

  const selectedShape = customizerShapes.find((item) => item.id === shape) ?? customizerShapes[0];
  const selectedGlaze = customizerGlazes.find((item) => item.id === glaze) ?? customizerGlazes[0];
  const hasFeature = (id: CustomizerFeatureId) => features.includes(id);
  const basePrice = 420000;
  const multiplier = Math.min(2, 1.5 + features.length * 0.125);
  const customPrice = Math.round((basePrice * multiplier) / 10000) * 10000;
  const selectedFeatureLabels = customizerFeatures
    .filter((item) => features.includes(item.id))
    .map((item) => item.label);

  const toggleFeature = (id: CustomizerFeatureId) => {
    setFeatures((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleDraftUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setDraftImage(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  };

  const saveBrief = () => {
    toast.success('Đã dựng brief demo. Khách có thể gửi mẫu này cho THỔ tư vấn tiếp.');
  };

  const addCustomOrder = () => {
    addProduct({
      id: `custom-${Date.now()}`,
      name: `Mẫu custom ${selectedShape.label} · ${selectedGlaze.label}`,
      price: customPrice,
      quantity: 1,
      image: productImages.tealVase,
      custom: {
        shape: selectedShape.label,
        glaze: selectedGlaze.label,
        features: selectedFeatureLabels,
        engraving: engraving.trim(),
        brief: brief.trim(),
        multiplier,
        basePrice,
        artisanLeadDays: 3,
      },
    });
    toast.success('Đã thêm mẫu custom vào giỏ. Nghệ nhân sẽ nhận brief sau 3 ngày và liên hệ tư vấn.');
    navigate('/cart');
  };

  if (!open) {
    return (
      <section className="mt-10 rounded-lg border border-[#D9BFAE] bg-[#FFF8F2] p-5 shadow-[0_18px_44px_rgba(100,58,42,0.10)] sm:p-7">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid w-full gap-5 text-left md:grid-cols-[82px_1fr_auto] md:items-center"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-lg bg-[#EFE2D6] text-[#716942]">
            <FolderOpen className="h-10 w-10" />
          </span>
          <span>
            <span className="block text-sm font-bold uppercase tracking-[0.16em] text-[#716942]">Bạn muốn customizer?</span>
            <span className="mt-2 block text-3xl font-bold leading-tight text-[#3B2118]">Click vào đây để tự dựng mẫu sản phẩm</span>
            <span className="mt-2 block max-w-3xl leading-7 text-[#6A5D52]">
              Upload ảnh draft, chọn clickbox chi tiết, xem demo trên bàn xoay rồi đặt mẫu custom vào giỏ nếu khách quan tâm.
            </span>
          </span>
          <span className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-[#3B2118] px-6 py-3 font-bold text-[#FFF8F2]">
            Mở customizer
            <ChevronRight className="h-4 w-4" />
          </span>
        </button>
      </section>
    );
  }

  return (
    <section className="mt-10 overflow-hidden rounded-lg border border-[#D9BFAE] bg-[#FFF8F2] shadow-[0_18px_44px_rgba(100,58,42,0.10)]">
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="p-5 sm:p-7 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-[#716942]">
              <Sparkles className="h-4 w-4" />
              Mini game custom sản phẩm
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-[#C0AC8B] px-4 py-2 text-sm font-bold text-[#716942] hover:bg-[#716942] hover:text-white"
            >
              Thu gọn
            </button>
          </div>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-[#3B2118] sm:text-4xl">
            Biến ảnh draft của khách thành mẫu gốm demo
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-[#6A5D52]">
            Upload ảnh tham khảo, chọn dáng, men và vài chi tiết nhỏ. Khung bên phải sẽ dựng một mẫu giả lập trên bàn xoay để khách hình dung nhanh trước khi nhắn tư vấn.
          </p>

          <div className="mt-6 grid gap-4 xl:grid-cols-[220px_1fr]">
            <label className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#B79C84] bg-white text-center transition hover:border-[#716942] hover:bg-[#FBEEE5]">
              {draftImage ? (
                <img src={draftImage} alt="Draft khách upload" className="h-full min-h-[190px] w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-3 px-4 text-[#716942]">
                  <UploadCloud className="h-8 w-8" />
                  <span className="text-sm font-bold">Tải ảnh draft mẫu</span>
                  <span className="text-xs leading-5 text-[#7A6A58]">Ảnh phác thảo, moodboard hoặc mẫu khách thích</span>
                </span>
              )}
              <input type="file" accept="image/*" onChange={handleDraftUpload} className="sr-only" />
            </label>

            <div className="grid gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 font-bold text-[#361F17]">
                  <Sparkles className="h-4 w-4 text-[#716942]" />
                  Chọn dáng
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {customizerShapes.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setShape(item.id)}
                      className={`rounded-lg border p-3 text-left transition ${
                        shape === item.id ? 'border-[#716942] bg-[#EFE2D6]' : 'border-[#E5CDBA] bg-white hover:border-[#716942]'
                      }`}
                    >
                      <span className="block font-bold">{item.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#6A5D52]">{item.brief}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 font-bold text-[#361F17]">
                  <Palette className="h-4 w-4 text-[#716942]" />
                  Chọn men
                </div>
                <div className="flex flex-wrap gap-2">
                  {customizerGlazes.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGlaze(item.id)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
                        glaze === item.id ? 'border-[#716942] bg-[#716942] text-white' : 'border-[#C0AC8B] bg-white text-[#716942]'
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full border border-black/15" style={{ backgroundColor: item.tone }} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 font-bold text-[#361F17]">
                  <Check className="h-4 w-4 text-[#716942]" />
                  Clickbox chi tiết
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {customizerFeatures.map((item) => (
                    <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#E5CDBA] bg-white px-4 py-3 text-sm font-bold">
                      <input
                        type="checkbox"
                        checked={hasFeature(item.id)}
                        onChange={() => toggleFeature(item.id)}
                        className="h-4 w-4 accent-[#716942]"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[#361F17]">
                <Type className="h-4 w-4 text-[#716942]" />
                Chữ / ký hiệu trên mẫu
              </span>
              <input
                value={engraving}
                maxLength={18}
                onChange={(event) => setEngraving(event.target.value)}
                className="h-12 w-full rounded-lg border border-[#C0AC8B] bg-white px-4 outline-none focus:ring-2 focus:ring-[#716942]/25"
                placeholder="Ví dụ: tên, ngày, logo ngắn"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#361F17]">Yêu cầu khách muốn</span>
              <input
                value={brief}
                maxLength={90}
                onChange={(event) => setBrief(event.target.value)}
                className="h-12 w-full rounded-lg border border-[#C0AC8B] bg-white px-4 outline-none focus:ring-2 focus:ring-[#716942]/25"
                placeholder="Màu, cảm giác, dịp tặng..."
              />
            </label>
          </div>
          <div className="mt-5 rounded-lg border border-[#D9BFAE] bg-[#FBEEE5] p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#716942]">Giá gốc demo</p>
                <p className="mt-1 text-xl font-bold text-[#3B2118]">{basePrice.toLocaleString('vi-VN')}đ</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#716942]">Hệ số custom</p>
                <p className="mt-1 text-xl font-bold text-[#3B2118]">x{multiplier.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#716942]">Giá dự kiến</p>
                <p className="mt-1 text-xl font-bold text-[#C96B37]">{customPrice.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6A5D52]">
              Giá tăng theo số clickbox đã chọn, từ khoảng x1.5 đến x2.0. Sau khi đặt, nghệ nhân nhận brief sau 3 ngày và liên hệ lại để xác nhận khả năng làm thực tế.
            </p>
          </div>
        </div>

        <aside className="border-t border-[#E5CDBA] bg-[#EFE2D6] p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#716942]">Demo đang dựng</p>
              <h3 className="mt-2 text-2xl font-bold text-[#3B2118]">{selectedShape.label} · {selectedGlaze.label}</h3>
            </div>
            <button
              type="button"
              onClick={saveBrief}
              className="shrink-0 rounded-full bg-[#3B2118] px-5 py-3 text-sm font-bold text-[#FFF8F2] hover:opacity-90"
            >
              Lưu brief
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-[#D9BFAE] bg-[#FBEEE5] p-4">
            <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-lg bg-[radial-gradient(circle_at_center,#FFF8F2_0,#EFE2D6_58%,#DCC5B3_100%)]">
              <div className="absolute top-5 flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-bold text-[#716942] shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                THỔ đang dựng mẫu lên bàn xoay
              </div>

              <div className="absolute bottom-16 h-14 w-[310px] rounded-[999px] bg-[#B79C84] shadow-[0_18px_28px_rgba(54,31,23,0.22)]" />
              <div className="absolute bottom-20 h-8 w-[250px] rounded-[999px] bg-[#D8C1AE]" />

              <div
                className="relative z-10 flex h-[280px] w-[330px] items-center justify-center [perspective:900px]"
                style={{ transform: `rotateY(${rotation}deg)` }}
              >
                <div
                  className={`relative transition-all duration-500 ${customizerShapeClass[shape]}`}
                  style={{
                    transform: 'rotateX(4deg)',
                    background: `linear-gradient(145deg, ${selectedGlaze.tone} 0%, #fff8 48%, ${selectedGlaze.shadow} 100%)`,
                    boxShadow: '0 24px 44px rgba(54,31,23,0.24), inset -18px -18px 32px rgba(0,0,0,0.16), inset 14px 10px 24px rgba(255,255,255,0.22)',
                    borderTop: hasFeature('wavyRim') ? '9px dotted rgba(255,255,255,0.58)' : '9px solid rgba(255,255,255,0.34)',
                  }}
                >
                  {hasFeature('speckles') && (
                    <div className="absolute inset-4 rounded-[inherit] bg-[radial-gradient(circle,rgba(54,31,23,0.22)_1px,transparent_2px)] bg-[length:18px_18px] opacity-70" />
                  )}
                  {hasFeature('stamp') && (
                    <div className="absolute left-1/2 top-1/2 flex h-14 min-w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#3B2118]/25 bg-white/30 px-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-[#3B2118]">
                      {engraving || 'THỔ'}
                    </div>
                  )}
                  {hasFeature('handle') && shape !== 'plate' && (
                    <div className="absolute -right-9 top-1/2 h-20 w-12 -translate-y-1/2 rounded-r-full border-[10px] border-l-0 border-white/55" />
                  )}
                  {shape === 'lamp' && (
                    <div className="absolute inset-x-7 top-10 grid grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <span key={index} className="h-3 rounded-full bg-[#FFF8F2]/70 shadow-[0_0_12px_rgba(255,248,242,0.9)]" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[#361F17]">
                <Rotate3D className="h-4 w-4 text-[#716942]" />
                Xoay demo sản phẩm
              </span>
              <input
                type="range"
                min="-70"
                max="70"
                value={rotation}
                onChange={(event) => setRotation(Number(event.target.value))}
                className="w-full accent-[#716942]"
              />
            </label>
          </div>

          <div className="mt-4 rounded-lg border border-[#D9BFAE] bg-white/70 p-4">
            <p className="text-sm font-bold text-[#3B2118]">Brief demo gửi xưởng</p>
            <p className="mt-2 text-sm leading-6 text-[#6A5D52]">
              {selectedShape.label}, {selectedGlaze.label.toLowerCase()}, {features.length} chi tiết đã chọn. {brief}
            </p>
          </div>
          <div className="mt-4 rounded-lg border border-[#716942]/30 bg-[#FFF8F2] p-4">
            <p className="text-sm font-bold text-[#3B2118]">Thông báo đặt hàng custom</p>
            <p className="mt-2 text-sm leading-6 text-[#6A5D52]">
              Nếu khách quan tâm, mẫu này sẽ vào giỏ như một đơn custom. THỔ sẽ báo nghệ nhân nhận brief sau 3 ngày, sau đó liên hệ khách để chốt vật liệu, lịch làm và khả năng hoàn thiện.
            </p>
            <button
              type="button"
              onClick={addCustomOrder}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C96B37] px-6 py-4 font-bold text-white hover:opacity-90"
            >
              <ShoppingCart className="h-5 w-5" />
              Đặt mẫu custom {customPrice.toLocaleString('vi-VN')}đ
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

export type { CatalogProduct };
export { mapApiProduct, fallbackCatalog };
