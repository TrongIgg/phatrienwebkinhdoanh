import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Clock, Minus, Plus, ShoppingBag, TimerReset, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useProductCart } from '../contexts/ProductCartContext';
import { useWorkshopCart } from '../contexts/WorkshopCartContext';
import { AssetImage, CheckoutShell, PlaceholderImage, PolicyBar, workshopImages } from './DesignPrimitives';

const CHECKOUT_PRODUCT_IDS_KEY = 'tho-checkout-product-ids';

export function CartPage() {
  const navigate = useNavigate();
  const { productItems, removeProduct, updateProductQuantity } = useProductCart();
  const { workshopItems, removeWorkshop, updateWorkshopTickets, workshopTotal } = useWorkshopCart();
  const [now, setNow] = useState(Date.now());
  const [removingIds, setRemovingIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() => productItems.map((item) => item.id));

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const nearestWorkshop = workshopItems.reduce<(typeof workshopItems)[number] | null>((nearest, item) => {
    if (!nearest) return item;
    return item.reservedUntil < nearest.reservedUntil ? item : nearest;
  }, null);
  const remainingMs = nearestWorkshop ? nearestWorkshop.reservedUntil - now : 0;
  const hasProducts = productItems.length > 0;
  const hasWorkshops = workshopItems.length > 0;
  const selectedProducts = productItems.filter((item) => selectedProductIds.includes(item.id));
  const selectedProductTotal = selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedProductCount = selectedProducts.reduce((sum, item) => sum + item.quantity, 0);
  const selectedOrderTotal = selectedProductTotal + workshopTotal;
  const hasCustomProducts = productItems.some((item) => item.custom);

  const formatTime = (ms: number) => {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRemoveProduct = (id: string) => {
    setRemovingIds((prev) => [...prev, id]);
    setSelectedProductIds((prev) => prev.filter((itemId) => itemId !== id));
    window.setTimeout(() => removeProduct(id), 320);
  };

  const handleRemoveWorkshop = (id: string) => {
    setRemovingIds((prev) => [...prev, id]);
    window.setTimeout(() => removeWorkshop(id), 320);
  };

  useEffect(() => {
    setSelectedProductIds((prev) => {
      const productIds = productItems.map((item) => item.id);
      const kept = prev.filter((id) => productIds.includes(id));
      const added = productIds.filter((id) => !prev.includes(id));
      return [...kept, ...added];
    });
  }, [productItems]);

  useEffect(() => {
    window.sessionStorage.setItem(CHECKOUT_PRODUCT_IDS_KEY, JSON.stringify(selectedProductIds));
  }, [selectedProductIds]);

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  };

  const toggleAllProducts = () => {
    setSelectedProductIds((prev) =>
      prev.length === productItems.length ? [] : productItems.map((item) => item.id),
    );
  };

  if (!hasProducts && !hasWorkshops) {
    return (
      <CheckoutShell active={1}>
        <section className="mx-auto max-w-[980px] px-6 py-16">
          <button onClick={() => navigate(-1)} className="back-btn mb-8" type="button">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>

          <div className="empty-state rounded-[24px] border-2 border-[#EFD8C7] bg-[#FFF1E8]">
            <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-[#EFE2D6]">
              <ShoppingBag className="h-11 w-11 text-[#716942]" />
            </div>
            <h1 className="text-4xl font-bold text-[#2B211D]">Giỏ hàng đang trống</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[#6E4E3F]">
              Chọn một workshop hoặc món gốm yêu thích để bắt đầu đơn hàng. Sản phẩm đã thêm sẽ được giữ lại khi bạn reload trang.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link to="/product" className="rounded-full bg-[#3A1F17] px-8 py-3 font-semibold text-white">
                Mua sản phẩm
              </Link>
              <Link to="/workshop" className="rounded-full border border-[#3A1F17]/25 px-8 py-3 font-semibold text-[#3A1F17]">
                Đặt workshop
              </Link>
            </div>
          </div>
        </section>
        <PolicyBar />
      </CheckoutShell>
    );
  }

  return (
    <CheckoutShell active={1}>
      <section className="mx-auto grid max-w-[1440px] gap-10 px-6 py-12 lg:grid-cols-[1fr_420px] lg:px-20">
        <div>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button onClick={() => navigate(-1)} className="back-btn mb-5" type="button">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </button>
              <h1 className="text-[34px] font-bold text-[#2B211D]">Giỏ hàng của bạn</h1>
            </div>
            <Link to="/product" className="rounded-full border border-[#3A1F17]/25 px-6 py-3 text-center font-semibold text-[#3A1F17] hover:bg-[#3A1F17] hover:text-white">
              Tiếp tục mua sắm
            </Link>
          </div>

          {workshopItems.length > 0 && (
            <div className="mb-6">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#EFE7E1] px-5 py-2 text-sm font-bold text-[#7A3E2D]">Vé Workshop</span>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#8B765D]">
                  <TimerReset className="h-4 w-4" />
                  Giữ chỗ còn {formatTime(remainingMs)}
                </span>
              </div>

              <div className="space-y-5">
                {workshopItems.map((item) => (
                  <article
                    key={item.id}
                    className={`rounded-[18px] border-2 border-[#EFD8C7] bg-[#FFF1E8] p-5 ${removingIds.includes(item.id) ? 'cart-item-removing' : ''}`}
                  >
                    <div className="grid gap-5 md:grid-cols-[96px_1fr_auto]">
                      <AssetImage src={workshopImages.handsWarm} alt={item.name} className="h-[87px] w-[87px] rounded-[12px]" />
                      <div>
                        <h2 className="text-lg font-bold text-[#2B211D]">{item.name}</h2>
                        <p className="mt-3 text-sm text-[#6E4E3F]">{item.date} · {item.time}</p>
                        <p className="mt-3 text-sm text-[#8A715F]">Giảng viên: {item.instructor}</p>
                        <p className="mt-2 text-sm text-[#8A715F]">Gói: {item.package}</p>
                        <div className="mt-5 flex flex-wrap items-center gap-4">
                          <span className="text-sm font-bold text-[#6E4E3F]">Số slot</span>
                          <div className="inline-flex h-10 items-center rounded-full border border-[#E5CDBA] bg-white">
                            <button
                              onClick={() => updateWorkshopTickets(item.id, item.tickets - 1)}
                              className="px-4"
                              aria-label="Giảm số slot workshop"
                              type="button"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-10 text-center font-bold">{item.tickets}</span>
                            <button
                              onClick={() => {
                                if (item.maxTickets && item.tickets >= item.maxTickets) {
                                  toast.error(`Workshop chỉ còn ${item.maxTickets} slot.`);
                                  return;
                                }
                                updateWorkshopTickets(item.id, item.tickets + 1);
                              }}
                              className="px-4"
                              aria-label="Tăng số slot workshop"
                              type="button"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-8 md:text-right">
                        <p className="text-2xl text-[#2B211D]">{(item.price * item.tickets).toLocaleString('vi-VN')}đ</p>
                        <button onClick={() => handleRemoveWorkshop(item.id)} className="text-[#BFA083] hover:text-[#A33A2F]" aria-label="Xóa workshop" type="button">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {productItems.length > 0 && (
            <div className="mt-10">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#EFE7E1] px-5 py-2 text-sm text-[#7A6A45]">Sản phẩm vật lý</span>
                <span className="text-sm font-bold text-[#8B765D]">Giao tận nơi</span>
                <button
                  type="button"
                  onClick={toggleAllProducts}
                  className="rounded-full border border-[#C0AC8B] px-4 py-2 text-sm font-bold text-[#716942] hover:bg-[#716942] hover:text-white"
                >
                  {selectedProductIds.length === productItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>

              <div className="space-y-5">
                {productItems.map((item) => (
                  <article
                    key={item.id}
                    className={`rounded-[18px] border-2 border-[#EFD8C7] bg-[#FFF1E8] p-5 ${removingIds.includes(item.id) ? 'cart-item-removing' : ''}`}
                  >
                    <div className="grid gap-5 md:grid-cols-[40px_96px_1fr_auto]">
                      <label className="flex items-start pt-2" aria-label={`Chọn thanh toán ${item.name}`}>
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(item.id)}
                          onChange={() => toggleProduct(item.id)}
                          className="h-5 w-5 accent-[#716942]"
                        />
                      </label>
                      {item.image ? (
                        <AssetImage src={item.image} alt={item.name} className="h-[87px] w-[87px] rounded-[12px]" />
                      ) : (
                        <PlaceholderImage className="h-[87px] w-[87px] rounded-[12px]" label="" />
                      )}
                      <div>
                        <h2 className="text-lg font-bold text-[#2B211D]">{item.name}</h2>
                        {item.gift && (
                          <div className="mt-3 rounded-lg border border-[#E5CDBA] bg-white/70 p-3 text-sm leading-6 text-[#6E4E3F]">
                            <p className="font-bold text-[#C96B37]">Quà tặng · {item.gift.occasion}</p>
                            <p>{item.gift.includeWrapping ? 'Có thêm giấy gói quà' : 'Không cần giấy gói quà'}</p>
                            {item.gift.giftNote && <p>Ghi chú: {item.gift.giftNote}</p>}
                            <p className="text-xs text-[#8A715F]">Địa chỉ nhận hàng sẽ nhập ở checkout.</p>
                          </div>
                        )}
                        {item.custom && (
                          <div className="mt-3 rounded-lg border border-[#C96B37]/30 bg-white/75 p-3 text-sm leading-6 text-[#6E4E3F]">
                            <p className="font-bold text-[#C96B37]">Đơn custom · Nghệ nhân liên hệ sau {item.custom.artisanLeadDays} ngày</p>
                            <p>{item.custom.shape} · {item.custom.glaze} · Hệ số x{item.custom.multiplier.toFixed(2)}</p>
                            {item.custom.features.length > 0 && <p>Chi tiết: {item.custom.features.join(', ')}</p>}
                            {item.custom.engraving && <p>Ký hiệu: {item.custom.engraving}</p>}
                            {item.custom.brief && <p>Yêu cầu: {item.custom.brief}</p>}
                          </div>
                        )}
                        <div className="mt-6 flex items-center gap-5">
                          <button
                            onClick={() => updateProductQuantity(item.id, item.quantity - 1)}
                            className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-[#E5CDBA] hover:bg-white"
                            aria-label="Giảm số lượng"
                            type="button"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-8 text-center text-2xl">{item.quantity}</span>
                          <button
                            onClick={() => {
                              if (item.stockQty !== undefined && item.quantity >= item.stockQty) {
                                toast.error(`Chỉ còn ${item.stockQty} sản phẩm trong kho.`);
                                return;
                              }
                              updateProductQuantity(item.id, item.quantity + 1);
                            }}
                            className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-[#E5CDBA] hover:bg-white"
                            aria-label="Tăng số lượng"
                            type="button"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-start gap-8 md:text-right">
                        <p className="text-2xl text-[#2B211D]">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                        <button onClick={() => handleRemoveProduct(item.id)} className="text-[#BFA083] hover:text-[#A33A2F]" aria-label="Xóa sản phẩm" type="button">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="sticky top-28 h-fit rounded-[18px] border-2 border-[#EFD8C7] bg-[#FFF1E8] p-7">
          <h2 className="mb-6 text-[32px] font-normal text-black">Tóm tắt đơn hàng</h2>
          <div className="space-y-4 text-xl">
            {hasWorkshops && (
              <div className="flex justify-between text-[#756D4E]">
                <span>Workshop ({workshopItems.reduce((sum, item) => sum + item.tickets, 0)} slot)</span>
                <span>{workshopTotal.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            {hasProducts && (
              <div className="flex justify-between text-[#756D4E]">
                <span>Sản phẩm đã chọn ({selectedProductCount} món)</span>
                <span>{selectedProductTotal.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
          </div>
          <div className="my-7 border-t border-[#E8D6C9]" />
          <div className="flex justify-between text-2xl text-[#3A2A24]">
            <span>Tạm tính</span>
            <span>{selectedOrderTotal.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="mt-6 rounded-[20px] bg-[#EFE2D6] p-5 text-[#7A6A58]">
            {hasCustomProducts
              ? 'Giỏ hàng có mẫu custom. Sau khi thanh toán, THỔ sẽ chuyển brief cho nghệ nhân trong 3 ngày và liên hệ lại để xác nhận chi tiết làm sản phẩm.'
              : hasProducts && hasWorkshops
              ? 'Bạn đang có cả sản phẩm và workshop. Hai luồng thanh toán được tách riêng để sản phẩm có địa chỉ giao hàng, còn workshop giữ slot 15 phút.'
              : hasWorkshops
                ? 'Vé workshop không cần địa chỉ giao hàng. Slot được giữ 15 phút và có thể đăng ký nhiều người trong cùng một đơn.'
                : 'Sản phẩm vật lý sẽ được thanh toán với địa chỉ giao hàng và phí vận chuyển ở bước tiếp theo.'}
          </div>
          <div className="mt-8 space-y-3">
            {hasProducts && (
              <Link
                to="/checkout?mode=product"
                onClick={(event) => {
                  if (selectedProducts.length === 0) {
                    event.preventDefault();
                    toast.error('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
                  }
                }}
                className={`block rounded-full py-4 text-center text-lg font-semibold text-white hover:bg-[#2B160F] ${
                  selectedProducts.length === 0 ? 'bg-[#8B765D] opacity-70' : 'bg-[#3A1F17]'
                }`}
              >
                Thanh toán sản phẩm
              </Link>
            )}
            {hasWorkshops && (
              <Link to="/checkout?autopay=workshop" className="block rounded-full border border-[#3A1F17]/25 py-4 text-center text-lg font-semibold text-[#3A1F17] hover:bg-[#3A1F17] hover:text-white">
                Thanh toán vé workshop
              </Link>
            )}
          </div>
          {nearestWorkshop && (
            <div className="mt-5 flex items-center gap-2 text-sm text-[#8B765D]">
              <Clock className="h-4 w-4" />
              Giữ chỗ workshop còn {formatTime(remainingMs)}
            </div>
          )}
        </aside>
      </section>
      <PolicyBar />
    </CheckoutShell>
  );
}
