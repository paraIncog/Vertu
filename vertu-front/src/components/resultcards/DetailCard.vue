<template>
  <v-card
    elevation="3"
    variant="tonal"
  >
    <v-card-title>{{ title }}</v-card-title>
    <v-card-subtitle>{{ subtitle }}</v-card-subtitle>

    <v-card-text>
      <div v-for="(value, label) in data" :key="label" class="result-row" :label="label">
        <span class="result-label">{{ label }}:</span>
        <span class="result-value">{{ value }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  defineProps<{
    title: string
    subtitle?: string
    data: Record<string, string | undefined>
  }>()
</script>

<style scoped>

.result-row {
  display: flex;
  justify-content: space-between;
  padding: .75rem 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}

.result-row:last-child {
  border-bottom: none;
}

.result-label {
  font-weight: 600;
}

.result-value {
  text-align: right;
}
</style>
