# TEMPLATE — Website Template

A minimal, black and white website template: plain HTML, CSS, and a little vanilla JS. No build step. Open `index.html` in a browser and it works.

## Structure

```
index.html       Home page
about.html       About page
speakers.html    Speakers page
register.html    Register page (green button, top right of the navbar)
schedule.html    Schedule page
ask.html         Ask A Question page (linked from the Speakers page only)
feedback.html    Feedback page (UNLINKED — see below)
css/styles.css   All styles (design tokens at the top)
js/main.js       Mobile menu, header scroll border, footer year
```

## Customizing

- **Design system:** colors, type, spacing and component rules are documented in `DESIGN.md` (the Verdant scheme). Follow it when adding pages or components.
- **Fonts:** Instrument Serif (display), Instrument Sans (UI and body) and DM Mono (data) load from Google Fonts in each page's `<head>`. To swap them, change that link and the `--font-display` / `--font-body` / `--font-mono` tokens in `css/styles.css`.
- **Colors and spacing:** edit the tokens in `:root` at the top of `css/styles.css`.
- **Navbar and footer:** these are duplicated in each HTML file. Keep them in sync when editing, and move `aria-current="page"` to the current page's nav link on any new page.

## Unlinked pages — don't forget these

- **`feedback.html` is intentionally not linked from anywhere** (not the navbar, footer, or any page). It is only reachable by typing the URL directly, e.g. `https://<your-domain>/feedback.html`. Share that URL directly (QR code, email, slides) when collecting feedback. Search engines may still find it; add `<meta name="robots" content="noindex">` to its `<head>` if it should stay out of search results.
- **`ask.html` is not in the navbar.** It is reached through the "Ask A Question" link on the Speakers page. If that link is removed, the page becomes unlinked too.
- These pages still carry the full navbar so visitors can get back to the rest of the site. When you edit the navbar across pages, edit it in these files too.

## Adding a page

Copy `about.html`, rename it, replace the content inside `<main>`, and add a link to it in the navbar and footer of every page.
