# Heitz – Home refresh · Shopify install
Options: **9b · 3b · 4c · 10c · 5c · 6a · 7a · 8c**

| Option | What it is | File |
|---|---|---|
| 9b | Rotating announcement + arrows | `sections/heitz-hr-announcement.liquid` |
| 3b | Search-first header (sticky, currency, account, wishlist, cart) | `sections/heitz-hr-header.liquid` |
| 7a | Mega menu (columns + 2 image cards) · mobile accordion drawer | inside the header section |
| 5c | Full-screen search with live results | inside the header section |
| 8c | Wishlist popover (desktop) / bottom sheet (mobile) | inside the header section |
| 6a | Refined cart drawer: free-shipping bar, qty, remove, "Pairs well with", discount code, gold-seal saving, Checkout + PayPal / Apple Pay | `snippets/heitz-hr-cart-drawer.liquid` |
| 4c | Centred clean hero slideshow | `sections/heitz-hr-hero.liquid` |
| 10c | Trust badge icon cards | `sections/heitz-hr-trust.liquid` |

Test on a **duplicate theme** first (Online Store → Themes → … → Duplicate).

## 1. Upload the files (Edit code)
- **Assets:** `heitz-hr.css`, `heitz-hr.js`
- **Snippets:** `heitz-hr-icon.liquid`, `heitz-hr-currency.liquid`, `heitz-hr-cart-drawer.liquid`, `heitz-hr-wish-button.liquid`
- **Sections:** `heitz-hr-announcement.liquid`, `heitz-hr-header.liquid`, `heitz-hr-hero.liquid`, `heitz-hr-trust.liquid`

## 2. Theme settings
**Theme settings → Cart → Cart type: Page.** This stops the theme's own drawer from opening as well. Every "Add to cart" button on the site then opens the new 6a drawer. You can turn this off in the header section ("Open this cart drawer on every Add to cart").

## 3. Header area (theme editor → any page)
1. In the **Header** group, hide the current *Heitz announcement* and *Heitz header* sections (eye icon). Don't delete them, so you can switch back.
2. Add section → **Heitz announcement (9b)**. Add 2–4 messages.
3. Add section → **Heitz header (3b)**, directly below it. Then set:
   - Logo, Menu (`main-menu`). Links that have sub-links become mega-menu columns, e.g. *Shop by Type*, *Shop by Room*, *Outdoor*.
   - Highlight link: `Marked in Gold` (shown in bronze).
   - Track order link → your tracking page.
   - Countries: `US,GB,AU` (needs those markets turned on in **Settings → Markets**).
   - Blocks: add 2 × **Menu image card** (mega menu + mobile drawer) and 4 × **Search collection tile** (shown in search before typing).
   - Cart drawer: the free-shipping amount (0 = all orders ship free) and a fallback collection for "Pairs well with".

## 4. Home page
1. Hide the current hero and trust-badge sections.
2. Add section → **Heitz hero slideshow (4c)** at the top. Add a desktop image (2400 px wide) and an optional mobile image (1000 × 1400) for each slide.
3. Add section → **Heitz trust cards (10c)**, directly under the hero.

## 5. Wishlist hearts on product cards (optional, recommended)
The header wishlist works by itself. To let shoppers save items from a product card, open `snippets/card-gallery.liquid` and add this inside the image wrapper, which must be `position: relative`:
```liquid
{% render 'heitz-hr-wish-button', product: product %}
```
On the product page, add a **Custom Liquid** block with:
```liquid
{% render 'heitz-hr-wish-button', product: product, inline: true %}
```
The wishlist is saved in the shopper's browser (no app needed). It holds product handles under the key `heitz-wishlist`.

## Notes
- **Gold seal saving:** the drawer compares each variant's *compare-at price* with its price, so the "You're saving … with the gold seal" line works with the existing gold-seal setup.
- **Discount codes:** applied through Shopify's cart API. Codes that don't match the cart show "That code isn't valid for this cart".
- **PayPal / Apple Pay:** these are Shopify's own dynamic checkout buttons. They show only for payment methods turned on in **Settings → Payments**.
- **Currency:** prices change through Shopify Markets (the country picker submits the store's localization form), so totals are always the real market price.
- **Sticky header:** if it doesn't stick, the theme is wrapping the header group in an element with `overflow: hidden`. Remove that, or untick "Sticky header".
