// Feedback after the conference: validates the form from feedback.html and
// saves it to public.feedback. Organizers read it in the Supabase dashboard.
//
// Secrets (supabase secrets set ...):
//   ALLOWED_ORIGIN   the site's origin, e.g. https://pathwaystohealth.org (defaults to *)

import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const ROLES = ["student", "parent", "speaker", "teacher", "other"];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Feedback = {
  rating: number;
  role: string | null;
  most_useful: string | null;
  change: string | null;
  email: string | null;
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

// Returns the cleaned feedback, or the message to show the person
function validate(body: Record<string, unknown>): Feedback | string {
  const role = text(body.role, 20);
  const f: Feedback = {
    rating: Number(body.rating),
    role: role && ROLES.includes(role) ? role : null,
    most_useful: text(body.most_useful, 2000),
    change: text(body.change, 2000),
    email: text(body.email, 254)?.toLowerCase() ?? null,
  };

  if (!Number.isInteger(f.rating) || f.rating < 1 || f.rating > 5) return "Please rate the day.";
  if (f.email && !EMAIL.test(f.email)) return "Please enter a valid email address, or leave it blank.";
  return f;
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

      const feedback = validate(body);
      if (typeof feedback === "string") return error(422, feedback);

      const { error: dbError } = await ctx.supabaseAdmin.from("feedback").insert(feedback);

      if (dbError) {
        console.error("Insert failed:", dbError);
        return error(500, "Something went wrong. Please try again.");
      }

      return Response.json({ ok: true });
    },
  ),
};
