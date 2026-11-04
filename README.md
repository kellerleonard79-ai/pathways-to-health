# TEMPLATE — Website Template

A minimal, black and white website template: plain HTML, CSS, and a little vanilla JS. No build step. Open `index.html` in a browser and it works.

## Structure

```
index.html       Home page
about.html       About page
speakers.html    Speakers page
register.html    Registration form (green "Register" button in the navbar and home hero)
schedule.html    Schedule page
ask.html         Ask A Question page (linked from the Speakers page only)
feedback.html    Feedback page (UNLINKED — see below)
css/styles.css   All styles (design tokens at the top)
js/main.js       Mobile menu, header scroll border, registration form, hero paths, countdown, footer year
supabase/        Registration backend: database migration and the "register" Edge Function
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

## Registration backend

The form on `register.html` posts to a Supabase Edge Function (`supabase/functions/register`). The function checks the data, saves it to the `registrations` table, and sends a confirmation email through Resend, copying the parent or guardian if one was given. The browser never sees the database or the Resend key. The table has row level security turned on and no public access, so registrations can only be read in the Supabase dashboard (Table Editor → `registrations`) or with the secret key.

One-time setup (Supabase CLI v2; CLI v3 will ask you to confirm each command that changes the hosted project):

1. **Supabase:** create a project at [supabase.com](https://supabase.com), then from this folder:
   ```sh
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase db push                      # creates the registrations table
   ```
2. **Resend:** add and verify your sending domain at [resend.com/domains](https://resend.com/domains) (SPF/DKIM records at your DNS host), then create an API key with sending access. Until the domain is verified, Resend only delivers to your own account's email address.
3. **Secrets and deploy:**
   ```sh
   supabase secrets set RESEND_API_KEY=re_... \
     RESEND_FROM="Pathways to Health <register@yourdomain.org>" \
     ALLOWED_ORIGIN=https://yourdomain.org
   supabase functions deploy register
   ```
   `verify_jwt = false` for this function is already set in `supabase/config.toml`. The function checks the publishable key itself.
4. **Connect the form:** in `register.html`, set the `<form class="register">` attributes:
   - `data-endpoint="https://<your-project-ref>.supabase.co/functions/v1/register"`
   - `data-key="sb_publishable_..."` (Project Settings → API Keys → publishable key; it's meant to be public)

To test without spamming real inboxes, register with `delivered@resend.dev`. To see sent mail and any failures, check [resend.com/emails](https://resend.com/emails) and the function's logs in the Supabase dashboard (Edge Functions → register → Logs).

Each email address can register once. A second attempt gets "This email is already registered."

