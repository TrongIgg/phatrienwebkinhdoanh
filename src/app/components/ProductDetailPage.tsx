import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Bell, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../contexts/CartContext';
import { api } from '../lib/api';
import { AssetImage, ReviewStrip } from './DesignPrimitives';
import { fallbackCatalog, mapApiProduct, type CatalogProduct } from './ProductPage';

export function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addProduct } = useCart();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notifyEmail, setNotifyEmail] = useState('');

  useEffect(() => {
    if (!productId) return;

    api.product(productId)
      .then((row) => setProduct(mapApiProduct(row, Number(productId) - 1)))
      .catch(() => setProduct(fallbackCatalog().find((item) => item.id === productId) ?? null));
  }, [productId]);

  const maxQuantity = product?.stockQty ?? 1;
  const quantityOptions = useMemo(() => Math.max(1, maxQuantity), [maxQuantity]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FBEEE5] px-6 py-20 text-center text-[#361F17]">
        <p>Không tìm thấy sản phẩm.</p>
        <Link to="/product" className="mt-5 inline-flex rounded-full border border-[#716942] px-6 py-3">Quay lại sản phẩm</Link>
      </div>
    );
  }

  const addToCart = (goToCart = false) => {
    if (product.stockQty <= 0) {
      toast.error('Sản phẩm đang hết hàng. Bạn có thể đăng ký nhắc khi có hàng.');
      return;
    }

    const ok = addProduct({
      id: product.id,
      name: product.detailName,
      price: product.price,
      quantity,
      stockQty: product.stockQty,
      image: product.image,
    });

    if (!ok) {
      toast.error('Không đủ hàng trong kho cho số lượng bạn chọn.');
      return;
    }

    toast.success('Đã thêm sản phẩm vào giỏ hàng.');
    if (goToCart) navigate('/cart');
  };

  const submitNotify = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success('THỔ sẽ gửi email khi sản phẩm có hàng lại.');
    setNotifyEmail('');
  };

  return (
    <div className="min-h-screen bg-[#FBEEE5] text-[#361F17]">
      <section className="mx-auto grid max-w-[1440px] gap-10 px-6 py-14 lg:grid-cols-[0.95fr_1fr] lg:px-20">
        <div>
          <button onClick={() => navigate('/product')} className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C0AC8B] px-5 py-2 font-semibold text-[#716942] hover:bg-[#716942] hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Sản phẩm
          </button>
          <AssetImage src={product.image} alt={product.detailName} className="aspect-[4/4.4] rounded-lg" loading="eager" />
        </div>

        <div className="self-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#716942]">{product.collection}</p>
          <h1 className="mt-3 text-5xl font-bold leading-tight text-[#3B2118]">{product.detailName}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[#716942]">
            <span className="inline-flex items-center gap-1">
              <Star className="h-5 w-5 fill-[#716942]" />
              {product.rating.toFixed(1)}
            </span>
            <span>{product.reviewCount} đánh giá sản phẩm</span>
            <Link to="/review#review-form" className="font-bold underline">Viết review</Link>
          </div>
          <p className="mt-7 text-xl leading-9 text-[#6A5D52]">{product.description}</p>
          <p className="mt-7 text-4xl font-bold text-[#643A2A]">{product.price.toLocaleString('vi-VN')}đ</p>

          {product.stockQty > 0 ? (
            <>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="inline-flex h-12 items-center rounded-full border border-[#C0AC8B] bg-white">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4" aria-label="Giảm số lượng"><Minus className="h-4 w-4" /></button>
                  <span className="min-w-12 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(quantityOptions, quantity + 1))} className="px-4" aria-label="Tăng số lượng"><Plus className="h-4 w-4" /></button>
                </div>
                <span className="text-sm text-[#7A6A58]">Còn {product.stockQty} sản phẩm</span>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => addToCart(false)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#716942] px-7 py-4 font-bold text-[#716942] hover:bg-[#716942] hover:text-white">
                  <ShoppingCart className="h-5 w-5" />
                  Thêm vào giỏ
                </button>
                <button onClick={() => addToCart(true)} className="flex-1 rounded-full bg-[#716942] px-7 py-4 font-bold text-white hover:opacity-90">
                  Mua ngay
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={submitNotify} className="mt-8 rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-5">
              <h2 className="text-xl font-bold">Sản phẩm đang hết hàng</h2>
              <p className="mt-2 text-[#6A5D52]">Để lại email, THỔ sẽ nhắc bạn khi sản phẩm quay lại kho.</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input required type="email" value={notifyEmail} onChange={(event) => setNotifyEmail(event.target.value)} className="h-12 flex-1 rounded-lg border border-[#C0AC8B] px-4" placeholder="email@example.com" />
                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#716942] px-6 font-bold text-white">
                  <Bell className="h-4 w-4" />
                  Nhắc tôi
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-20 lg:px-20">
        <h2 className="mb-6 text-3xl font-bold">Đánh giá cho sản phẩm này</h2>
        <ReviewStrip />
      </section>
    </div>
  );
}
