# GoHighLevel handoff

The seven pages use Graphite Gold only. Color/page review controls are removed; Arabic/English switching and the registration/application placeholders remain. Configure the approved services before launch. These exports have not been installed or tested inside the Northouse GHL account.

## GHL Funnels or Websites

Use the files in `builder/` in the Northouse sub-account:

1. Create blank pages with the routes below.
2. Add a full-width section and one-column row with zero padding and margins.
3. Paste the matching `builder/*.html` body fragment into a Code element.
4. Paste `builder/shared.css` into the page Custom CSS area, without style tags.
5. Paste `builder/head.html` into the head tracking/custom code area.
6. Paste `builder/footer.html` into the footer/body tracking code area. It contains configuration first, followed by the shared script, and handles GHL's `hydrationDone` event.
7. Set page titles and descriptions in GHL's SEO settings. Test both languages and every route in the published preview.

| File | Page path |
| --- | --- |
| `index.html` | `/webinar` |
| `thanks.html` | `/thank-you` |
| `application.html` | `/application` |
| `booking.html` | `/booking` |
| `payment.html` | `/payment` |
| `privacy.html` | `/privacy` |
| `terms.html` | `/terms` |

The body fragment is code-based, not a collection of native drag-and-drop elements. Do not paste a full standalone HTML document into a Code element. Set the registration form's successful submission redirect to the final `/thank-you` URL and the application redirect to `/booking` in GHL.

## WordPress HTML uploads

If the team already uses GHL WordPress Hosting, the top-level HTML files in this directory include inline styles and scripts. Use Sites → WordPress → Manage Website → Pages → Upload New HTML Page. Upload each file separately and use the same paths. Update by uploading a new version; GitHub pushes do not automatically update GHL.

## Configuration and forms

Edit `window.WEBINAR_CONFIG` in `builder/footer.html` for the builder route, or in each standalone page for WordPress uploads:

- `eventDateLabel`, `eventStartISO`, `timeZone`: approved event details.
- `vslVideoUrl`: approved HTTPS YouTube URL; blank keeps the video placeholder.
- `registrationEmbedUrl`, `applicationEmbedUrl`: published GHL form URLs from the generated iframe `src`, not a login/dashboard link or the entire embed code.
- `registrationEmbedHeight`, `applicationEmbedHeight`: optional iframe height from 300 to 3000 pixels; 0 uses the responsive defaults. Check the longest mobile form for clipping.
- `bookingUrl`, `paymentUrl`: approved HTTPS calendar and checkout destinations.
- `aiAssistantUrl`: real HTTPS chat destination. Blank hides the assistant. This is a link launcher, not an AI backend or a native GHL chat-widget installation.
- `privacyEmail`: approved privacy contact.

The form placeholders are intentionally inactive; this code does not collect or store submissions. Jawad and Mehyeddin should create and publish the actual forms, field mappings, consent, redirects, pipelines, and workflows inside Northouse. Add hidden GHL fields for `utm_source`, `utm_campaign`, `utm_content`, and `utm_term` and map them to the forwarded query parameters. Verify a test submission reaches the intended contact and workflow.

Images use absolute GitHub Pages asset URLs. Keep the GitHub Pages site enabled until these URLs are replaced with final GHL Media Library or CDN URLs.

## Regenerate after changes

Run `python tools/build_ghl_export.py` from the repository. Update source files first, regenerate exports, then paste or upload the refreshed versions into GHL. The export is reproducible and does not require private credentials.
