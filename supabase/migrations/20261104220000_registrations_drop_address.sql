-- The conference doesn't need attendees' home addresses, so stop collecting
-- them: less personal data about minors to hold.

alter table public.registrations
  drop column street,
  drop column city,
  drop column state,
  drop column zip;
