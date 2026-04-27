<template>
  <v-app>
    <v-btn
      class="ma-2"
      icon="mdi-theme-light-dark"
      location="top right"
      position="absolute"
      @click="$vuetify.theme.cycle()"
    />

    <v-main>
      <v-container class="d-flex flex-column justify-space-between" style="height: 100vh">
        <div>
          <InfoTextArea />
          <v-divider class="my-4" :thickness="2" />
          <QueryTable @submit="handleSubmit" />
          <v-divider class="my-4" :thickness="2" />
        </div>

        <ResultsTable ref="resultsTableRef" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import InfoTextArea from './components/InfoTextArea.vue'
  import QueryTable from './components/QueryTable.vue'
  import ResultsTable from './components/ResultsTable.vue'

  const resultsTableRef = ref<InstanceType<typeof ResultsTable> | null>(null)

  function handleSubmit (query: string) {
    resultsTableRef.value?.addResult(query)
  }
</script>
