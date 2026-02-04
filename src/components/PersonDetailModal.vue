<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="person-name">{{ person.firstName }} {{ person.lastName }}</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="person-header">
          <img :src="person.imageUrl" alt="Avatar" class="avatar-large" />
          <div class="info-text">
            <div class="form-group status-group">
              <label>Status</label>
              <select v-model="status" class="status-select" :class="status">
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
              </select>
            </div>
            <p class="meta-info">Onboarding: {{ formatDate(person.entry_date) }}</p>
          </div>
        </div>

        <hr class="divider">

        <div class="grid-layout">
          <!-- Row 1: Seminar -->
          <div class="grid-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="hasSeminar" @change="updateDate('seminar')">
              Seminar
            </label>
            <input v-if="hasSeminar" type="date" v-model="seminarDate" class="date-input">
          </div>

          <!-- Row 2: Taufe -->
          <div class="grid-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="isBaptized" @change="updateDate('baptism')">
              Taufe
            </label>
            <input v-if="isBaptized" type="date" v-model="baptismDate" class="date-input">
          </div>

          <!-- Row 3: Urkunde -->
          <div class="grid-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="hasCertificate" @change="updateDate('certificate')">
              Urkunde
            </label>
            <input v-if="hasCertificate" type="date" v-model="certificateDate" class="date-input">
          </div>

          <!-- Row 4: Integration -->
          <div class="grid-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="isIntegrated" @change="updateDate('integration')">
              Integration
            </label>
            <input v-if="isIntegrated" type="date" v-model="integrationDate" class="date-input">
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="ct-button ct-button--contact" @click="showContact">Kontaktdaten</button>
        <div class="action-buttons">
          <button class="ct-button ct-button--secondary" @click="$emit('close')">Abbrechen</button>
          <button class="ct-button ct-button--primary" @click="save">Speichern</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { BaptizoPerson, BaptizoStatus } from '../types/baptizo-types';

const props = defineProps<{
  person: BaptizoPerson
}>();

const emit = defineEmits(['close', 'save']);

// Local state
const status = ref<BaptizoStatus>(props.person.status);
const hasSeminar = ref(!!props.person.fields.seminar_besucht_am);
const seminarDate = ref(props.person.fields.seminar_besucht_am || '');
const isBaptized = ref(!!props.person.fields.getauft_am);
const baptismDate = ref(props.person.fields.getauft_am || '');
const hasCertificate = ref(!!props.person.fields.urkunde_ueberreicht);
const certificateDate = ref(props.person.fields.urkunde_ueberreicht || '');
const isIntegrated = ref(!!props.person.fields.in_gemeinde_integriert);
const integrationDate = ref(props.person.fields.in_gemeinde_integriert || '');

// Helpers
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'Unbekannt';
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const updateDate = (field: 'seminar' | 'baptism' | 'certificate' | 'integration') => {
  const today = new Date().toISOString().split('T')[0];
  if (field === 'seminar') {
    seminarDate.value = hasSeminar.value ? (seminarDate.value || today) : '';
  } else if (field === 'baptism') {
    baptismDate.value = isBaptized.value ? (baptismDate.value || today) : '';
  } else if (field === 'certificate') {
    certificateDate.value = hasCertificate.value ? (certificateDate.value || today) : '';
  } else if (field === 'integration') {
    integrationDate.value = isIntegrated.value ? (integrationDate.value || today) : '';
  }
};

const save = () => {
  const updatedPerson: BaptizoPerson = {
    ...props.person,
    status: status.value,
    fields: {
      ...props.person.fields,
      seminar_besucht_am: hasSeminar.value ? seminarDate.value : null,
      getauft_am: isBaptized.value ? baptismDate.value : null,
      urkunde_ueberreicht: hasCertificate.value ? certificateDate.value : null,
      in_gemeinde_integriert: isIntegrated.value ? integrationDate.value : null,
    }
  };
  emit('save', updatedPerson);
};

const showContact = () => {
  alert(`Kontakt: ${props.person.firstName} ${props.person.lastName}\nE-Mail: ${props.person.firstName.toLowerCase()}@example.com\nTel: 0123 456789`);
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

.person-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #92C9D6;
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

.person-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
}

.info-text {
  flex: 1;
}

.status-group {
  margin-bottom: 0.5rem;
}

.status-group label {
  display: block;
  font-size: 0.8rem;
  color: #aaa;
  margin-bottom: 0.2rem;
}

.status-select {
  background: #1a1a1a;
  color: white;
  border: 1px solid #444;
  padding: 0.3rem;
  border-radius: 4px;
  width: 100%;
}

.meta-info {
  font-size: 0.85rem;
  color: #888;
  margin: 0;
}

.divider {
  border: 0;
  border-top: 1px solid #444;
  margin: 1.5rem 0;
}

/* Grid Layout for Form */
.grid-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.grid-row {
  display: grid;
  grid-template-columns: 1fr 140px;
  gap: 1rem;
  align-items: center;
  min-height: 32px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
}

.date-input {
  background: #444;
  border: 1px solid #666;
  color: white;
  padding: 0.3rem;
  border-radius: 4px;
  width: 100%;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #444;
}

.action-buttons {
  display: flex;
  gap: 1rem;
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

.ct-button--primary:hover {
  background-color: #a8d5e0;
}

.ct-button--secondary {
  background-color: #444;
  color: #fff;
}

.ct-button--secondary:hover {
  background-color: #555;
}

.ct-button--contact {
  background-color: #7383B2;
  color: white;
  padding: 0.4rem 0.8rem;
}

.ct-button--contact:hover {
  background-color: #8593c2;
}
</style>
