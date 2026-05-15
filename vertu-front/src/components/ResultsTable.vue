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
  import { parseInput, type ParsedResult } from '../utils/parseInput'

  const result = ref<string>('')

  const resultData = computed<ParsedResult | null>(() => {
    if (!result.value) return null
    return parseInput(result.value)
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
