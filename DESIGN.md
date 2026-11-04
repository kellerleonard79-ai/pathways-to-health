# Verdant — Design Scheme v1.0

> **Quiet rooms, *green light.***
>
> A mostly white scheme. Green carries the type and the actions. Gold is used sparingly, for rules, marks and the occasional italic on green.

Source: `Color and type pairings exploration.pdf` (Verdant · Gallery White scheme). Colors are sampled from the logo (`logo.PNG`): a green disc with a gold ring, a white caduceus, and a gold torch flame.

---

## Principles

1. **White does the work.** Give layouts generous space. Separate areas with whitespace before reaching for a fill.
2. **One voice in green.** Logo green is the only colour used for type and actions, and the fill for inverse panels.
3. **Gold as the flame.** Like the torch in the mark: small and bright. Use it for rules, dots and underlines, under 3% of any screen.

---

## Color

Sampled from the logo · contrast measured on White.

### From the logo

| Name  | Hex       | Token       | Use                        | Contrast           | Swatch sample text |
|-------|-----------|-------------|----------------------------|--------------------|--------------------|
| White | `#FFFFFF` | `--surface` | Page ground, logo mark     | —                  | — |
| Green | `#084021` | `--primary` | Type, actions, brand       | 11.9:1 on White (AAA) | White |
| Gold  | `#E3AB23` | `--accent`  | Rules, dots, marks on green | 5.7:1 on Green     | Green |

### Supporting

| Name  | Hex       | Token         | Use                                  | Contrast | Swatch sample text |
|-------|-----------|---------------|--------------------------------------|----------|--------------------|
| Cream | `#F8F3E6` | `--cream`     | Notices, highlights, warm panels     | —        | Green |
| Mist  | `#EAF0EC` | `--surface-2` | Panels, fields, borders and dividers | —        | Green |

These five are the whole palette. Body text is Green. Tints come only from opacity on these five (e.g. the gold rule at 50%), never from new hex values.

### Proportion per screen

| White | Mist + Cream | Green | Gold |
|-------|--------------|-------|------|
| 70%   | 15%          | 12%   | 3%   |

### Approved pairings

| Pairing              | Rating |
|----------------------|--------|
| Green on White       | AAA    |
| Green on Mist        | AAA    |
| White on Green       | AAA    |
| Green on Cream       | AAA    |
| Gold on Green        | AA     |

---

## Type

**Instrument Serif · Instrument Sans**

- **Instrument Serif** — Display and headlines, 32px and up. Use italic for emphasis, often in gold at large sizes.
- **Instrument Sans** — UI, headings and body text. Weights: 400 for body, 500 for UI, 600 for headings.
- **Instrument Sans** — The `data` style (catalogue numbers, dimensions, dates).

### Scale

| Role        | Example                       | Font / weight     | Size / line-height / tracking | Notes |
|-------------|-------------------------------|-------------------|-------------------------------|-------|
| display-xl  | Green light                   | Serif 400         | 88 / 0.95 / −2%               |       |
| display     | Quiet rooms                   | Serif 400         | 56 / 1.0 / −1.5%              |       |
| h1          | Twelve works on paper         | Serif 400         | 36 / 1.1                      |       |
| h2          | Opening hours and access      | Sans 600          | 22 / 1.3                      |       |
| h3          | Ground floor, east room       | Sans 600          | 17 / 1.4                      |       |
| body        | The works are hung in natural light… | Sans 400   | 16 / 1.6                      | Color `--primary`, max 64ch |
| small       | Open Tuesday to Sunday, 10:00–18:00 | Sans 400    | 13 / 1.5                      |       |
| eyebrow     | SPRING EXHIBITION             | Sans 500, uppercase | 11 · +14% tracking          | Color `--primary` |
| data        | Cat. 014 · 42 × 30 cm · 2026  | Instrument Sans 400      | 12                            |       |

Headings (display through h3) are set in Green (`--primary`).

---

## Space

4px base. Sections are separated by **72–112px**; elements within them by **8–24px**.

Scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 72 · 112`

---

## Line & shape

- **Hairline** — 1px `--surface-2` (Mist). Default divider.
- **Gold rule** — 1px `--accent` at 50% opacity. Below headlines only.
- **Dot rule** — a gold dot followed by a gold rule. Signature mark, once per page.
- **Radius** — `3px` default · `0` for images · pill for tags.
- **No drop shadows.** Show depth with Mist fills and hairlines.

---

## Components

### Actions

All buttons: 44px min height, Instrument Sans 600, 14px.

| Variant   | Example         | Style                                             | Hover / pressed |
|-----------|-----------------|---------------------------------------------------|-----------------|
| Primary   | Plan a visit    | Green fill, white text, radius 3                  | → Gold text     |
| Secondary | Download guide  | White fill, 1px Green border, Green text          | → Mist          |
| Text link | View works →    | Green text, gold underline                        |                 |
| Disabled  | Sold out        | Mist fill, Green text at 50% opacity              |                 |

### Fields

- **Label** — Sans, Green, above the field (e.g. "Email", "Date").
- **Text input** — White fill, 1px Mist border, radius 3, Green placeholder at 50% opacity (`you@example.com`).
- **Select** — Mist fill, no border, Green caret (`Saturday, 14 May ▾`).
- **Checkbox** — Green fill with white check when on (`✓ Send me exhibition news`).

### Tags & status

- **Outline tag** — pill, 1px Green border, Green text (e.g. "Works on paper").
- **Filled tag** — pill, Green fill, white text (e.g. "Current").
- **Soft tag** — pill, Mist fill, Green text (e.g. "Free entry").
- **Notice** — Cream panel, radius 3, with a gold dot before the text (e.g. "The east room is closed on 20 May for rehanging.").

### Cards

- **Image card** — 4:5 image (Mist placeholder, radius 0), then a Instrument Sans catalogue line (`Cat. 014`), a serif title with one italic phrase (*Fern study, morning*), and a Sans small caption ("Graphite and gouache").
- **Info card** — White fill, 1px Mist border, radius 3. Green eyebrow ("VISIT"), serif heading ("Open six days a week"), body text, and a text link ("Plan a visit →").

### Inverse panel

- Green (`--primary`) fill, radius 3.
- Gold eyebrow ("INVERSE PANEL"), white serif headline with a gold italic phrase (*Evening hours, by lamplight.*), followed by a dot rule.
- Body text in white/near-white.
- Buttons: white-filled with Green text ("Book Thursday") and white-outline ("Details").
- **Use at most one per page**, for a footer or a single feature. On Green, logo gold reads at 5.7:1 and can be used for large text and accents.

---

## Usage

### Do

- Set headlines in serif, with one italic phrase.
- Pair a gold rule with the main headline only.
- Use Mist for image placeholders, panels and fields.
- Never set logo gold as text on white or Cream; use Green.

### Don't

- Fill buttons or large areas with gold.
- Set body copy or UI labels in the serif.
- Add colours outside these five, or use pure black.
- Use shadows, gradients or radii above 3px (pills excepted).

---

## CSS tokens

```css
:root {
  /* Color — from the logo */
  --surface:      #FFFFFF;
  --primary:      #084021;
  --accent:       #E3AB23;

  /* Color — supporting */
  --cream:        #F8F3E6;
  --surface-2:    #EAF0EC;

  /* Type */
  --font-display: "Instrument Serif", serif;
  --font-body:    "Instrument Sans", sans-serif;
  --font-mono:    "Instrument Sans", sans-serif;

  /* Space (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 72px;
  --space-9: 112px;

  /* Shape */
  --radius: 3px;
  --radius-pill: 999px;
}
```

Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```
