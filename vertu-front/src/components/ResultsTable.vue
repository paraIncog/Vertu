<template>
  <v-card class="results-table" elevation="0">

    <div v-if="resultData" class="result-card-container">
      <DetailCard
        :data="resultData.General"
        subtitle="Taking apart the input"
        title="General"
      />

      <DetailCard
        v-if="resultData.Web"
        :data="resultData.Web"
        subtitle="Schema identified as http/https, analyzing domain parts"
        title="Web Domain"
      />

      <DetailCard
        v-if="resultData.DomainChecks"
        :data="resultData.DomainChecks"
        subtitle="Checks on domain composition"
        title="Looking out for"
      />
    </div>
  </v-card>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import DetailCard from './resultcards/DetailCard.vue'

  const result = ref<string>('')

  const resultData = computed(() => {
    if (!result.value) return null

    try {
      let url: URL
      try {
        url = new URL(result.value)
      } catch {
        // If not a valid URL, treat as a domain
        url = new URL('https://' + result.value)
      }

      const hostname = url.hostname
      const parts = hostname.split('.')

      const rawSearch = url.searchParams
      const queryParts = Array.from(rawSearch.entries()).map(([key, value]) => {
        return value ? `${key}=${value}` : key
      })

      const rawHash = url.hash.slice(1)
      const fragmentParts = rawHash
        ? rawHash.split('#').filter(Boolean)
        : []

      const details: Record<string, string | { text: string; status?: 'yes' | 'no' }> = {
        Port: url.port || 'default',
      }

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

      const isWebProtocol = ['http:', 'https:'].includes(url.protocol)
      const subdomain = parts.length > 2 ? parts.slice(0, -2).join('.') : ''
      const host = parts.length > 1 ? parts.at(-2)! : hostname
      const topLevelDomain = parts.slice(-1).join('.') || ''
      const hasNonLetter = (value: string) => /[^A-Za-z]/.test(value)
      const subdomainWarning = subdomain !== '' && hasNonLetter(subdomain)
      const hostWarning = hasNonLetter(host)
      const topLevelDomainWarning = topLevelDomain !== '' && hasNonLetter(topLevelDomain)
      const hasAnyNonLetter = subdomainWarning || hostWarning || topLevelDomainWarning

      const web = isWebProtocol
        ? {
          'Encrypted': url.protocol === 'https:' ? 'Yes' : 'No',
          'Subdomain': {
            text: subdomain,
            warning: subdomainWarning,
          },
          'Hostname': {
            text: host,
            warning: hostWarning,
          },
          'Top-Level Domain': {
            text: topLevelDomain,
            warning: topLevelDomainWarning,
          },
        }
        : undefined

      const domainChecks: Record<string, string | { text: string; status?: 'yes' | 'no' }> | undefined = isWebProtocol
        ? {
          'Contains only letters': !hasAnyNonLetter ? { text: 'Yes', status: 'yes' } : { text: 'No', status: 'no' },
        }
        : undefined

      return {
        General: general,
        Web: web,
        DomainChecks: domainChecks,
      }
    } catch {
      // Fallback: Show the raw input
      return {
        General: {
          Input: result.value,
        },
      }
    }
  })

  function addResult (newResult: string) {
    result.value = newResult
  }

  defineExpose({
    addResult,
  })
</script>

<style scoped>
.results-table {
  background-color: transparent;
  padding: 8px;
}

.result-card-container {
  display: flex;
  gap: 16px;
  width: 100%;
}

.result-card-container > * {
  flex: 1;
}
</style>
