# Whole Woman Collective website - instructions for Claude

This is Jacqui McGregor's website. Jacqui owns it and is not a developer. She tells you what she wants in plain words. You make the change, show her, and publish only when she says yes.

## How to work with Jacqui

- Before you start any change, get the latest version: `git pull`.
- Make the change she asked for and nothing else. If her request is unclear, ask one short question.
- Show her what changed in plain words: which page, what it was before, what it is now. Open the page in her browser if you can so she can see it.
- Publish only after she says yes. Commit with a short plain message, then `git push` to `main`. The live site updates one to two minutes later.
- After publishing, load the live page and confirm the change is there. Tell her if it is not.
- Never delete a file without asking her first.
- If she says a change looks wrong: `git revert` the last commit and push, then tell her the site is back to how it was.
- Explain things without technical words. If you must use one, say what it means.

## The site

Plain HTML files. No build step and no framework. Each page is one file with its styles inside it.

| Page | File | Live address |
|---|---|---|
| Home | `index.html` | `/` |
| Calmer Pathways program | `calmerpathways/index.html` | `/calmerpathways/` |
| The Morning Anchor freebie sign-up | `morning-anchor/index.html` | `/morning-anchor/` |
| Brand board (private, not linked) | `brand-board/index.html` | `/brand-board/` |
| Handover notes (private, not linked) | `handover/index.html` | `/handover/` |

Live at https://thewholewomancollective.com.au. Hosted free on GitHub Pages from the `main` branch of `wholewomancollective/jm-wellbeing-website`. Everything in this folder is public on the internet.

## Connections

Jacqui has connected two connectors to her Claude account in the browser (claude.ai, Customise, then Connectors): GitHub and Supabase. Both should show when she types `/mcp`. If one is missing, ask her to type `/login` and sign in with her Claude account, then check again. If it is still missing, she can connect it again at https://claude.ai/customize/connectors.

- GitHub. Her account is `wholewomancollective`. Publish with `git push` from this folder. If git on this laptop is not signed in, walk her through signing in through her browser, one step at a time. The GitHub connector is the fallback if git will not sign in.
- Supabase. Her project ref is `iqmfbhtusygvdxynfzzg`. It is the home for her freebie sign-ups (names, email addresses, phone numbers) and for the data behind her mother-daughter app. Kelly is moving these across in late November 2026, so the tables may not be there yet.
- Treat everything in Supabase as private. Read only, unless Jacqui asks for a change. Never delete or change a table, a row, a function or a secret without her clear yes. Never copy sign-up details into any file in this folder.
- Never ask Jacqui to paste a secret key into this chat. Keys go into the Secrets page of her Supabase dashboard, typed in by her.

## Do not change without asking Jacqui

- `CNAME`. This file connects the website to her web address. Changing or deleting it takes the site offline.
- The Meta Pixel block in the `<head>` of `index.html`, `calmerpathways/index.html` and `morning-anchor/index.html` (pixel ID 2261887714671594). Keep it on those pages, exactly once per page. In `morning-anchor/index.html` keep the line that sends the `Lead` event when a sign-up goes through.
- `FORM_ENDPOINT` in `morning-anchor/index.html`. This is where freebie sign-ups are sent.
- The moving wattle video at the top of the home page. It stays until Jacqui says otherwise.
- Booking buttons. They go to her Zanda page: https://clientportal.zandahealth.com/clientportal/jmwellbeing

## Brand

- Business name: Whole Woman Collective. Jacqui McGregor is the founder. The name is set in text. There is no logo image.
- Tagline: Come home to yourself.
- Fonts: Cormorant Garamond for headings, Work Sans for reading text.
- Colours and texture: read `brand-board/index.html`. It holds three colour sets (A, B and C) with their colour codes, and shows how her own sand and sea photos sit behind colour so nothing looks flat. Use the set Jacqui has chosen. If she has not chosen, ask her.
- Readability: dark text on yellow. Never yellow text on a light background. For orange buttons or small orange text use the deeper orange from the board.
- Feel: calm, nature, earth, room to breathe.

## Photos and videos

- Use Jacqui's own photos and videos only. Never stock images and never AI-generated images.
- Before adding a photo, make a web copy: longest side 1600 pixels at most, JPG, under about 400 KB. Fix the rotation so it is the right way up. Leave her original file untouched.
- Videos: MP4, under about 8 MB, muted, with `playsinline` so they play on phones.
- Name files in plain lowercase with hyphens.
- After adding a photo, check that faces are not cut off at phone width and at desktop width.

## Words

- Jacqui's words are hers. Change wording only where she asks.
- Never invent testimonials, client stories, numbers or results. Use only what she gives you.
- No client names or identifying details without her say-so in writing.

## Keys and passwords

- Never put a secret key, password or token in any file in this folder. Everything here is public.
- The only key allowed in these pages is a Supabase "publishable" key, which is made to be public.
- Secret keys, such as her Resend key, live in the Secrets page of her Supabase project and nowhere else.

## Checking your work

- Look at the changed page at phone width (390) and desktop width (1440) before you show Jacqui.
- When you test the freebie form, do not send a real sign-up unless she asks. A real sign-up is stored and is counted by her ad tracking.

## Help

Kelly Wotherspoon built this site and has helper access until 21 December 2026 (GitHub user `aiwithsoulofficial`). If something is beyond what you and Jacqui can sort out, suggest she messages Kelly.
