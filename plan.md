# Registration: plan to go live

Status as of November 4, 2026. The site has no domain yet, so Resend can only send from its test address (`onboarding@resend.dev`), and only to the email on the Resend account itself. Any reputable email provider has the same rule: a verified domain is what keeps confirmation emails out of spam.

## Done

- `register.html` form, the Register buttons in the navbar and home hero, and the form JS
- Supabase project linked; `registrations` table created with `supabase db push`
- Database checks passed: the public API can't read or write the table, the data rules are enforced (ZIP, grade, parent required for minors, one registration per email), and no test rows were left behind

## 1. Go live without emails

Registrations save to Supabase now; emails are added later.

- [ ] Change the `register` function to report whether a confirmation email was sent (for example `{ ok: true, emailed: false }`)
- [ ] Change the success panel on `register.html` to say "We've sent a confirmation to …" only when an email went out, and just "You're registered" otherwise
- [ ] Deploy the function: `supabase functions deploy register`
- [ ] Fill in the form's attributes in `register.html`:
  - `data-endpoint="https://qsozyqnofuchttyigqhp.supabase.co/functions/v1/register"`
  - `data-key="sb_publishable_..."` (Project Settings → API Keys → `default` publishable key)
- [ ] Run the full test: a valid registration, a duplicate email, a bad submission, and the bot trap. Afterwards, delete only the test rows.

The function already skips the email when `RESEND_API_KEY` or `RESEND_FROM` isn't set and logs it instead, so nothing breaks without them.

## 2. Test the email pipeline now (optional)

- [ ] Add `RESEND_API_KEY` yourself in the Supabase dashboard → Edge Functions → Secrets. Don't paste it into chat.
- [ ] Set `RESEND_FROM="Pathways to Health <onboarding@resend.dev>"`
- [ ] Register with the email on your Resend account and check that the confirmation arrives

Until a domain is verified, emails to anyone else are refused by Resend. Those registrations still save, and the failure shows in the function's logs.

## 3. Add a domain later

- [ ] Buy a domain (a `.org` costs about $10 a year; Cloudflare Registrar sells at cost, and keeping DNS on Cloudflare makes the next step easy)
- [ ] Add and verify it in Resend at [resend.com/domains](https://resend.com/domains) (SPF/DKIM records)
- [ ] Change `RESEND_FROM` to an address on the domain, for example `Pathways to Health <register@yourdomain.org>`
- [ ] Set `ALLOWED_ORIGIN` to the site's address (see step 4)

No code changes are needed for this step.

## 4. Hosting and ALLOWED_ORIGIN

- [ ] Until the site has a real address, leave `ALLOWED_ORIGIN` unset (open to any site, `*`)
- [ ] Optional: put up a free Cloudflare Pages test site (`*.pages.dev`) and set `ALLOWED_ORIGIN` to that address
- [ ] When the domain is live, change `ALLOWED_ORIGIN` to the domain

## Later, if needed

- If spam registrations show up, add Cloudflare Turnstile (a free bot check). Right now the hidden bot field and the one-registration-per-email rule are the only protection.
