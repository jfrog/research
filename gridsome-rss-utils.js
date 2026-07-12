function sanitizeForRss(text) {
  if (!text) return text;
  return String(text)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/\]\]>/g, "]]]]><![CDATA[>");
}

function parseFeedDate(value) {
  if (!value) return new Date(0);
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? new Date(0) : date;
}

function absoluteUrl(siteUrl, path) {
  return new URL(path, siteUrl).href;
}

module.exports = {
  sanitizeForRss,
  parseFeedDate,
  absoluteUrl,
};
