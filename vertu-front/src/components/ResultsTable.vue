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

      return {
        General: {
          'Domain Name': parts.slice(0, -1).join('.') || hostname,
          'Top-Level Domain': parts.slice(-1).join('.') || '',
        },
        Details: {
          Protocol: url.protocol.replace(':', ''),
          Port: url.port || 'default',
          Path: url.pathname || '/',
        },
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
