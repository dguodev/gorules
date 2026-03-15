<script setup lang="ts">
import { createRoot } from 'react-dom/client'
import { applyPureReactInVue, setVeauryOptions } from 'veaury'
import { ReactDecisionEditor } from './ReactDecisionEditor'
import type { DecisionGraphType, Simulation } from '@gorules/jdm-editor'
import { useApi } from '~~/composables/useApi'

setVeauryOptions({
  react: {
    createRoot,
  },
})

const ReactDecisionEditorComponent = applyPureReactInVue(ReactDecisionEditor)

const props = defineProps<{
  value: DecisionGraphType
  disabled?: boolean
  decisionId: string
  onSimulationRun?: (payload: { graph: DecisionGraphType; context: unknown }) => Promise<Simulation>
}>()

const emit = defineEmits<{
  (e: 'change', value: DecisionGraphType): void
}>()

const api = useApi()

const handleGraphChange = (value: DecisionGraphType) => {
  emit('change', value)
}

const handleUpdateSavedRequest = async (decisionId: string, reqId: string, name: string, context: any) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  await fetch(`${apiBase}/api/decisions/${decisionId}/requests/${reqId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, context }),
  })
}
</script>

<template>
  <div class="decision-editor-container">
    <ReactDecisionEditorComponent
      v-bind="props"
      :onChange="handleGraphChange"
      :fetchSavedRequests="api.fetchSavedRequests"
      :createSavedRequest="api.createSavedRequest"
      :deleteSavedRequest="api.deleteSavedRequest"
      :updateSavedRequest="handleUpdateSavedRequest"
    />
  </div>
</template>

<style scoped>
.decision-editor-container {
  height: 100%;
  width: 100%;
}
</style>
