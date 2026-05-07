<template>
  <v-card class="results-table" elevation="0">

    <div v-if="resultData" class="result-card-container">
      <DetailCard
        :data="resultData.General"
        subtitle="Taking apart the input"
        title="General"
      />

      <DetailCard
        :data="resultData.Details"
        subtitle="Additional details"
        title="Details"
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

      const details: Record<string, string> = {
        Protocol: url.protocol.replace(':', ''),
        Port: url.port || 'default',
        Path: url.pathname || '/',
      }

      if (queryParts.length > 0) {
        details[queryParts.length > 1 ? 'Queries' : 'Query'] = queryParts.join(', ')
      }

      if (fragmentParts.length > 0) {
        details[fragmentParts.length > 1 ? 'Fragments' : 'Fragment'] = fragmentParts.join(', ')
      }

      return {
        General: {
          'Domain Name': parts.slice(0, -1).join('.') || hostname,
          'Top-Level Domain': parts.slice(-1).join('.') || '',
        },
        Details: details,
      }
    } catch {
      // Fallback: Show the raw input
      return {
        General: {
          Input: result.value,
        },
        Details: {},
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
