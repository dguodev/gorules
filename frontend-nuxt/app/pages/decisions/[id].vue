<template>
  <div v-if="error" class="error-container">
    <h2>Error</h2>
    <p>{{ error }}</p>
    <button @click="navigateTo('/')" class="back-button">← Back</button>
  </div>

  <div v-else-if="!decision" class="loading-container">
    Loading...
  </div>

  <div v-else class="editor-page">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <button @click="navigateTo('/')" class="back-link">
          ← Back
        </button>
        <input
          v-model="decision.name"
          class="name-input"
        />
      </div>
      <button
        @click="handleSave"
        :disabled="saving"
        class="save-button"
      >
        {{ saving ? 'Saving...' : '💾 Save' }}
      </button>
    </div>

    <!-- Editor -->
    <div class="editor-container">
      <DecisionEditor
        :value="decision.graph"
        @change="handleGraphChange"
        :decisionId="id"
        :onSimulationRun="handleSimulationRun"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DecisionGraphType, Simulation } from '@gorules/jdm-editor'
import DecisionEditor from '~~/components/DecisionEditor.vue'
import { useApi } from '~~/composables/useApi'
import type { Decision } from '~~/composables/useApi'

const route = useRoute()
const id = route.params.id as string
const api = useApi()

const decision = ref<Decision | null>(null)
const saving = ref(false)
const error = ref<string | null>(null)

const loadDecision = async () => {
  try {
    const data = await api.fetchDecision(id)
    decision.value = data
  } catch (err) {
    error.value = 'Decision not found'
  }
}

onMounted(() => {
  loadDecision()
})

const handleGraphChange = (graph: any) => {
  if (decision.value) {
    decision.value.graph = graph
  }
}

const handleSimulationRun = async (payload: { graph: DecisionGraphType; context: unknown }): Promise<Simulation> => {
  // Save the latest graph before simulating
  if (decision.value) {
    await api.updateDecision(id, { graph: payload.graph })
  }
  const res = await api.simulateDecision(id, payload.context)

  const traceMap: Record<string, any> = {}
  if (res.trace) {
    for (const [nodeId, traceData] of Object.entries(res.trace as Record<string, any>)) {
      traceMap[nodeId] = {
        id: nodeId,
        name: traceData?.name || '',
        input: traceData?.input ?? null,
        output: traceData?.output ?? null,
        performance: traceData?.performance ?? null,
        traceData: traceData?.traceData ?? null,
      }
    }
  }

  return {
    result: {
      performance: res.performance || '',
      result: res.result,
      trace: traceMap,
      snapshot: payload.graph,
    },
  }
}

const handleSave = async () => {
  if (!decision.value) return
  saving.value = true
  try {
    const updated = await api.updateDecision(id, {
      name: decision.value.name,
      graph: decision.value.graph,
    })
    decision.value = updated
  } catch (err) {
    console.error('Failed to save:', err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.editor-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #fafafa;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.back-link {
  padding: 4px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  font-size: 13px;
}
.name-input {
  font-size: 16px;
  font-weight: 600;
  border: none;
  background: transparent;
  outline: none;
  min-width: 200px;
}
.save-button {
  padding: 6px 14px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}
.save-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
.editor-container {
  flex: 1;
  overflow: hidden;
}
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #888;
}
.back-button {
  margin-top: 16px;
  padding: 8px 16px;
  cursor: pointer;
}
</style>
