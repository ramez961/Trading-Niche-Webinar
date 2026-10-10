# Northouse Trading Webinar Website

This website introduces Northouse’s partnership model to trading content creators, industry experts, and community leaders in Saudi Arabia. Its goal is to explain the opportunity clearly and help interested visitors take the next step with the Northouse team.

The webinar is an introductory conversation about a potential partnership. It is not investment advice, trading signals, or a promise of income or returns.

## What visitors can do

- Learn what the webinar covers and who it is for.
- Watch the introductory video when its link is added.
- Register their interest once the registration form is connected.
- Read the privacy policy and terms.
- Switch between Arabic and English.
- Browse the available page designs and color palettes using the review controls.

The floating Northouse AI assistant button is currently a setup placeholder. It can open a chat link after an approved assistant service is configured.

## Pages and visitor journey

The site has seven pages:

- `index.html` — webinar overview, video, registration area, and FAQs.
- `thanks.html` — confirmation after registration.
- `application.html` — application step for interested attendees.
- `booking.html` — handoff to book a conversation with the team.
- `payment.html` — payment handoff, when offer details are finalized.
- `privacy.html` and `terms.html` — privacy information and terms.

The intended flow is: learn about the webinar → register interest → receive follow-up → apply after the webinar → book a conversation → review the offer and payment details with the team.

## Current setup

This is a static website published with GitHub Pages. It does not collect or store submissions by itself. The video, forms, booking, payment, event date, and privacy contact are not configured yet. The site becomes ready to accept registrations after the team adds and verifies the approved service links.

Settings for those links and event details are in `config.js`. Do not add private keys or secrets to this file.

## Before launch

1. Confirm the date, time, presenter, webinar content, eligibility, and partnership terms.
2. Add the approved YouTube video URL in `vslVideoUrl`.
3. Add the GoHighLevel registration and application form embed URLs, and confirm their CRM and consent settings.
4. Set the registration form’s success redirect to the published `thanks.html` page.
5. Configure application follow-up and redirect successful applicants to `booking.html`.
6. Add the approved booking and payment URLs only after the team finalizes the offer.
7. Replace privacy and terms placeholders with approved company details and contact information.
8. Test the full visitor journey on desktop and mobile, including a test submission and the CRM follow-up.

The site avoids fabricated countdowns, scarcity, testimonials, outcomes, and investment-return claims.

## Publishing

A GitHub Actions workflow in `.github/workflows/deploy.yml` publishes the site when changes are pushed to `main`. GitHub Pages must be configured to use **GitHub Actions** as its build and deployment source.
