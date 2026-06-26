import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Bell, Gift, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useProductCart } from '../contexts/ProductCartContext';
import { api } from '../lib/api';
import { AssetImage, productImages, ReviewStrip } from './DesignPrimitives';
import { fallbackCatalog, mapApiProduct, type CatalogProduct } from './ProductPage';

export type GiftOrderData = {
  id: string;
  product_id: string;
  product_name: string;
  occasion: string;
  include_wrapping: boolean;
  gift_note: string;
  created_at: string;
};

type GiftDraft = {
  occasion: string;
  includeWrapping: boolean;
  giftNote: string;
};

const defaultGiftDraft: GiftDraft = {
  occasion: 'Sinh nhật',
  includeWrapping: true,
  giftNote: '',
};

export function ProductDetailPage({
  onNavigateToCart,
  onGiftAdded,
}: {
  /** Gọi khi user bấm 'Mua ngay' — page quyết định điều hướng */
  onNavigateToCart?: () => void;
  /** Gọi khi user thêm quà tặng — page lưu gift order rồi redirect */
  onGiftAdded?: (giftOrder: GiftOrderData) => void;
}) {
  const { productId } = useParams();
  const { addProduct } = useProductCart();
  const fallback = fallbackCatalog().find((item) => item.id === productId) ?? null;
  const [product, setProduct] = useState<CatalogProduct | null>(fallback);
  const [loading, setLoading] = useState(!fallback);
  const [quantity, setQuantity] = useState(1);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [giftDraft, setGiftDraft] = useState<GiftDraft>(defaultGiftDraft);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (!productId) return;

    api.product(productId)
      .then((row) => setProduct(mapApiProduct(row, Number(productId) - 1)))
      .catch(() => {
        if (!fallback) setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const maxQuantity = product?.stockQty ?? 1;
  const quantityOptions = useMemo(() => Math.max(1, maxQuantity), [maxQuantity]);
  const galleryImages = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set([product.image, productImages.cupSet, productImages.crackleBowls, productImages.tealVase])).slice(0, 4);
  }, [product]);

  useEffect(() => {
    if (product) setSelectedImage(product.image);
  }, [product?.id, product?.image]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBEEE5] px-6 py-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-3 border-[#C0AC8B] border-t-[#716942] animate-spin" />
          <p className="text-[#7A6A58]">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

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
      toast.error(`Chỉ còn ${product.stockQty} sản phẩm trong kho.`);
      return;
    }

    toast.success('Đã thêm sản phẩm vào giỏ hàng.');
    // Page layer quyết định có redirect không
    if (goToCart) onNavigateToCart?.();
  };

  const increaseQuantity = () => {
    if (quantity >= quantityOptions) {
      toast.info(`Chỉ còn ${quantityOptions} sản phẩm trong kho.`);
      return;
    }
    setQuantity(quantity + 1);
  };

  const submitNotify = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success('THỔ sẽ gửi email khi sản phẩm có hàng lại.');
    setNotifyEmail('');
  };

  const addGiftToCart = () => {
    if (product.stockQty <= 0) {
      toast.error('Sản phẩm đang hết hàng.');
      return;
    }

    const giftId = `${product.id}-gift-${Date.now()}`;
    const ok = addProduct({
      id: giftId,
      name: `${product.detailName} · Quà tặng`,
      price: product.price,
      quantity,
      stockQty: product.stockQty,
      image: product.image,
      gift: {
        occasion: giftDraft.occasion,
        includeWrapping: giftDraft.includeWrapping,
        giftNote: giftDraft.giftNote.trim().slice(0, 100),
      },
    });

    if (!ok) {
      toast.error(`Chỉ còn ${product.stockQty} sản phẩm trong kho.`);
      return;
    }

    toast.success('Đã thêm quà tặng vào giỏ hàng.');
    // Page layer xử lý saveGiftOrder và redirect
    onGiftAdded?.({
      id: giftId,
      product_id: product.id,
      product_name: product.detailName,
      occasion: giftDraft.occasion,
      include_wrapping: giftDraft.includeWrapping,
      gift_note: giftDraft.giftNote.trim().slice(0, 100),
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-[#FBEEE5] text-[#361F17]">
      <section className="mx-auto grid max-w-[1440px] gap-10 px-6 py-14 lg:grid-cols-[0.95fr_1fr] lg:px-20">
        <div>
          <Link to="/product" className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C0AC8B] px-5 py-2 font-semibold text-[#716942] hover:bg-[#716942] hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Về trang sản phẩm
          </Link>
          <AssetImage src={selectedImage || product.image} alt={product.detailName} className="aspect-[4/4.4] rounded-lg" loading="eager" />
          <div className="mt-4 grid grid-cols-4 gap-3">
            {galleryImages.map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`overflow-hidden rounded-lg border bg-white p-1 ${
                  (selectedImage || product.image) === image ? 'border-[#716942] ring-2 ring-[#716942]/25' : 'border-[#EFD8C7]'
                }`}
                aria-label="Xem ảnh sản phẩm"
              >
                <AssetImage src={image} alt={product.detailName} className="aspect-square rounded-md" />
              </button>
            ))}
          </div>
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
                  <button onClick={increaseQuantity} className="px-4" aria-label="Tăng số lượng"><Plus className="h-4 w-4" /></button>
                </div>
                <span className="text-sm text-[#7A6A58]">Còn {product.stockQty} sản phẩm</span>
              </div>
              <div className="mt-8 rounded-lg border border-[#EFD8C7] bg-[#FFF8F2] p-5">
                <label className="flex items-center gap-3 font-bold text-[#361F17]">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(event) => setIsGift(event.target.checked)}
                    className="h-5 w-5 accent-[#716942]"
                  />
                  <span>Đây là quà tặng</span>
                </label>
                {isGift && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold">Dịp tặng</span>
                      <select
                        value={giftDraft.occasion}
                        onChange={(event) => setGiftDraft({ ...giftDraft, occasion: event.target.value })}
                        className="h-11 w-full rounded-lg border border-[#C0AC8B] bg-white px-4"
                      >
                        <option>Sinh nhật</option>
                        <option>Tân gia</option>
                        <option>Kỷ niệm</option>
                        <option>Lễ tốt nghiệp</option>
                        <option>Quà cảm ơn</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-3 self-end rounded-lg border border-[#E5CDBA] bg-white px-4 py-3 text-sm font-bold">
                      <input
                        type="checkbox"
                        checked={giftDraft.includeWrapping}
                        onChange={(event) => setGiftDraft({ ...giftDraft, includeWrapping: event.target.checked })}
                        className="h-4 w-4 accent-[#716942]"
                      />
                      <span>Thêm giấy gói quà</span>
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-bold">Ghi chú cho người nhận (tùy chọn, tối đa 100 ký tự)</span>
                      <textarea
                        value={giftDraft.giftNote}
                        maxLength={100}
                        onChange={(event) => setGiftDraft({ ...giftDraft, giftNote: event.target.value })}
                        className="min-h-[86px] w-full rounded-lg border border-[#C0AC8B] bg-white px-4 py-3"
                        placeholder="Ví dụ: Chúc mừng sinh nhật, mong bạn thích món gốm nhỏ này."
                      />
                    </label>
                    <p className="md:col-span-2 text-sm leading-6 text-[#6A5D52]">
                      Địa chỉ giao hàng sẽ được nhập một lần ở checkout. THỔ không tách địa chỉ người nhận riêng trong bản demo này.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => addToCart(false)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#716942] px-7 py-4 font-bold text-[#716942] hover:bg-[#716942] hover:text-white">
                  <ShoppingCart className="h-5 w-5" />
                  Thêm vào giỏ
                </button>
                <button onClick={() => addToCart(true)} className="flex-1 rounded-full bg-[#716942] px-7 py-4 font-bold text-white hover:opacity-90">
                  Mua ngay
                </button>
                <button onClick={isGift ? addGiftToCart : () => setIsGift(true)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#C96B37] px-7 py-4 font-bold text-white hover:opacity-90">
                  <Gift className="h-5 w-5" />
                  {isGift ? 'Thêm quà vào giỏ' : 'Mua làm quà'}
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
