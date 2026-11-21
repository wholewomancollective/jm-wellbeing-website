# Set up freebie sign-up storage in Jacqui's own Supabase

Instructions for Claude, working with Jacqui on her laptop. Read the whole file before you start. Read `CLAUDE.md` in the root of this folder first: its rules apply here too.

## What this is

The Morning Anchor freebie page (`morning-anchor/index.html`) has a sign-up form. When someone fills it in, the page sends their first name, email and phone number to a small server function, which saves them in a database table and emails Jacqui.

Right now that function and table sit in Kelly Wotherspoon's Supabase project (Kelly built the site). This job builds the same two things in Jacqui's own Supabase project and then points the form at them. On 22 November 2026 Kelly's copy held zero sign-ups, so there is nothing to move across.

Jacqui's Supabase project ref: `iqmfbhtusygvdxynfzzg`
Jacqui's project address: `https://iqmfbhtusygvdxynfzzg.supabase.co`

## Done means

1. Table `public.jacqui_leads` exists in her project, with row level security on and no policies.
2. Function `jacqui-lead` is deployed in her project, active, with JWT verification off.
3. A test sign-up sent straight to the function came back with `"success": true` and showed up as a row in the table.
4. The live page at https://thewholewomancollective.com.au/morning-anchor/ sends sign-ups to her project, not Kelly's.
5. Jacqui has been told in plain words what was done and where her sign-ups now live.

Do not tell Jacqui it is finished until all five are true. If you get stuck, stop, leave the website as it was, and tell her to message Kelly with what you found.

## How to work with Jacqui here

- She is not technical. Before each numbered step, tell her in one or two plain sentences what you are about to do, then wait for her yes.
- Use the Supabase connector for everything in Supabase. Do not ask her to open the Supabase website unless a step says so.
- Work only in project `iqmfbhtusygvdxynfzzg`. Touch nothing else in it.
- No secret keys in this chat, in any file in this folder, or in anything you publish.

## Steps

### 1. Check you can reach her Supabase

List the Supabase projects the connector can see. Project `iqmfbhtusygvdxynfzzg` must be in the list.

- If there are no Supabase tools at all: she has not connected Supabase yet. Send her to number 2 on her handover page (https://thewholewomancollective.com.au/handover/) and stop.
- If Supabase is connected but this project is not listed: the connector was given a different organisation. Ask her to open https://claude.ai/customize/connectors, disconnect Supabase, connect it again and choose the organisation that holds her project. Then start this step again.

### 2. Create the table

Apply `_backend/freebie-signups/schema.sql` to her project as a migration named `create_jacqui_leads`.

Check: list the tables. `jacqui_leads` is there, row level security is enabled, and it has no policies. Do not add any policy. The table is meant to be closed to the public.

### 3. Deploy the function

Deploy `_backend/freebie-signups/jacqui-lead/index.ts` as an edge function named `jacqui-lead`, with JWT verification turned OFF (`verify_jwt: false`). It has to be off because the form is public and the people signing up are not logged in to anything.

Check: list the edge functions. `jacqui-lead` is active and `verify_jwt` is false.

The function reads the project's own secret key from its built-in environment. You do not need to create, copy or set that key.

### 4. Set the notification address

The function emails Jacqui when someone signs up. It needs two settings, stored as function secrets in her project:

- `JACQUI_NOTIFY_EMAIL`: the address the "new sign-up" email goes to. Ask Jacqui which address she wants. This is not a secret key, so you may set it for her with the connector. If the connector has no tool for function secrets, give her this link and ask her to add it herself: https://supabase.com/dashboard/project/iqmfbhtusygvdxynfzzg/functions/secrets
- `JACQUI_RESEND_KEY`: a key from her own free Resend account. This IS a secret key. Never ask her to paste it into this chat. She adds it herself on that Secrets page, following "Keys and sign-ins" on her handover page. Ask her whether she has done that yet.

Sign-ups are saved whether or not the Resend key is there. Without it she gets no email, and the function answers with `"notified": false`. Tell her that plainly so she is not waiting for an email that will not come.

One thing to know: the function sends from Resend's shared test address, and Resend only delivers those emails to the address that owns the Resend account. So `JACQUI_NOTIFY_EMAIL` must be the same email address she used to sign up to Resend.

### 5. Test the function directly

Send one test sign-up straight to the function. Do not use the website form for this test: the form also tells her Meta ad tracking that a real lead arrived.

PowerShell:

```powershell
$body = @{ firstName = "Test"; email = "PUT-JACQUIS-EMAIL-HERE"; phone = ""; source = "Setup test" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "https://iqmfbhtusygvdxynfzzg.supabase.co/functions/v1/jacqui-lead" -ContentType "application/json" -Body $body
```

Expected answer: `success` is `True`. `notified` is `True` only if the Resend key is set and Resend accepted the email.

Then check the row is there:

```sql
select first_name, email, source, notified, created_at from public.jacqui_leads order by created_at desc limit 5;
```

Also send one bad request (leave the email out). The function should refuse it with a 400 error and save nothing.

If the good test fails: read the function's logs with the connector, fix the cause, and test again. Do not go on to step 7 until this test passes.

If `notified` came back `True`, ask Jacqui to check her inbox (and junk folder) for an email titled "New Morning Anchor sign-up - Test".

### 6. Remove the test row

Show Jacqui the test row and ask for her yes. Then:

```sql
delete from public.jacqui_leads where source = 'Setup test';
```

Delete nothing else.

### 7. Point the website at her project

In `morning-anchor/index.html`, find the one line that starts `const FORM_ENDPOINT =` and change the address inside the quotes to:

```
https://iqmfbhtusygvdxynfzzg.supabase.co/functions/v1/jacqui-lead
```

`CLAUDE.md` says not to change `FORM_ENDPOINT` without asking Jacqui. This is that one change, so ask her. Change nothing else on the page. Keep the Meta Pixel block and the line that sends the `Lead` event exactly as they are.

Show her the before and after. When she says yes, commit and push to `main`.

Check: wait two minutes, then load https://thewholewomancollective.com.au/morning-anchor/ and confirm the page source contains `iqmfbhtusygvdxynfzzg.supabase.co/functions/v1/jacqui-lead` and no longer contains `jiquevvzrdavgqonvvug`.

### 8. One real sign-up (Jacqui's choice)

Offer this, do not insist. Jacqui opens https://thewholewomancollective.com.au/morning-anchor/ on her phone and signs up with her own name and email. She should see the thank-you message. Then show her the new row in the table.

Tell her first that this counts as one lead in her Meta ad tracking. That does no harm before her ads start. Afterwards, ask whether she wants her own test row kept or removed.

### 9. Update the notes and tell her

In `CLAUDE.md`, in the Connections section, change the sentence that says Kelly is moving the sign-ups across so it says the sign-ups have lived in Jacqui's own Supabase since today's date. Commit and push that with her yes.

Then tell Jacqui, in plain words:

- Her freebie sign-ups now save into her own Supabase account, in a table called `jacqui_leads`.
- She can see them any time by asking you "who has signed up for The Morning Anchor?".
- Whether sign-up emails are on yet, and if not, the one thing left to do (add her Resend key).
- Ask her to message Kelly that this part is done, so Kelly can close off her old copy.

## Do not

- Do not add a policy to `jacqui_leads` or make it readable from the public internet.
- Do not put any Supabase secret key in a file, a commit or this chat. The only Supabase key that may ever appear in the website files is a publishable key, and this job does not need one.
- Do not change or delete anything in Kelly's project. You have no access to it and do not need any.
- Do not create extra tables, functions or secrets beyond the ones named here.
