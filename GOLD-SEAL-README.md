# Heitz – Gold Seal sale (1b) · Shopify install

Tested pattern for Online Store 2.0 themes (Dawn-based). Test it on a **duplicate theme** first.

## 1. Set up the sale products (no code)
For each selected product (Products → Bulk edit):
- **Compare-at price** = the original price (for example $269.95)
- **Price** = the sale price. The % can be different for each product (10%, 15%, 25%…). The seal and the "You save" card calculate the real % for each product automatically.
- Add the tag **`gold-seal`**

Products without the tag or without a compare-at price show their normal price and no seal.

## 2. Upload the files (Online Store → Themes → … → Edit code)
| File | Put in |
|---|---|
| `assets/heitz-gold-seal.css` | Assets → Add a new asset |
| `snippets/heitz-gold-seal.liquid` | Snippets |
| `snippets/heitz-gold-seal-price.liquid` | Snippets |
| `snippets/heitz-gold-seal-card-price.liquid` | Snippets |
| `sections/heitz-gold-seal-rail.liquid` | Sections |
| `sections/heitz-gold-seal-banner.liquid` | Sections |
| `sections/heitz-gold-seal-popup.liquid` | Sections |

## 3. Small theme edits
**a) Load the CSS on every page.** In `layout/theme.liquid`, before `</head>`:
```liquid
{{ 'heitz-gold-seal.css' | asset_url | stylesheet_tag }}
```

**b) Add the popup to every page.** In `layout/theme.liquid`, before `</body>`:
```liquid
{% section 'heitz-gold-seal-popup' %}
```

**c) Add the seal to product cards** (collection pages and search). In `snippets/card-product.liquid`, find the card image wrapper (`card__media` / `media`) and add this inside it:
```liquid
{% render 'heitz-gold-seal', product: card_product %}
```
Then replace the card price render (`{% render 'price', product: card_product … %}`) with:
```liquid
{% render 'heitz-gold-seal-card-price', product: card_product %}
```

**d) Product page price and the "You save" card.** In `sections/main-product.liquid`, find the price block (`{%- when 'price' -%}`) and replace its `{% render 'price' … %}` line with:
```liquid
{% render 'heitz-gold-seal-price', product: product %}
```

**e) Add the seal to the main product image.** In `snippets/product-media-gallery.liquid` (or the theme's main-image wrapper), add this inside the first media wrapper, which must have `position:relative`. If it doesn't, add the class `hgs-media-wrap`:
```liquid
{% render 'heitz-gold-seal', product: product, size: 'lg' %}
```

## 4. Theme editor
- **Home page:** Add section → **Gold seal rail**, then choose a collection that holds the gold-seal products. Tip: create a smart collection with the rule "Tag is equal to gold-seal".
- **Collection template:** Add section → **Gold seal banner**, above the product grid. The "On sale" chip filters by the tag.
- **Announcement bar:** text `Up to 30% off gold seal pieces · Already reduced`, link `Shop now` → the gold-seal collection. Background `#D9B97A`, text `#1A1B18`.
- **Popup:** Theme settings → the section in the footer/layout. You can set the delay and how many days before it shows again.

## Optional: change the tag name
To use a tag other than `gold-seal`, add this to `config/settings_schema.json`:
```json
{ "name": "Gold seal sale", "settings": [
  { "type": "text", "id": "hgs_tag", "label": "Sale tag", "default": "gold-seal" },
  { "type": "text", "id": "hgs_save_sub", "label": "Save card subtext", "default": "Gold seal price, applied automatically" }
]}
```

## Notes
- The variant price on the product page is rendered by Liquid. If the theme swaps the price with JS when the variant changes, keep the theme's `price-…` id on the wrapper. Otherwise the save card will show the first variant's values until the page reloads.
- The % is calculated for every product and variant separately (compare-at vs price). The collection banner shows the biggest % in that collection, and the popup seal % is set in the theme editor.
