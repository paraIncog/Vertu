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
        <span class="result-value">
          <template v-if="isValueObject(value)">
            <span>{{ value.text || '—' }}</span>
            <span v-if="value.redWarning" class="warning-icon warning-red">!</span>
            <span v-else-if="value.warning" class="warning-icon">!</span>
            <span v-else-if="value.status === 'yes'" class="status-icon status-yes">✓</span>
            <span v-else-if="value.status === 'no'" class="status-icon status-no">✕</span>
          </template>
          <template v-else>
            {{ value || '—' }}
          </template>
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  type DetailValue = string | undefined | { text: string; warning?: boolean; redWarning?: boolean; status?: 'yes' | 'no' }

  defineProps<{
    title: string
    subtitle?: string
    data: Record<string, DetailValue>
  }>()

  function isValueObject(value: DetailValue): value is { text: string; warning?: boolean; redWarning?: boolean; status?: 'yes' | 'no' } {
    return typeof value === 'object' && value !== null && 'text' in value
  }
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
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.warning-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  min-width: 1.25rem;
  border-radius: 999px;
  background-color: #fdd835;
  color: #000;
  font-weight: 700;
  font-size: 0.9rem;
  line-height: 1;
}

.warning-icon.warning-red {
  background-color: #e53935;
  color: #fff;
}

.status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  min-width: 1.25rem;
  border-radius: 999px;
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  line-height: 1;
}

.status-yes {
  background-color: #43a047;
}

.status-no {
  background-color: #e53935;
}
</style>
