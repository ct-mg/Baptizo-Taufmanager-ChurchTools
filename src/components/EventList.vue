<template>
  <div class="event-list-container">
    <!-- Actions -->
    <div class="actions-bar">
      <button @click="showCreateModal = true" class="ct-button ct-button--primary">
        + Neues Event anlegen
      </button>
    </div>

    <!-- Event List -->
    <div class="event-list">
      <div v-for="event in events" :key="event.id" class="event-card">
        <div class="event-date">
          <span class="day">{{ getDay(event.date) }}</span>
          <span class="month">{{ getMonth(event.date) }}</span>
        </div>
        <div class="event-details">
          <h4>{{ event.title }}</h4>
          <div class="meta">
            <span class="type-badge" :class="event.type">{{ event.type === 'seminar' ? 'Seminar' : 'Taufe' }}</span>
            <span class="leader" v-if="event.leader">Leitung: {{ event.leader }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Manual Entry Section -->
    <div class="manual-entry-section">
      <h3>Manuelle Erfassung</h3>
      <p>Person direkt in "Getaufte" eintragen (ohne Prozess).</p>
      <button @click="showManualEntry = true" class="ct-button ct-button--secondary">
        Taufe nachtragen
      </button>
    </div>

    <!-- Create Event Modal (Mock) -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <h3>Neues Event</h3>
        <div class="form-group">
          <label>Titel</label>
          <input v-model="newEvent.title" type="text" placeholder="z.B. Taufseminar April" />
        </div>
        <div class="form-group">
          <label>Datum</label>
          <input v-model="newEvent.date" type="date" />
        </div>
        <div class="form-group">
          <label>Typ</label>
          <select v-model="newEvent.type">
            <option value="seminar">Taufseminar</option>
            <option value="baptism">Taufe</option>
          </select>
        </div>
        <div class="form-group">
          <label>Leiter</label>
          <input v-model="newEvent.leader" type="text" placeholder="Name des Leiters" />
        </div>
        <div class="modal-actions">
          <button @click="showCreateModal = false" class="ct-button ct-button--secondary">Abbrechen</button>
          <button @click="createEvent" class="ct-button ct-button--primary">Speichern</button>
        </div>
      </div>
    </div>

    <!-- Manual Entry Modal (Mock) -->
    <div v-if="showManualEntry" class="modal-overlay">
      <div class="modal">
        <h3>Taufe nachtragen</h3>
        <div class="form-group">
          <label>Vorname</label>
          <input type="text" />
        </div>
        <div class="form-group">
          <label>Nachname</label>
          <input type="text" />
        </div>
        <div class="form-group">
          <label>Taufdatum</label>
          <input type="date" />
        </div>
        <div class="modal-actions">
          <button @click="showManualEntry = false" class="ct-button ct-button--secondary">Abbrechen</button>
          <button @click="saveManualEntry" class="ct-button ct-button--primary">Speichern</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MockDataProvider } from '../services/mock-data-provider';
import type { BaptizoEvent } from '../types/baptizo-types';

const dataProvider = new MockDataProvider();
const events = ref<BaptizoEvent[]>([]);
const showCreateModal = ref(false);
const showManualEntry = ref(false);

const newEvent = ref({
  title: '',
  date: '',
  type: 'seminar',
  leader: ''
});

const loadEvents = async () => {
  events.value = await dataProvider.getEvents();
};

const getDay = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.getDate();
};

const getMonth = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('de-DE', { month: 'short' });
};

const createEvent = async () => {
  if (!newEvent.value.title || !newEvent.value.date) return;
  
  await dataProvider.createEvent({
    title: newEvent.value.title,
    date: newEvent.value.date,
    type: newEvent.value.type as 'seminar' | 'baptism',
    leader: newEvent.value.leader
  });
  
  await loadEvents();
  showCreateModal.value = false;
  newEvent.value = { title: '', date: '', type: 'seminar', leader: '' };
};

const saveManualEntry = () => {
  // Mock implementation
  showManualEntry.value = false;
};

onMounted(() => {
  loadEvents();
});
</script>

<style scoped>
.event-list-container {
  padding: 1rem 0;
}

.actions-bar {
  margin-bottom: 2rem;
  text-align: right;
}

.event-list {
  display: grid;
  gap: 1rem;
  margin-bottom: 3rem;
}

.event-card {
  background: var(--ct-card-bg, #2a2a2a);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  border-left: 4px solid #7383B2;
}

.event-date {
  background: rgba(255,255,255,0.1);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-align: center;
  min-width: 60px;
}

.event-date .day {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
}

.event-date .month {
  display: block;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #aaa;
}

.event-details h4 {
  margin: 0 0 0.5rem 0;
  color: #fff;
}

.meta {
  margin: 0;
  font-size: 0.9rem;
  color: #aaa;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.type-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: bold;
}

.type-badge.seminar {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.type-badge.baptism {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.manual-entry-section {
  border-top: 1px solid #444;
  padding-top: 2rem;
}

.manual-entry-section h3 {
  color: #fff;
  margin-top: 0;
}

.manual-entry-section p {
  color: #aaa;
  margin-bottom: 1rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  border: 1px solid #444;
}

.modal h3 {
  margin-top: 0;
  color: #fff;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #aaa;
  font-size: 0.9rem;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 0.5rem;
  background: #1a1a1a;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.ct-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-weight: bold;
}

.ct-button--primary {
  background: #92C9D6;
  color: #3C3C5B;
}

.ct-button--secondary {
  background: #444;
  color: #fff;
}
</style>
