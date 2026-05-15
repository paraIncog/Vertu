export type DetailValue = string | undefined | { text: string; warning?: boolean; redWarning?: boolean; status?: 'yes' | 'no' }

export type ParsedResult = {
  General: Record<string, string>
  Web?: Record<string, DetailValue>
  DomainChecks?: Record<string, DetailValue>
}

function extractQueryParts(searchParams: URLSearchParams): string[] {
  return Array.from(searchParams.entries()).map(([key, value]) => {
    return value ? `${key}=${value}` : key
  })
}

function extractFragmentParts(rawHash: string): string[] {
  const trimmed = rawHash.slice(1)
  return trimmed ? trimmed.split('#').filter(Boolean) : []
}

function hasNonLetter(value: string): boolean {
  return /[^A-Za-z]/.test(value)
}

function hasHomoglyphs(domain: string): boolean {
  // Check if domain contains both Latin and Cyrillic characters
  const hasLatin = /[A-Za-z]/.test(domain)
  const hasCyrillic = /[а-яА-ЯёЁ]/.test(domain)
  const hasGreek = /[α-ωΑ-Ω]/.test(domain)

  // If mixed scripts detected, it's likely a homoglyph attack
  const mixedScripts = [hasLatin, hasCyrillic, hasGreek].filter(Boolean).length > 1

  if (mixedScripts) {
    return true
  }

  // Check for character combinations that look like other characters
  const homoglyphCombos = [
    /rn/, // looks like 'm'
    /ii/, // looks like 'u'
    /vv/, // looks like 'w'
    /1l|l1/, // 1 and l look similar
    /0O|O0/, // 0 and O look similar
    /5S|S5/, // 5 and S look similar
    /Cl|lC/, // Cl looks like C1
    /8B|B8/, // 8 and B look similar
  ]

  for (const combo of homoglyphCombos) {
    if (combo.test(domain.toLowerCase())) {
      return true
    }
  }

  return false
}

function normalizeDomain(domain: string): string {
  // Normalize homoglyph combinations to their intended characters
  let normalized = domain.toLowerCase()
  normalized = normalized.replace(/rn/g, 'm')
  normalized = normalized.replace(/ii/g, 'u')
  normalized = normalized.replace(/vv/g, 'w')
  normalized = normalized.replace(/[1l]+/g, '1') // Normalize 1 and l combinations
  normalized = normalized.replace(/[0O]+/g, '0') // Normalize 0 and O combinations
  normalized = normalized.replace(/[5S]+/g, '5') // Normalize 5 and S combinations
  normalized = normalized.replace(/[Cc]l|[Ll][Cc]/g, 'c') // Normalize Cl/lC combinations
  normalized = normalized.replace(/[8B]+/g, '8') // Normalize 8 and B combinations
  return normalized
}


const FAMOUS_DOMAINS = new Set([
  'google',
  'microsoft',
  'amazon',
  'apple',
  'meta',
  'facebook',
  'twitter',
  'x',
  'linkedin',
  'instagram',
  'youtube',
  'github',
  'gitlab',
  'stackoverflow',
  'reddit',
  'wikipedia',
  'github',
  'gitlab',
  'slack',
  'discord',
  'netflix',
  'spotify',
  'adobe',
  'ibm',
  'oracle',
  'salesforce',
  'zoom',
  'dropbox',
  'notion',
  'figma',
  'stripe',
  'paypal',
  'twitch',
  'pinterest',
  'snapchat',
  'whatsapp',
  'telegram',
])

function isFamousDomain(domain: string): boolean {
  return FAMOUS_DOMAINS.has(domain.toLowerCase())
}

export function parseInput(input: string): ParsedResult {
  try {
    let url: URL

    try {
      url = new URL(input)
    } catch {
      url = new URL('https://' + input)
    }

    const hostname = url.hostname
    const parts = hostname.split('.')
    const queryParts = extractQueryParts(url.searchParams)
    const fragmentParts = extractFragmentParts(url.hash)

    const isWebProtocol = ['http:', 'https:'].includes(url.protocol)
    const subdomain = parts.length > 2 ? parts.slice(0, -2).join('.') : ''
    const host = parts.length > 1 ? parts.at(-2)! : hostname
    const topLevelDomain = parts.slice(-1).join('.') || ''

    const subdomainWarning = subdomain !== '' && hasNonLetter(subdomain)
    const hostWarning = hasNonLetter(host)
    const topLevelDomainWarning = topLevelDomain !== '' && hasNonLetter(topLevelDomain)
    const hasAnyNonLetter = subdomainWarning || hostWarning || topLevelDomainWarning

    const general: Record<string, string> = {
      Schema: url.protocol.replace(':', ''),
      Authority: hostname,
      Path: url.pathname || '/',
      Port: url.port || 'default',
    }

    if (queryParts.length > 0) {
      general[queryParts.length > 1 ? 'Queries' : 'Query'] = queryParts.join(', ')
    }

    if (fragmentParts.length > 0) {
      general[fragmentParts.length > 1 ? 'Fragments' : 'Fragment'] = fragmentParts.join(', ')
    }

    const web: ParsedResult['Web'] = isWebProtocol
      ? {
          Encrypted: url.protocol === 'https:' ? 'Yes' : 'No',
          Subdomain: {
            text: subdomain,
            warning: subdomainWarning,
          },
          Hostname: {
            text: host,
            warning: hostWarning,
          },
          'Top-Level Domain': {
            text: topLevelDomain,
            warning: topLevelDomainWarning,
          },
        }
      : undefined

    const domainHasHomoglyphs = hasHomoglyphs(host)
    const isFamous = isFamousDomain(host)
    const normalizedHost = normalizeDomain(host)
    const isFamousWhenNormalized = isFamousDomain(normalizedHost)

    // Homoglyph logic:
    // - If has homoglyphs and is famous (or famous when normalized): show red exclamation (redWarning: true)
    // - If has homoglyphs but NOT famous: show yellow warning icon (warning: true)
    // - If no homoglyphs: show green checkmark (status: 'yes')
    let homoglyphCheck: DetailValue
    if (!domainHasHomoglyphs) {
      homoglyphCheck = { text: 'Yes', status: 'yes' }
    } else if (isFamous || isFamousWhenNormalized) {
      homoglyphCheck = { text: 'No', redWarning: true }
    } else {
      homoglyphCheck = { text: 'No', warning: true }
    }

    const domainChecks: ParsedResult['DomainChecks'] = isWebProtocol
      ? {
          'Contains only letters': !hasAnyNonLetter
            ? { text: 'Yes', status: 'yes' }
            : { text: 'No', status: 'no' },
          'Is Famous Domain': (isFamous || isFamousWhenNormalized)
            ? { text: 'Yes', status: 'yes' }
            : { text: 'No', status: 'no' },
          'Has no homoglyphs': homoglyphCheck,
        }
      : undefined

    return {
      General: general,
      Web: web,
      DomainChecks: domainChecks,
    }
  } catch {
    return {
      General: {
        Input: input,
      },
    }
  }
}
