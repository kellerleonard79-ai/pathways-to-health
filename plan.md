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

---

# Site review: fixes and additions

From a full review of the site on November 4, 2026. Work through these in any order; tick them off as they're done. Items marked **(content)** need information only you have: names, dates, decisions.

## Before launch

### A. Registration only pretends to submit

The form's `data-endpoint` is empty (`register.html:17`), so it shows "You're registered" without saving anything. Don't share the site publicly until this is fixed.

- [ ] Finish "1. Go live without emails" above

### B. Don't promise emails that aren't sent

Until a domain is verified in Resend, most attendees won't get a confirmation email.

- [ ] Success panel (`register.html:180`): covered in step 1 above
- [ ] Duplicate-email error (`supabase/functions/register/index.ts:215`): drop "Check your inbox for the confirmation", or only say it once emails are going out. For example: "This email is already registered. If you need to change anything, contact us at …"
- [ ] Redeploy the function: `supabase functions deploy register`

### C. Ask A Question page is empty

`speakers.html` links to `ask.html`, which only has a heading. Pick one:

- [ ] **Build it:** a short form (name, email, optional speaker or topic, question) that posts to a new Edge Function and a `questions` table, set up like `registrations` (RLS on, no public access, honeypot field)
- [ ] **Or hide it for now:** remove the "Have a question for a speaker?" section from `speakers.html` until the form exists

Either way:

- [ ] **(content)** Choose a question deadline before the conference, for example January 25, 2027, so questions can reach speakers in time. Update `speakers.html:135`.

### D. No contact information

No email address appears anywhere on the site, and "just reply to this email" in the confirmation won't work from `onboarding@resend.dev`.

- [ ] **(content)** Pick a contact email. A free Gmail account works for now and can be switched to the domain later.
- [ ] Add it to the footer on every page (as a `mailto:` link)
- [ ] Add it to the confirmation email in `supabase/functions/register/index.ts`, replacing "just reply to this email" (both the text and HTML versions), then redeploy
- [ ] When the domain is live, set a `reply_to` on the Resend email so replies reach that address

### E. Placeholder speakers

All six cards on `speakers.html` say "Speaker Name", "Position / Title".

- [ ] **(content)** Fill in each speaker's name, title, employer, bio, tag (Keynote / Panel / Breakout) and field
- [ ] Add photos as `images/speakers/<name>.webp` (4:5, about 800×1000) using the `<img>` snippet in the comment at the top of the list
- [ ] Until speakers are confirmed, replace the grid with a notice (Cream panel with a gold dot, see `DESIGN.md` → Notice), e.g. "Speakers will be announced in December."

### F. Confirm the date

February 1, 2027 is a **Monday**, a school day.

- [ ] **(content)** Confirm the date is right
- [ ] If it changes, update every place it appears:
  - `index.html:91` (hero) and `index.html:97` (`data-countdown`)
  - `register.html:7` (meta description), `register.html:47` (header), `register.html:180` (success panel)
  - `speakers.html:135` (question deadline)
  - `supabase/functions/register/index.ts:119` and `:134` (confirmation email), then redeploy
- [ ] Once the date is settled, also use the full date on `index.html:115` and `schedule.html:7` and `:47`, which say only "February 2027"

## Worth adding

### G. Practical details (FAQ)

- [ ] **(content)** Answer these:
  - Is it free?
  - Who can attend? High school only, or college students too (the form allows "College")? Is it only for Pensacola High School, or other schools as well?
  - What time does it end?
  - Street address, which entrance to use, and where to park
  - What to bring, and is there a dress code?
  - Is lunch included? (The schedule says "Catered lunch.")
  - Can parents attend?
- [ ] Add a "Questions" section to `about.html` using the info card or `split` layout, one short Q&A per item

### H. Who's behind it

Parents handing over a minor's details will want to know who's running the event.

- [ ] **(content)** List the student organizers (names, roles) and a faculty advisor or sponsoring teacher
- [ ] Add a "The team" section to `about.html`
- [ ] Optional: a sponsors or partners section, if there are any

### I. Privacy note on registration

The form collects minors' home addresses and phone numbers.

- [ ] **(content)** Decide whether you need the street address. If not, remove `street`, `city`, `state` and `zip` from `register.html`, `validate()` in the function, and the table (with a new migration)
- [ ] Add a short note above the Register button in `register.html`, for example: "We use your details only to organize the conference and contact you about it. We don't share them. Registrations are deleted after the event."
- [ ] **(content)** Decide when registrations get deleted, and put a reminder on your calendar for that date

### J. Link previews for social sharing

No page has Open Graph tags, so links shared by text or on social media show up bare.

- [ ] Make a 1200×630 share image (logo + "Pathways to Health" + date) and save it as `images/og.png`
- [ ] Add to the `<head>` of every page, with that page's title and description:
  ```html
  <meta property="og:title" content="Pathways to Health">
  <meta property="og:description" content="…">
  <meta property="og:image" content="https://<your-domain>/images/og.png">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  ```
  `og:image` needs a full URL, so fill it in once the site has an address

### K. Fuller footer

The footer only links Home and About.

- [ ] Add Speakers, Schedule and Register to `.footer__links` on every page (including `ask.html` and `feedback.html`)
- [ ] Add the contact email from D

## Small things

- [ ] `speakers.html` has no `<h1>`. Add a page header like the Schedule page's (`eyebrow`, `h1.display` "Speakers", dot rule) above the grid
- [ ] `about.html:7`: replace the placeholder meta description, e.g. "Pathways to Health is a student-run pre-health conference at Pensacola High School, connecting students with doctors, nurses, researchers, and public health professionals."
- [ ] `feedback.html`: add `<meta name="robots" content="noindex">` to the `<head>`, and add content (a form, or a link to a Google Form) before sharing the URL
- [ ] `ask.html`: add a real meta description once the page has content
- [ ] `schedule.html:47`: use the same venue name as the other pages ("Pensacola High School"), or call it "Pensacola High School Auditorium" everywhere
- [ ] Unused files are in the repo and would be published: `logo.PNG` (1.5 MB), `pexels-werner-pfennig-6949979.jpg` (2.1 MB), `images/hero-speaker.webp`, `Color and type pairings exploration.pdf`. Move them to a folder outside the site, or `git rm --cached` them and add them to `.gitignore`
- [ ] `README.md`: change the title from "TEMPLATE — Website Template" to "Pathways to Health"
