# Trading Niche Webinar

Arabic-first, mobile-ready funnel for a live Northhouse webinar aimed at trading creators and experts in Saudi Arabia.

## Included

- `index.html`: webinar landing page and registration embed slot
- `thanks.html`: registration confirmation destination
- `application.html`: post-webinar application page
- `booking.html`: qualified-prospect call booking handoff
- `payment.html`: offer/payment handoff
- `privacy.html` and `terms.html`: launch drafts with owner/contact placeholders
- `config.js`: one place for the confirmed date, GHL embeds, booking and payment links

A GitHub Actions workflow in `.github/workflows/deploy.yml` publishes the static site on every push to `main`. In the repository settings, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions** to enable the first deployment.

This is a static GitHub Pages site. It does not store submissions itself. The registration and application slots become live after the approved GoHighLevel form embed URLs are added to `config.js`.

## Before launch

1. Confirm the final webinar date, time, timezone, presenter, offer, eligibility and agenda with the team.
2. Add the GHL registration and application form embed URLs to `config.js`. Confirm the forms write to the correct CRM pipeline and send the approved consent/reminder sequence.
3. Set the registration form's success redirect to the published `thanks.html` URL.
4. Add the post-webinar application link in follow-up messages; the thank-you page also links to `application.html` for attendees.
5. Set the application form's success redirect in GoHighLevel to the published `booking.html` URL. The embedded form cannot be redirected by this static site on its own.
6. Add the approved booking URL in `config.js`; the booking page links onward to the local `payment.html` page only for prospects who have reviewed the offer with the team. Add the approved payment URL only after offer terms are finalized.
7. Replace the privacy and terms placeholders with the responsible entity's approved details and contact address.
8. Add approved brand assets, presenter information, and any final video/poster assets.
9. Configure ad pixels/analytics only after the team provides the correct IDs and consent requirements.
10. Review the full flow on mobile and desktop, submit a real test lead, verify CRM attribution/reminders, and test booking/payment in their respective sandbox or test modes.

No fake countdown, scarcity, testimonials, outcomes, or investment-return claims are used. The webinar is presented as an introduction to the partnership model, not financial or investment advice.
