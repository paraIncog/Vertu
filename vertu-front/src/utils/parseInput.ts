export type DetailValue = string | undefined | { text: string; warning?: boolean; status?: 'yes' | 'no' }

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

    const domainChecks: ParsedResult['DomainChecks'] = isWebProtocol
      ? {
          'Contains only letters': !hasAnyNonLetter
            ? { text: 'Yes', status: 'yes' }
            : { text: 'No', status: 'no' },
          'Is Famous Domain': isFamousDomain(host)
            ? { text: 'Yes', status: 'yes' }
            : { text: 'No', status: 'no' },
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
