/* ===== THỔ Studio - Cart Manager (localStorage) ===== */

const PRODUCT_CART_KEY = 'tho-product-cart';
const WORKSHOP_CART_KEY = 'tho-workshop-cart';
const ORDER_KEY = 'tho-last-order';
const CART_CHANGED_EVENT = 'tho-cart-changed';

/* ---- Product Cart ---- */
function readProductCart() {
  try {
    const data = localStorage.getItem(PRODUCT_CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveProductCart(items) {
  localStorage.setItem(PRODUCT_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
}

function addProductToCart(product) {
  const items = readProductCart();
  const existing = items.find(i => i.id === product.id);
  if (existing) {
    existing.quantity += (product.quantity || 1);
  } else {
    items.push({ ...product, type: 'product', quantity: product.quantity || 1 });
  }
  saveProductCart(items);
  return true;
}

function removeProductFromCart(id) {
  const items = readProductCart().filter(i => i.id !== id);
  saveProductCart(items);
}

function updateProductQuantity(id, quantity) {
  const items = readProductCart().map(i =>
    i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
  );
  saveProductCart(items);
}

function clearProductCart() {
  saveProductCart([]);
}

function getProductTotal() {
  return readProductCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function getProductCount() {
  return readProductCart().reduce((sum, i) => sum + i.quantity, 0);
}

/* ---- Workshop Cart ---- */
function readWorkshopCart() {
  try {
    const data = localStorage.getItem(WORKSHOP_CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveWorkshopCart(items) {
  localStorage.setItem(WORKSHOP_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
}

function addWorkshopToCart(workshop) {
  const reservedUntil = Date.now() + 15 * 60 * 1000;
  // Replace existing workshop cart with new one (single workshop at a time)
  saveWorkshopCart([{ ...workshop, type: 'workshop', reservedUntil }]);
}

function removeWorkshopFromCart(id) {
  const items = readWorkshopCart().filter(i => i.id !== id);
  saveWorkshopCart(items);
}

function clearWorkshopCart() {
  saveWorkshopCart([]);
}

function getWorkshopTotal() {
  return readWorkshopCart()
    .filter(i => i.reservedUntil > Date.now())
    .reduce((sum, i) => sum + i.price * (i.tickets || 1), 0);
}

function getWorkshopTicketCount() {
  return readWorkshopCart()
    .filter(i => i.reservedUntil > Date.now())
    .reduce((sum, i) => sum + (i.tickets || 1), 0);
}

/* ---- Combined Cart Count ---- */
function getTotalCartCount() {
  return getProductCount() + getWorkshopTicketCount();
}

/* ---- Order Data ---- */
function saveOrderData(order) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(order));
}

function readOrderData() {
  try {
    const data = localStorage.getItem(ORDER_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function clearOrderData() {
  localStorage.removeItem(ORDER_KEY);
}
