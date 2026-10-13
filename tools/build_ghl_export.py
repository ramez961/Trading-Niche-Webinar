"""Generate GHL standalone HTML pages and Funnel/Website builder fragments."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'ghl-export'
BUILDER = OUT / 'builder'
ROUTES = {'index.html':'/webinar', 'thanks.html':'/thank-you', 'application.html':'/application',
          'booking.html':'/booking', 'payment.html':'/payment', 'privacy.html':'/privacy', 'terms.html':'/terms'}
ASSET_BASE = 'https://ramez961.github.io/Trading-Niche-Webinar/'

def build():
    BUILDER.mkdir(parents=True, exist_ok=True)
    css = (ROOT/'styles.css').read_text(encoding='utf-8')
    config = (ROOT/'config.js').read_text(encoding='utf-8')
    script = (ROOT/'script.js').read_text(encoding='utf-8')
    (BUILDER/'shared.css').write_text(css,encoding='utf-8')
    for name, route in ROUTES.items():
        page = (ROOT/name).read_text(encoding='utf-8')
        page = re.sub(r'(src|href)="(assets/[^\"]+)"', lambda m: f'{m[1]}="{ASSET_BASE}{m[2]}"', page)
        for file, path in ROUTES.items():
            page = page.replace(f'href="{file}"', f'href="{path}"')
            page = page.replace(f'href="{file}#', f'href="{path}#')
        page = re.sub(r'<link rel="stylesheet" href="styles\.css[^\"]*">', lambda _: '<style>\n'+css+'\n</style>', page)
        page = re.sub(r'<script src="config\.js[^\"]*" defer></script>', '', page)
        page = re.sub(r'<script src="script\.js[^\"]*" defer></script>', '', page)
        footer = '<script>\n'+config+'\n</script>\n<script>\n'+script+'\n</script>\n'
        page = page.replace('</body>', footer+'</body>')
        (OUT/name).write_text(page,encoding='utf-8')
        original = (ROOT/name).read_text(encoding='utf-8')
        head = re.search(r'<head>(.*?)</head>', original, re.S)[1]
        font_links = '\n'.join(re.findall(r'<link[^>]+(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>', head))
        font_links = font_links.replace(' media="print" onload="this.media=\'all\'"', '')
        font_links = '\n'.join(dict.fromkeys(font_links.splitlines()))
        (BUILDER/'head.html').write_text(font_links+'\n',encoding='utf-8')
        body = re.search(r'<body[^>]*>(.*?)</body>', page, re.S)[1]
        body = re.sub(r'<script>.*?</script>', '', body, flags=re.S).strip()
        (BUILDER/name).write_text(body+'\n',encoding='utf-8')
    # Initialize after GHL hydration, or after DOM load for a regular preview.
    init = '''(() => {
  const initialize = () => {
    const main = document.querySelector('#main-content');
    if (!main || main.dataset.webinarInitialized === 'true') return;
    main.dataset.webinarInitialized = 'true';
    document.body.classList.toggle('subpage', main.classList.contains('subpage-main'));
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    SCRIPT
  };
  document.addEventListener('hydrationDone', initialize);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once:true});
  else initialize();
})();'''.replace('SCRIPT', script)
    (BUILDER/'footer.html').write_text('<script>\n'+config+'\n</script>\n<script>\n'+init+'\n</script>\n',encoding='utf-8')
    # Single snippets for a GHL Custom Code element: fonts, CSS, body, and scripts.
    ready = OUT / 'ready-to-paste'
    ready.mkdir(parents=True, exist_ok=True)
    for name in ROUTES:
        snippet = ((BUILDER/'head.html').read_text(encoding='utf-8')
                   + '<style>\n'+css+'\n</style>\n'
                   + (BUILDER/name).read_text(encoding='utf-8')+'\n'
                   + (BUILDER/'footer.html').read_text(encoding='utf-8'))
        (ready/name).write_text(snippet, encoding='utf-8')
    print('Generated seven standalone pages, builder fragments, and ready-to-paste snippets.')

if __name__ == '__main__':
    build()
