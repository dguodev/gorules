<template>
  <div class="home-container">
    <div class="header">
      <h1 class="title">🎯 GoRules Decision Manager (Nuxt)</h1>
      <p class="subtitle">
        Create, edit, and simulate business rules using GoRules JDM Editor
      </p>
    </div>

    <!-- Create new decision -->
    <div class="create-box">
      <input
        v-model="newName"
        placeholder="New decision name..."
        @keydown.enter="handleCreate"
        class="name-input"
      />
      <button
        @click="handleCreate"
        :disabled="creating || !newName.trim()"
        class="create-button"
      >
        + Create Decision
      </button>
    </div>

    <!-- Decisions list -->
    <div v-if="loading" class="status-text">Loading...</div>
    <div v-else-if="decisions.length === 0" class="empty-state">
      <p>No decisions yet</p>
      <p class="small">Create your first decision above</p>
    </div>
    <div v-else class="decisions-list">
      <div
        v-for="decision in decisions"
        :key="decision.id"
        @click="navigateTo(`/decisions/${decision.id}`)"
        class="decision-card"
      >
        <div class="decision-info">
          <div class="decision-name">{{ decision.name }}</div>
          <div class="decision-date">
            Updated {{ new Date(decision.updatedAt).toLocaleString() }}
          </div>
        </div>
        <button
          @click.stop="handleDelete(decision.id)"
          class="delete-button"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~~/composables/useApi'
import type { Decision } from '~~/composables/useApi'

const api = useApi()
const decisions = ref<Decision[]>([])
const loading = ref(true)
const creating = ref(false)
const newName = ref('')

const loadDecisions = async () => {
  try {
    const data = await api.fetchDecisions()
    decisions.value = data
  } catch (err) {
    console.error('Failed to load decisions:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDecisions()
})

const handleCreate = async () => {
  if (!newName.value.trim()) return
  creating.value = true
  try {
    const decision = await api.createDecision(newName.value.trim())
    newName.value = ''
    navigateTo(`/decisions/${decision.id}`)
  } catch (err) {
    console.error('Failed to create:', err)
  } finally {
    creating.value = false
  }
}

const handleDelete = async (id: string) => {
  if (!confirm('Delete this decision?')) return
  try {
    await api.deleteDecision(id)
    decisions.value = decisions.value.filter((d) => d.id !== id)
  } catch (err) {
    console.error('Failed to delete:', err)
  }
}
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: system-ui, -apple-system, sans-serif;
}
.header {
  margin-bottom: 32px;
}
.title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}
.subtitle {
  color: #6b7280;
  font-size: 14px;
}
.create-box {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.name-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}
.create-button {
  padding: 8px 20px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}
.create-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
.status-text {
  color: #888;
  text-align: center;
}
.empty-state {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}
.small {
  font-size: 13px;
}
.decisions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.decision-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  background-color: white;
}
.decision-card:hover {
  border-color: #2563eb;
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.1);
}
.decision-name {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 4px;
}
.decision-date {
  font-size: 12px;
  color: #9ca3af;
}
.delete-button {
  padding: 4px 10px;
  border: 1px solid #fecaca;
  border-radius: 4px;
  background-color: white;
  color: #dc2626;
  cursor: pointer;
  font-size: 12px;
}
</style>
