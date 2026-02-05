<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Taufmanager Onboarding</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <!-- Info Text removed -->
        
        <div class="form-group">
          <label>Personen ID (nur Nummer)</label>
          <input 
            v-model.number="personId" 
            type="number" 
            placeholder="z.B. 123"
            class="input-field"
          >
        </div>
        
        <div class="form-group">
          <label>Onboarding-Datum</label>
          <input 
            v-model="onboardingDate" 
            type="date" 
            class="input-field"
          >
        </div>
        
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="loading" class="loading-message">Lädt Person...</div>
      </div>
      
      <div class="modal-footer">
        <button class="ct-button ct-button--secondary" @click="$emit('close')">Abbrechen</button>
        <button class="ct-button ct-button--primary" @click="addPerson" :disabled="!personId || loading">
          Person hinzufügen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PersonService } from '../services/personService';

const emit = defineEmits(['close', 'personAdded']);

const personId = ref<number | null>(null);
const onboardingDate = ref(new Date().toISOString().split('T')[0]);
const loading = ref(false);
const error = ref('');

const provider = new PersonService();

const addPerson = async () => {
  if (!personId.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    // Check if person exists
    await provider.getPerson(personId.value);
    
    // Always overwrite onboarding date & clear offboarding date
    await provider.updatePersonFields(personId.value, {
      taufmanager_onboaring: onboardingDate.value,
      taufmanager_offboarding: null
    });
    
    console.log(`[Baptizo] Person ${personId.value} onboarded on ${onboardingDate.value}`);
    emit('personAdded');
    emit('close');
  } catch (e: any) {
    console.error('[Baptizo] Onboarding failed:', e);
    error.value = `Fehler: ${e.message || 'Person konnte nicht gefunden werden'}`;
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
  width: 500px;
  max-width: 90%;
  color: white;
  border: 1px solid #444;
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
  font-size: 24px;
  font-weight: 700;
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

.info-text {
  color: #888;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
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

.ct-button--primary {
  background-color: #92C9D6;
  color: #3C3C5B;
}

.ct-button--primary:hover:not(:disabled) {
  background-color: #a8d5e0;
}

.ct-button--primary:disabled {
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
