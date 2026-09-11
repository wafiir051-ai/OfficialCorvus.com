export function renderSimpleMarkdown(raw: string): string {
  const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const blocks = raw.trim().split(/\n\s*\n/);

  const html = blocks.map((block) => {
    const trimmed = block.trim();

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = inline(escapeHtml(headingMatch[2]));
      const tag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
      return `<${tag}>${text}</${tag}>`;
    }

    const withBreaks = escapeHtml(trimmed).replace(/\n/g, "<br />");
    return `<p>${inline(withBreaks)}</p>`;
  }).join("\n");

  return html;

  function inline(text: string): string {
    return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
  }
}
