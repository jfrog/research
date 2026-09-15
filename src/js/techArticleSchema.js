const ORGANIZATION_ID = 'https://jfrog.com/#organization'
const DEFAULT_BASE_URL = 'https://research.jfrog.com'
const AUTHOR_JOB_TITLE = 'JFrog Security Researcher'

function toIsoDate(value) {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function absoluteUrl(baseUrl, path) {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path
  const origin = String(baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${origin}${suffix}`
}

function withTrailingSlash(url) {
  if (!url) return undefined
  return url.endsWith('/') ? url : `${url}/`
}

function toPerson(name) {
  return {
    '@type': 'Person',
    name,
    jobTitle: AUTHOR_JOB_TITLE,
    affiliation: {
      '@id': ORGANIZATION_ID,
    },
  }
}

function parseAuthorNames(byline) {
  if (!byline) return ['JFrog Security Research']

  const trimmed = String(byline).trim().replace(/\.$/, '')
  const researcherMatch = trimmed.match(/^(.*?)(?:,\s*)?JFrog Security Researchers?$/i)

  let namesPart
  if (researcherMatch) {
    namesPart = researcherMatch[1].trim()
    if (namesPart.includes('.')) {
      namesPart = namesPart.split('.').pop().trim()
    }
  } else if (/^JFrog Security Research/i.test(trimmed)) {
    return [trimmed]
  } else {
    namesPart = trimmed
  }

  const names = namesPart
    .split(/\s+and\s+|,\s*/)
    .map((name) => name.trim())
    .filter(Boolean)
    .filter((name) => !/^JFrog Security/i.test(name))

  return names.length ? names : ['JFrog Security Research']
}

function buildAuthors(byline) {
  const authors = parseAuthorNames(byline).map(toPerson)
  return authors.length === 1 ? authors[0] : authors
}

function parseExtraSchema(schema) {
  if (!schema) return null
  try {
    const parsed = typeof schema === 'string' ? JSON.parse(schema) : schema
    const type = parsed && parsed['@type']
    if (type === 'TechArticle' || type === 'Article' || type === 'NewsArticle') {
      return null
    }
    return parsed
  } catch (err) {
    return null
  }
}

function buildTechArticleSchema(post, baseUrl) {
  if (!post) return null

  const pageUrl = withTrailingSlash(
    post.canonical || absoluteUrl(baseUrl, post.path)
  )
  const image = absoluteUrl(baseUrl, post.img)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    description: post.excerpt,
    datePublished: toIsoDate(post.date),
    author: buildAuthors(post.description),
    publisher: {
      '@id': ORGANIZATION_ID,
    },
    mainEntityOfPage: pageUrl,
    proficiencyLevel: 'Expert',
  }

  if (image) {
    schema.image = image
  }

  return schema
}

module.exports = {
  ORGANIZATION_ID,
  buildTechArticleSchema,
  parseExtraSchema,
  parseAuthorNames,
  toIsoDate,
}
