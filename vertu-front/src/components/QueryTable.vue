<template>
  <v-card class="query-table" elevation="0">
    <v-card-text>
      <v-text-field
        v-model="query"
        hide-details
        label="Enter query here"
        variant="outlined"
      />

      <div class="d-flex justify-center pt-5">
        <v-btn color="primary" @click="submitQuery">
          Submit
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'

  const query = ref('')

  const emit = defineEmits<{
    (e: 'submit', value: string): void
  }>()

  function submitQuery () {
    emit('submit', query.value)
  }
</script>

<style scoped>
.query-table {
  background-color: transparent;
  padding: 8px;
}
</style>
