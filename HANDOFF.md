# Masterful Listening Site — Handoff

## Created: 2026-06-11
## Last Updated: 2026-06-11

A one-page podcast site for masterfullistening.com. Plain HTML, no build step. Episodes load automatically from Buzzsprout, so publishing a new episode there updates the site with zero work.

## What is on the page

Hero with cover art and platform links (Apple, Spotify, Amazon, YouTube, RSS), embedded Buzzsprout player (auto-updates), free Listening PDF email capture (wired to Kit), e-book teaser, VIP waitlist email capture (wired to Kit), story/guest submission form, about section linking to svetlanasaitsky.com, footer with socials.

## To deploy (one time, ~10 minutes)

1. Create a new GitHub repo (e.g. `ssaitsky/masterfullistening`), push this folder to it.
2. In Vercel: Add New Project, import the repo, deploy. No settings to change.
3. In Vercel project Settings > Domains: add `masterfullistening.com` AND `masterfullisteningpodcast.com`. Set masterfullistening.com as primary; Vercel will auto-redirect the other. Vercel shows you the DNS records to set at your registrar (where you bought the domains).
4. Done. Future edits: commit + push, live in about a minute.

## Things that need Svet

1. **Kit forms.** Both email forms currently fall back to the default Kit form (9452127). Create a "Listening PDF" form and a "VIP Waitlist" form in Kit, then update the IDs at the top of `api/subscribe.js`. The PDF delivery email also needs to be set up in Kit.
2. **Story form activation.** The submission form uses formsubmit.co (free). The FIRST submission triggers a confirmation email to svetlana.thisisit@gmail.com. Click confirm once and it works forever after.
3. **VIP tier.** The site collects a waitlist now. When ready to launch paid bonus content, activate Buzzsprout Subscriptions (Buzzsprout dashboard, you keep 85%), then swap the waitlist form for a link to your subscription page.
4. **Update the link everywhere.** Once live, put masterfullistening.com in your Buzzsprout show notes, Apple/Spotify show description, Instagram bio, and email signature. Those listener-facing links are the real win.

## SEO notes

Title, description, social preview image, and PodcastSeries schema markup are all in place. Honest reality: linking this site and svetlanasaitsky.com to each other helps visitors navigate but does not count as independent backlinks for Google. The SEO value here is ranking for "Masterful Listening podcast" searches and converting listeners to email subscribers.
