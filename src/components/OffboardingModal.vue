<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Person aus Taufmanager entfernen</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <p class="info-text">Wähle eine Person, um sie aus dem Taufmanager zu entfernen.</p>
        
        <div class="person-list">
          <div 
            v-for="person in persons" 
            :key="person.id"
            class="person-item"
            :class="{ selected: selectedPersonId === person.id }"
            @click="selectedPersonId = person.id"
          >
            <img :src="person.imageUrl" :alt="person.firstName" class="avatar">
            <div class="person-info">
              <div class="person-name">{{ person.firstName }} {{ person.lastName }}</div>
              <div class="person-meta">Onboarding: {{ formatDate(person.entry_date) }}</div>
            </div>
          </div>
        </div>
        
        <div v-if="selectedPersonId" class="form-group">
          <label>Offboarding-Datum</label>
          <input 
            v-model="offboardingDate" 
            type="date" 
            class="input-field"
          >
        </div>
        
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="loading" class="loading-message">Entferne Person...</div>
      </div>
      
      <div class="modal-footer">
        <button class="ct-button ct-button--secondary" @click="$emit('close')">Abbrechen</button>
        <button class="ct-button ct-button--danger" @click="removePerson" :disabled="!selectedPersonId || loading">
          Person entfernen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { BaptizoPerson } from '../types/baptizo-types';
import { PersonService } from '../services/personService';

const props = defineProps<{
  persons: BaptizoPerson[]
}>();

const emit = defineEmits(['close', 'personRemoved']);

const selectedPersonId = ref<number | null>(null);
const offboardingDate = ref(new Date().toISOString().split('T')[0]);
const loading = ref(false);
const error = ref('');

const provider = new PersonService();

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return 'Unbekannt';
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const removePerson = async () => {
  if (!selectedPersonId.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    // Update person with offboarding date (this will hide them from all views)
    await provider.updatePersonFields(selectedPersonId.value, {
      taufmanager_offboarding: offboardingDate.value
    });
    
    console.log(`[Baptizo] Person ${selectedPersonId.value} offboarded on ${offboardingDate.value}`);
    emit('personRemoved');
    emit('close');
  } catch (e: any) {
    console.error('[Baptizo] Offboarding failed:', e);
    error.value = `Fehler: ${e.message || 'Person konnte nicht entfernt werden'}`;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  color: white;
  border: 1px solid #444;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  color: #92C9D6;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: white;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
}

.info-text {
  color: #888;
  margin-bottom: 1rem;
}

.person-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #444;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.person-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #333;
}

.person-item:last-child {
  border-bottom: none;
}

.person-item:hover {
  background: #333;
}

.person-item.selected {
  background: #3C3C5B;
  border-left: 3px solid #92C9D6;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 1rem;
}

.person-info {
  flex: 1;
}

.person-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.person-meta {
  font-size: 0.85rem;
  color: #888;
}

.form-group {
  margin-top: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 0.5rem;
}

.input-field {
  width: 100%;
  background: #1a1a1a;
  border: 1px solid #444;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
}

.error-message {
  color: #ff6b6b;
  padding: 0.5rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
  margin-top: 1rem;
}

.loading-message {
  color: #92C9D6;
  padding: 0.5rem;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #444;
}

.ct-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-weight: bold;
  transition: all 0.2s;
}

.ct-button--danger {
  background-color: #ff6b6b;
  color: white;
}

.ct-button--danger:hover:not(:disabled) {
  background-color: #ff5252;
}

.ct-button--danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ct-button--secondary {
  background-color: #444;
  color: #fff;
}

.ct-button--secondary:hover {
  background-color: #555;
}
</style>
