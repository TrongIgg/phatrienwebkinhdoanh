import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router';
import { Bell, Search, ShoppingCart, Star } from 'lucide-react';
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

export function ProductPage() {
  const { addProduct } = useProductCart();
  const navigate = useNavigate();
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
  const groupedProducts = collections
    .filter((item) => item !== 'all')
    .map((name) => ({ name, items: paginatedProducts.filter((product) => product.collection === name) }))
    .filter((group) => group.items.length > 0);

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

        <section className="mt-12 grid gap-5 md:grid-cols-3">
          {collections.filter((item) => item !== 'all').slice(0, 3).map((item, index) => (
            <button
              key={item}
              type="button"
              onClick={() => setCollection(item)}
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

        <div className="mt-14 space-y-14">
          {groupedProducts.map((group) => (
            <section key={group.name}>
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

        {filteredProducts.length > pageSize && (
          <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Phân trang sản phẩm">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`h-10 min-w-10 rounded-full border px-4 font-bold transition-colors ${
                  currentPage === pageNumber
                    ? 'border-[#716942] bg-[#716942] text-white'
                    : 'border-[#C0AC8B] bg-[#FFF8F2] text-[#716942] hover:bg-[#EFE2D6]'
                }`}
                aria-current={currentPage === pageNumber ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            ))}
          </nav>
        )}

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

export type { CatalogProduct };
export { mapApiProduct, fallbackCatalog };
