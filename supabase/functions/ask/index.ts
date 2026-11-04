// Questions for speakers: validates the form from ask.html and saves it to
// public.questions. Organizers read them in the Supabase dashboard.
//
// Secrets (supabase secrets set ...):
//   ALLOWED_ORIGIN   the site's origin, e.g. https://pathwaystohealth.org (defaults to *)

import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Question = {
  name: string;
  email: string;
  speaker: string | null;
  question: string;
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

// Returns the cleaned question, or the message to show the asker
function validate(body: Record<string, unknown>): Question | string {
  const q: Question = {
    name: text(body.name, 120) ?? "",
    email: text(body.email, 254)?.toLowerCase() ?? "",
    speaker: text(body.speaker, 150),
    question: text(body.question, 2000) ?? "",
  };

  if (!q.name || !q.email || !q.question) return "Please fill in all the required fields.";
  if (!EMAIL.test(q.email)) return "Please enter a valid email address.";
  return q;
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

      const question = validate(body);
      if (typeof question === "string") return error(422, question);

      const { error: dbError } = await ctx.supabaseAdmin.from("questions").insert(question);

      if (dbError) {
        console.error("Insert failed:", dbError);
        return error(500, "Something went wrong. Please try again.");
      }

      return Response.json({ ok: true });
    },
  ),
};
