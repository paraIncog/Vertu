<template>
  <v-card
    elevation="3"
    variant="tonal"
  >
    <v-card-title>{{ title }}</v-card-title>
    <v-card-subtitle>{{ subtitle }}</v-card-subtitle>

    <v-card-text>
      <div v-for="(value, label) in data" :key="label" class="result-row" :label="label">
        <span class="result-label" :title="getTooltip(label)">{{ label }}:</span>

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
  type DetailValue = string | undefined | { text: string, warning?: boolean, redWarning?: boolean, status?: 'yes' | 'no' }

  defineProps<{
    title: string
    subtitle?: string
    data: Record<string, DetailValue>
  }>()

  function isValueObject (value: DetailValue): value is { text: string, warning?: boolean, redWarning?: boolean, status?: 'yes' | 'no' } {
    return typeof value === 'object' && value !== null && 'text' in value
  }

  function getTooltip (label: string): string {
    const tooltips: Record<string, string> = {
      'Schema': 'The protocol used by the URL, which affects security and transport behavior.',
      'Authority': 'The full host and optional port for the request, showing where the site is hosted.',
      'Path': 'The server path after the hostname, which indicates the specific page or resource.',
      'Port': 'The network port used by the URL; default ports are standard, custom ports may be unusual.',
      'Query': 'The URL query string carries parameters that can change behavior or identify tracked requests.',
      'Queries': 'Multiple query parameters are included, often used for filtering, search terms, or tracking.',
      'Fragment': 'The fragment points to a section of the page, usually used for internal navigation.',
      'Fragments': 'Multiple fragment identifiers are used for intra-page navigation or section targeting.',
      'Encrypted': 'Shows whether the connection is using HTTPS encryption, important for privacy and integrity.',
      'Subdomain': 'The optional subdomain can indicate a separate service or may be used for deceptive URL patterns.',
      'Hostname': 'The main domain name, which is the key identifier for the website owner and authenticity check.',
      'Top-Level Domain': 'The domain suffix such as .com or .org; some TLDs are more trustworthy than others.',
      'Contains only letters': 'Detects whether the domain uses only alphabetic characters, which can reveal odd or deceptive characters.',
      'Is Famous Domain': 'Indicates whether the hostname matches a well-known brand, which is useful for spotting copycat attacks.',
      'Has no homoglyphs': 'Checks for visually misleading characters or combinations that can mimic legitimate domains.',
    }

    return tooltips[label] || 'Additional detail about this field.'
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
