// Conference registration: validates the form from register.html, saves it to
// public.registrations, and emails a confirmation through Resend.
//
// Secrets (supabase secrets set ...):
//   RESEND_API_KEY   Resend API key with sending access
//   RESEND_FROM      e.g. "Pathways to Health <register@yourdomain.org>" (a verified Resend domain)
//   ALLOWED_ORIGIN   the site's origin, e.g. https://pathwaystohealth.org (defaults to *)

import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const GRADES: Record<string, string> = {
  "9": "9th grade",
  "10": "10th grade",
  "11": "11th grade",
  "12": "12th grade",
  college: "College",
  other: "Other",
};

const INTERESTS = [
  "Medicine",
  "Nursing",
  "Public Health",
  "Research",
  "Pharmacy",
  "Dentistry",
  "Not sure yet",
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP = /^\d{5}(-\d{4})?$/;

type Registration = {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  school: string;
  grade: string;
  interests: string[];
  is_minor: boolean;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  dietary: string | null;
  accessibility: string | null;
};

function error(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

// Trimmed string, or null when missing, blank, or longer than max
function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= max ? trimmed : null;
}

// Returns the cleaned registration, or the message to show the attendee
function validate(body: Record<string, unknown>): Registration | string {
  const is_minor = body.is_minor === true;
  const r: Registration = {
    name: text(body.name, 120) ?? "",
    email: text(body.email, 254)?.toLowerCase() ?? "",
    phone: text(body.phone, 30) ?? "",
    street: text(body.street, 200) ?? "",
    city: text(body.city, 100) ?? "",
    state: text(body.state, 50) ?? "",
    zip: text(body.zip, 10) ?? "",
    school: text(body.school, 150) ?? "",
    grade: text(body.grade, 10) ?? "",
    interests: Array.isArray(body.interests)
      ? INTERESTS.filter((i) => (body.interests as unknown[]).includes(i))
      : [],
    is_minor,
    parent_name: is_minor ? text(body.parent_name, 120) : null,
    parent_email: is_minor ? text(body.parent_email, 254)?.toLowerCase() ?? null : null,
    parent_phone: is_minor ? text(body.parent_phone, 30) : null,
    dietary: text(body.dietary, 1000),
    accessibility: text(body.accessibility, 1000),
  };

  const required = ["name", "email", "phone", "street", "city", "state", "zip", "school"] as const;
  if (required.some((key) => !r[key])) return "Please fill in all the required fields.";
  if (!EMAIL.test(r.email)) return "Please enter a valid email address.";
  if (!ZIP.test(r.zip)) return "Please enter a valid ZIP code.";
  if (!(r.grade in GRADES)) return "Please choose your grade.";
  if (is_minor && (!r.parent_name || !r.parent_phone || !r.parent_email)) {
    return "Please add a parent or guardian's name, email, and phone.";
  }
  if (is_minor && !EMAIL.test(r.parent_email!)) {
    return "Please enter a valid parent or guardian email.";
  }
  return r;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function confirmationEmail(r: Registration) {
  const first = r.name.split(/\s+/)[0];
  const rows: [string, string][] = [
    ["Name", r.name],
    ["School", `${r.school}, ${GRADES[r.grade]}`],
    ["Interests", r.interests.join(", ") || "None selected"],
  ];
  if (r.dietary) rows.push(["Dietary needs", r.dietary]);
  if (r.accessibility) rows.push(["Accessibility needs", r.accessibility]);

  const text = [
    `Hi ${first},`,
    "",
    "You're registered for Pathways to Health on February 1, 2027 at Pensacola High School.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "If anything here is wrong, just reply to this email.",
    "",
    "Pathways to Health",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background:#ffffff;color:#084021;font-family:"Instrument Sans",sans-serif;font-size:16px;line-height:1.5">
  <div style="max-width:560px;margin:0 auto">
    <h1 style="margin:0 0 16px;font-family:"Instrument Serif",serif;font-weight:400;font-size:32px;line-height:1.1">You're registered.</h1>
    <p style="margin:0 0 16px">Hi ${escapeHtml(first)},</p>
    <p style="margin:0 0 24px">See you at <strong>Pathways to Health</strong> on <strong>February 1, 2027</strong> at Pensacola High School.</p>
    <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 24px">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:8px 16px 8px 0;border-top:1px solid #EAF0EC;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:8px 0;border-top:1px solid #EAF0EC">${escapeHtml(value)}</td></tr>`,
        )
        .join("\n      ")}
    </table>
    <p style="margin:0 0 24px">If anything here is wrong, just reply to this email.</p>
    <p style="margin:0;font-size:13px">Pathways to Health</p>
  </div>
</body>
</html>`;

  return { subject: "You're registered for Pathways to Health", html, text };
}

// Returns whether Resend accepted the email
async function sendConfirmation(id: string, r: Registration): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM");
  if (!apiKey || !from) {
    console.error("RESEND_API_KEY or RESEND_FROM is not set; skipping confirmation email");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `registration-confirmation/${id}`,
      },
      body: JSON.stringify({
        from,
        to: [r.email],
        cc: r.parent_email && r.parent_email !== r.email ? [r.parent_email] : undefined,
        ...confirmationEmail(r),
      }),
    });

    if (!res.ok) {
      console.error(`Resend failed for registration ${id}: ${res.status} ${await res.text()}`);
    }
    return res.ok;
  } catch (err) {
    console.error(`Resend unreachable for registration ${id}:`, err);
    return false;
  }
}

export default {
  fetch: withSupabase(
    {
      // The publishable key is public; it only proves the call came through the site
      auth: "publishable",
      cors: {
        headers: {
          "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
          "Access-Control-Allow-Headers": "apikey, content-type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      },
    },
    async (req, ctx) => {
      if (req.method !== "POST") return error(405, "Method not allowed.");

      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") return error(400, "Something went wrong. Please try again.");

      // Honeypot filled in: a bot. Look successful so it doesn't retry.
      if (typeof body.company === "string" && body.company.trim()) {
        return Response.json({ ok: true });
      }

      const registration = validate(body);
      if (typeof registration === "string") return error(422, registration);

      const { data, error: dbError } = await ctx.supabaseAdmin
        .from("registrations")
        .insert(registration)
        .select("id")
        .single();

      if (dbError) {
        if (dbError.code === "23505") {
          return error(409, "This email is already registered.");
        }
        console.error("Insert failed:", dbError);
        return error(500, "Something went wrong. Please try again.");
      }

      // The registration is saved either way; a failed email is logged, and the
      // page only mentions an email when one went out
      const emailed = await sendConfirmation(data.id, registration);

      return Response.json({ ok: true, emailed });
    },
  ),
};
