// @ts-check
import { defineConfig } from 'astro/config';

// While the site lives at https://<user>.github.io/portfolio, BASE_PATH is "/portfolio"
// (set in .github/workflows/deploy.yml). Once you point your own domain at it,
// change BASE_PATH there to "/" and SITE_URL to https://www.danielacastrodesign.com
const base = process.env.BASE_PATH || '/';

// Lets case studies write ![alt](images/foo.png) and still work under any base path.
function prefixImages() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'image' && node.url && !/^(https?:|\/|data:)/.test(node.url)) {
        node.url = `${base.replace(/\/$/, '')}/${node.url}`;
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

export default defineConfig({
  site: process.env.SITE_URL || 'https://danielacastroram.github.io',
  base,
  trailingSlash: 'ignore',
  markdown: { remarkPlugins: [prefixImages] },
});
