import { Marked } from 'marked';

// Custom extension for marked to support Obsidian [[WikiLinks]] and [[WikiLinks|Aliases]]
const wikiLinkExtension = {
  name: 'wikiLink',
  level: 'inline',
  start(src) {
    return src.indexOf('[[');
  },
  tokenizer(src, tokens) {
    const rule = /^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/;
    const match = rule.exec(src);
    if (match) {
      const target = match[1].trim();
      const alias = match[2] ? match[2].trim() : target;
      return {
        type: 'wikiLink',
        raw: match[0],
        target,
        alias
      };
    }
  },
  renderer(token) {
    // Render a button style matching the reference typography that can be intercepted via event delegation
    return `<button data-wiki-target="${token.target}" class="wiki-link text-blue-600 dark:text-blue-400 hover:underline bg-transparent border-none p-0 cursor-pointer font-bold font-sans inline-flex items-center gap-0.5">${token.alias}</button>`;
  }
};

const markedInstance = new Marked();
markedInstance.use({
  extensions: [wikiLinkExtension],
  gfm: true, // Enable GitHub Flavored Markdown (tables, autolinks, strikethrough)
  breaks: true // Translate \n to <br>
});

/**
 * Parses markdown text to HTML with support for standard markdown features
 * and Obsidian [[WikiLink]] references.
 * 
 * @param {string} markdownText 
 * @returns {Promise<string>} parsed HTML content
 */
export async function renderMarkdown(markdownText) {
  if (!markdownText) return '';
  try {
    // marked.parse returns a string directly or a promise in case of async features (we await to be safe)
    return await markedInstance.parse(markdownText);
  } catch (err) {
    console.error('Failed to parse markdown:', err);
    return `<div class="text-xs text-red-500 font-mono">Parsing error: ${err.message}</div>`;
  }
}
