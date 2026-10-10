# GoHighLevel handoff

This folder contains seven standalone Northouse webinar pages. Each HTML file already includes the page markup, shared CSS, language/theme behavior, UTM capture, and shared JavaScript. Images and the favicon use public absolute URLs, so there are no relative asset folders to copy.

## Recommended install: GHL Custom HTML Pages

These full-document files are intended for **Sites → WordPress → Manage Website → Pages → Upload New HTML Page** in a HighLevel account with WordPress Hosting enabled. Upload one HTML file per page, then set the page URL paths to match the route list below. HighLevel currently documents a 5 MB maximum per uploaded page; every file here is well below that limit.

| File | Set this URL path |
| --- | --- |
| `index.html` | `/` (or make it the website home page) |
| `thanks.html` | `/thank-you` |
| `application.html` | `/application` |
| `booking.html` | `/booking` |
| `payment.html` | `/payment` |
| `privacy.html` | `/privacy` |
| `terms.html` | `/terms` |

Use the exact route paths above so all the navigation and calls to action stay connected. If your GHL account does not include WordPress Hosting, these full HTML documents do not belong inside a normal Custom HTML element; use GHL's page builder and place the page body, shared CSS, and JavaScript in its corresponding code areas, or enable a hosting option that accepts HTML pages.

## Required before launch

The layout works without configuration, but live services need the team's real URLs and event information. In **each HTML file**, search near the bottom for `window.WEBINAR_CONFIG = {` and fill in the same values:

- `eventDateLabel`: approved date/time displayed on the page.
- `eventStartISO`: start time in ISO 8601 format, including the correct offset, if the countdown should run.
- `vslVideoUrl`: approved YouTube URL.
- `registrationEmbedUrl`: published GHL registration form URL.
- `applicationEmbedUrl`: published GHL application form URL.
- `bookingUrl`: published GHL calendar/booking URL.
- `paymentUrl`: approved checkout/payment URL.
- `aiAssistantUrl`: the actual assistant/chat URL, if one is set up. The page currently shows the assistant interface but cannot answer messages by itself.
- `privacyEmail`: contact email for the privacy page.

The registration form must be created and published in GHL. Add hidden fields named exactly `utm_source`, `utm_campaign`, `utm_content`, and `utm_term` to that form and map them to the corresponding query parameters. The page preserves these values and appends them to the form URL. A hidden HTML field by itself does not save a lead; the form needs to contain and store each field in GHL.

The booking calendar and payment provider must also be created in GHL (or an approved provider) and their URLs added above. The original video cover and Northouse mark are served from this public repository's GitHub Pages asset URLs; keep the repository's Pages site enabled or replace those two absolute URLs with the final production asset URLs.

## Builder distinction

HighLevel supports uploaded standalone HTML pages on its WordPress hosting product. A regular GHL Funnel/Website builder page is assembled with GHL's visual editor and code elements; pasting an entire `<!doctype html>` document into one code element is not the same installation method. The export is designed for the documented upload route and includes full files for the team to inspect or adapt.

## Included behavior

- Arabic and English page content and direction toggle.
- Responsive page layout and palette selector.
- UTM query capture and forwarding to the registration form URL.
- YouTube VSL player setup when a video URL is supplied.
- Form, booking, and payment destinations when their published URLs are supplied.
- Shared internal navigation using the route paths above.

No GHL account was connected for this preparation, so these files have not been uploaded or validated in a live sub-account. The forms, calendar, checkout, video, privacy contact, and AI assistant remain the only account-specific values to provide.
