import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// The Morning Anchor freebie sign-up catcher - version for JACQUI'S OWN Supabase project.
// Same behaviour as the copy that ran in Kelly's project, with one change:
// the two settings are read from this project's function secrets, not from a config table.
//   JACQUI_NOTIFY_EMAIL - where the "new sign-up" email goes
//   JACQUI_RESEND_KEY   - API key from Jacqui's own free resend.com account
// If the Resend key is missing the sign-up is still saved; "notified" stays false.

const SB_SECRET: string = (() => { try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default; } catch { return undefined; } })()
  ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const data = await req.json();
    const firstName = (data.firstName ?? "").toString().trim();
    const email = (data.email ?? "").toString().trim().toLowerCase();
    const phone = (data.phone ?? "").toString().trim();
    if (!firstName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "firstName and a valid email are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const source = (data.source ?? "The Morning Anchor - lead magnet").toString();

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, SB_SECRET);

    // 1. store the sign-up (always first - nothing below may lose it)
    const { data: inserted, error: dbError } = await supabase
      .from("jacqui_leads")
      .insert({ first_name: firstName, email, phone: phone || null, source })
      .select("id").single();
    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    // 2. email Jacqui through her own Resend account - best effort
    let notified = false;
    try {
      const resendKey = Deno.env.get("JACQUI_RESEND_KEY");
      const notifyEmail = Deno.env.get("JACQUI_NOTIFY_EMAIL");

      if (resendKey && notifyEmail) {
        const when = new Date().toLocaleString("en-AU", { timeZone: "Australia/Brisbane" });
        const html = `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#F7F3ED;color:#2D2418;margin:0;padding:0;">
<div style="max-width:560px;margin:0 auto;padding:32px;">
  <h2 style="margin:0 0 4px;font-size:22px;color:#2D4A3E;">Someone just downloaded The Morning Anchor</h2>
  <p style="margin:0 0 24px;color:#6B8F71;font-size:13px;">${esc(when)} (Brisbane time)</p>
  <table style="width:100%;border-collapse:collapse;background:white;border-radius:6px;overflow:hidden;">
    <tr><td style="padding:12px 16px;border-bottom:1px solid #D4C5A9;font-weight:bold;width:32%;">Name</td><td style="padding:12px 16px;border-bottom:1px solid #D4C5A9;">${esc(firstName)}</td></tr>
    <tr><td style="padding:12px 16px;border-bottom:1px solid #D4C5A9;font-weight:bold;">Email</td><td style="padding:12px 16px;border-bottom:1px solid #D4C5A9;"><a href="mailto:${esc(email)}" style="color:#2D4A3E;">${esc(email)}</a></td></tr>
    <tr><td style="padding:12px 16px;font-weight:bold;">Phone</td><td style="padding:12px 16px;">${esc(phone || "not provided")}</td></tr>
  </table>
  <p style="margin-top:24px;font-size:14px;line-height:1.6;">She has the PDF already. A short personal hello from you within a day or two lands beautifully - even one line.</p>
  <p style="margin-top:20px;font-size:12px;color:#6B8F71;">Whole Woman Collective - freebie sign-ups. Source: ${esc(source)}</p>
</div></body></html>`;

        const send = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Whole Woman Collective <onboarding@resend.dev>",
            to: [notifyEmail],
            subject: `New Morning Anchor sign-up - ${firstName}`,
            html,
          }),
        });
        const sendJson = await send.json();
        console.log("Resend response:", JSON.stringify(sendJson).slice(0, 400));
        notified = send.ok;
        if (notified) await supabase.from("jacqui_leads").update({ notified: true }).eq("id", inserted.id);
      } else {
        console.log("JACQUI_RESEND_KEY or JACQUI_NOTIFY_EMAIL not set - sign-up saved, no email sent");
      }
    } catch (notifyErr) {
      console.error("Notify failed (sign-up still saved):", notifyErr);
    }

    return new Response(JSON.stringify({ success: true, notified }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("jacqui-lead error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
