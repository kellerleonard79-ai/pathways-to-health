# Registration: plan to go live

Status as of November 4, 2026. The site has no domain yet, so Resend can only send from its test address (`onboarding@resend.dev`), and only to the email on the Resend account itself. Any reputable email provider has the same rule: a verified domain is what keeps confirmation emails out of spam.

## Done

- `register.html` form, the Register buttons in the navbar and home hero, and the form JS
- Supabase project linked; `registrations` table created with `supabase db push`
- Database checks passed: the public API can't read or write the table, the data rules are enforced (grade, parent required for minors, one registration per email), and no test rows were left behind

## 1. Go live without emails

Registrations save to Supabase now; emails are added later.

- [x] Change the `register` function to report whether a confirmation email was sent (for example `{ ok: true, emailed: false }`)
- [x] Change the success panel on `register.html` to say "We've sent a confirmation to …" only when an email went out, and just "You're registered" otherwise
- [x] Deploy the function: `supabase functions deploy register`
- [x] Fill in the form's attributes in `register.html`:
  - `data-endpoint="https://qsozyqnofuchttyigqhp.supabase.co/functions/v1/register"`
  - `data-key="sb_publishable_..."` (Project Settings → API Keys → `default` publishable key)
- [x] Run the full test: a valid registration, a duplicate email, a bad submission, and the bot trap. Afterwards, delete only the test rows.

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
- [ ] Make `og:image` a full URL on every page (see J)

No code changes are needed for this step.

## 4. Hosting and ALLOWED_ORIGIN

- [x] Until the site has a real address, leave `ALLOWED_ORIGIN` unset (open to any site, `*`). It's unset now
- [ ] Optional: put up a free Cloudflare Pages test site (`*.pages.dev`) and set `ALLOWED_ORIGIN` to that address
- [ ] When the domain is live, change `ALLOWED_ORIGIN` to the domain

## Later, if needed

- If spam registrations show up, add Cloudflare Turnstile (a free bot check). Right now the hidden bot field and the one-registration-per-email rule are the only protection.

---

# Site review: fixes and additions

From a full review of the site on November 4, 2026. Work through these in any order; tick them off as they're done. Items marked **(content)** need information only you have: names, dates, decisions.

## Before launch

### A. Registration only pretends to submit

The form's `data-endpoint` is empty (`register.html:17`), so it shows "You're registered" without saving anything. Don't share the site publicly until this is fixed.

- [x] Finish "1. Go live without emails" above

### B. Don't promise emails that aren't sent

Until a domain is verified in Resend, most attendees won't get a confirmation email.

- [x] Success panel (`register.html:180`): covered in step 1 above
- [x] Duplicate-email error (`supabase/functions/register/index.ts`): now just "This email is already registered." Add the contact email to it once D is done.
- [x] Redeploy the function: `supabase functions deploy register`

### C. Ask A Question page is empty

- [x] Built the form on `ask.html` (name, email, optional speaker or topic, question). It posts to the `ask` Edge Function, which saves to the `questions` table (RLS on, no public access, honeypot field). Read questions in the Supabase dashboard: Table Editor → `questions`
- [x] Question deadline set to January 18, 2027 on `ask.html` and `speakers.html`
- [x] The form closes itself: from January 19 (`data-closes` on the form) it shows a "Questions are closed" notice. To extend the deadline, change `data-closes` and the dates in the text on `ask.html`, `speakers.html` and the FAQ in `about.html`

### D. No contact information

The site and confirmation email now use a placeholder address, `contact@example.com`, marked with a `PLACEHOLDER` comment everywhere it appears.

- [x] Added it to the footer on every page (as a `mailto:` link)
- [x] Added it to the confirmation email (replacing "just reply to this email"), as the email's `reply_to`, and to the "already registered" message
- [ ] **(content)** Pick a contact email. A free Gmail account works for now and can be switched to the domain later.
- [ ] Replace the placeholder everywhere. Find every spot with `grep -rn "contact@example.com" *.html supabase/functions`: the footer of all seven pages, the last FAQ answer in `about.html`, and `CONTACT_EMAIL` at the top of `supabase/functions/register/index.ts`
- [ ] Redeploy the function: `supabase functions deploy register`

### E. Placeholder speakers

- [x] Replaced the six placeholder cards with a "confirming our speakers" notice in the page header. The Speakers page now has a proper page header (`h1`, dot rule, date and place)
- [ ] **(content)** Gather each speaker's name, title, employer, bio, tag (Keynote / Panel / Breakout) and field
- [ ] Add photos as `images/speakers/<name>.webp` (4:5, about 800×1000)
- [ ] When speakers are confirmed: un-comment the speakers grid in `speakers.html` (the commented-out section after the page header), make one `<li>` per speaker, and remove the notice

### F. Confirm the date

- [x] The date is **Saturday, February 6, 2027**. Updated everywhere: the home hero, countdown, "What we do" section and "Save your seat" section, the register page, the Schedule page header and description, and the confirmation email (redeployed)

## Worth adding

### G. Practical details (FAQ)

- [x] Added a "Questions, answered" section to `about.html`: who can attend (high school and college students), when and where (with the school's address and a map link), parking (free on campus), dress code (business casual), registering, parents (welcome), questions for speakers, and the contact email
- [ ] **(content)** Still undecided, so left out of the FAQ: whether it's free, and whether lunch is included (the schedule says "Catered lunch"). Add them to the list in `about.html` once decided
- [ ] **(content)** Optional: what to bring, and which entrance to use

### H. Who's behind it

Parents handing over a minor's details will want to know who's running the event.

- [ ] **(content)** List the student organizers (names, roles) and a faculty advisor or sponsoring teacher
- [ ] Add a "The team" section to `about.html`, after the FAQ, using the same `split` layout
- [ ] Optional: a sponsors or partners section, if there are any

### I. Privacy note on registration

- [x] Removed the home address (street, city, state, ZIP) from the form, the function and the table (migration `20261104220000_registrations_drop_address.sql`)
- [x] Added a privacy note above the Register button. It doesn't promise a deletion date
- [ ] Optional: if you later decide when registrations get deleted, add that to the note and put a reminder on your calendar

### J. Link previews for social sharing

- [x] Made the share image, `images/og.png` (1200×630: logo, name, tagline, date and school)
- [x] Added Open Graph and Twitter card tags to every page, with each page's own title and description
- [ ] When the site has an address, change `og:image` on every page to the full URL, `https://<your-domain>/images/og.png` (marked `PLACEHOLDER`). Most sites won't show the image until then
- [ ] If the date or venue changes, remake `images/og.png`

### K. Fuller footer

- [x] The footer links every page, and has the contact email from D

## Small things

- [x] `speakers.html` has no `<h1>` (done with E)
- [x] `about.html`: real meta description
- [x] `feedback.html`: added `noindex` and a feedback form (rating, role, what was useful, what to change, optional email). It saves to a `feedback` table through the `feedback` Edge Function, and is read in Table Editor → `feedback`
- [x] `ask.html`: add a real meta description (done with C)
- [x] `ask.html`: the form now closes itself on January 19 and shows a "Questions are closed" notice (see C)
- [x] `schedule.html`: the venue is now "Pensacola High School", like the other pages
- [x] Unused files (`logo.PNG`, `pexels-werner-pfennig-6949979.jpg`, `images/hero-speaker.webp`, `Color and type pairings exploration.pdf`) are no longer tracked by git and are listed in `.gitignore`. They're still on your disk. `DESIGN.md` still refers to the PDF and `logo.PNG` as sources, so keep a copy somewhere safe
- [x] `README.md`: title and intro now describe Pathways to Health
