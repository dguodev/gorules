<template>
  <div class="simulation-panel">
    <h3 class="title">Simulation</h3>
    <div class="input-section">
      <label class="label">Input Context (JSON)</label>
      <textarea
        v-model="input"
        class="json-textarea"
        spellcheck="false"
      />
      <button
        @click="handleSimulate"
        :disabled="loading"
        class="run-button"
      >
        {{ loading ? 'Running...' : '▶ Run Simulation' }}
      </button>
    </div>

    <div v-if="error" class="error-box">
      {{ error }}
    </div>

    <div v-if="result" class="result-section">
      <label class="label">Result</label>
      <pre class="result-pre">{{ JSON.stringify(result.result, null, 2) }}</pre>
      <div v-if="result.performance" class="performance">
        ⏱ Performance: {{ result.performance }}
      </div>
      <details v-if="result.trace">
        <summary class="trace-summary">Trace Details</summary>
        <pre class="trace-pre">{{ JSON.stringify(result.trace, null, 2) }}</pre>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~~/composables/useApi'

const props = defineProps<{
  decisionId: string
}>()

const emit = defineEmits<{
  (e: 'simulationResult', result: any): void
}>()

const api = useApi()

const input = ref(
  JSON.stringify(
    {
      customer: { tier: 'gold' },
      cart: { total: 500 },
    },
    null,
    2
  )
)
const result = ref<any>(null)
const error = ref<string | null>(null)
const loading = ref(false)

const handleSimulate = async () => {
  error.value = null
  result.value = null
  loading.value = true
  try {
    const context = JSON.parse(input.value)
    const res = await api.simulateDecision(props.decisionId, context)
    result.value = res
    emit('simulationResult', res)
  } catch (err: any) {
    error.value = err.message || 'Simulation failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.simulation-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}
.title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}
.input-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}
.json-textarea {
  flex: 1;
  min-height: 120px;
  font-family: monospace;
  font-size: 12px;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  background-color: #f9fafb;
  outline: none;
}
.run-button {
  padding: 8px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
}
.run-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
.error-box {
  padding: 8px 12px;
  background-color: #fef2f2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid #fecaca;
}
.result-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.result-pre {
  padding: 8px;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  font-size: 12px;
  font-family: monospace;
  overflow: auto;
  max-height: 200px;
  margin: 0;
}
.performance {
  font-size: 11px;
  color: #6b7280;
}
.trace-summary {
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
}
.trace-pre {
  padding: 8px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 11px;
  font-family: monospace;
  overflow: auto;
  max-height: 300px;
  margin: 4px 0 0 0;
}
</style>
