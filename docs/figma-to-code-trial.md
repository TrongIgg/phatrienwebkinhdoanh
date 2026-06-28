# FigmaToCode trial workflow

This project is a React + Vite + Tailwind app, so FigmaToCode is useful as a
draft generator for selected Figma layers. Do not paste its output directly into
production pages without cleanup.

## When to use it

- Use it for one section, card, modal, or component at a time.
- Prefer layers that already use Auto Layout or clear vertical/horizontal frames.
- Avoid selecting a whole long page unless the goal is only a rough prototype.

## Figma setup before export

1. Wrap the target layer in a named frame, for example `WorkshopCard` or
   `StaffTrackerPanel`.
2. Use Auto Layout where possible.
3. Name image placeholders and repeated items clearly.
4. Keep text and icon layers separate if they need to become dynamic props.

## Plugin export

1. Open the FigmaToCode community plugin in Figma.
2. Select the target frame.
3. Choose Tailwind output.
4. Copy the generated code into a temporary note or paste it to Codex.

## Cleanup rules for this repo

- Convert generated `class` to `className`.
- Replace static repeated markup with `.map(...)`.
- Replace hard-coded images with assets from `DesignPrimitives.tsx` when possible.
- Replace ad hoc icons with `lucide-react` icons.
- Keep cards at `rounded-lg` or smaller unless the surrounding page already uses a
  different radius.
- Avoid nested cards and decorative gradient blobs.
- Move reusable UI into `src/app/components/ui` only when it is genuinely shared.
- Preserve current React state and handlers for cart, booking, checkout,
  payment, review submission, filtering, and routing.
- Preserve accessible controls: links stay as `Link`, form fields keep labels,
  and submit buttons keep their existing handlers.

## Paste checklist for Codex

When sending generated output back into this repo, include:

- Figma frame name
- Target app file
- Intended component or section name
- Tailwind/HTML output from FigmaToCode
- Screenshot of the Figma frame if possible
- Notes about what must stay dynamic, for example price, product quantity,
  booking countdown, review rating, or selected payment method

## Customer UI scope

The first trial should focus only on the customer-facing experience:

- Home page
- Workshop listing and workshop detail
- Product listing and product detail
- Review page and review blocks
- Cart, booking form, checkout, payment result pages

Staff/admin screens are intentionally out of scope for this trial.

## Recommended customer targets

Use FigmaToCode on small frames in this order:

1. Home hero and primary CTA area
2. Workshop card
3. Workshop filter bar
4. Product card
5. Product detail purchase panel
6. Review form and review card
7. Cart line item
8. Checkout contact form
9. Checkout order summary
10. QR/payment confirmation panel

Avoid exporting the whole Home, Workshop, Product, Review, or Checkout page in
one pass. The current app already has routing, state, carts, booking holds,
tracking records, and checkout logic; generated code should replace only the
visual layer around that logic.

## Recommended target files

- Home or landing sections: `src/app/components/HomePage.tsx`
- Workshop listing/detail: `src/app/components/WorkshopPage.tsx`,
  `src/app/components/WorkshopDetailPage.tsx`
- Product listing/detail: `src/app/components/ProductPage.tsx`,
  `src/app/components/ProductDetailPage.tsx`
- Reviews: `src/app/components/ReviewPage.tsx`
- Cart and payment flow: `src/app/components/CartPage.tsx`,
  `src/app/components/BookingForm.tsx`, `src/app/components/CheckoutPage.tsx`,
  `src/app/components/PaymentSuccess.tsx`,
  `src/app/components/PaymentFailure.tsx`
- Shared imagery/tokens: `src/app/components/DesignPrimitives.tsx`

## First trial target

Start with one compact component, not a full page:

- `WorkshopCard`
- `ProductCard`
- `ReviewCard`
- `CheckoutSummary`

After the generated Tailwind is pasted into Codex, refactor it into a typed React
component and run:

```bash
npm run build
```
