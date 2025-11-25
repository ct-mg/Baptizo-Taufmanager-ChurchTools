<template>
  <div class="event-list-container">
    <!-- Header Controls -->
    <div class="events-header">
      <!-- Left: Filters -->
      <div class="filter-bar">
        <button 
          @click="filterType = 'all'" 
          :class="{ active: filterType === 'all' }"
        >Alle</button>
        <button 
          @click="filterType = 'seminar'" 
          :class="{ active: filterType === 'seminar' }"
        >Seminar</button>
        <button 
          @click="filterType = 'baptism'" 
          :class="{ active: filterType === 'baptism' }"
        >Taufe</button>
        <button 
          @click="showPastEvents = !showPastEvents" 
          :class="{ active: showPastEvents }"
        >Vergangene</button>
      </div>

      <!-- Right: Action -->
      <div class="action-button">
        <button @click="showCreateModal = true" class="ct-button ct-button--primary">
          <span class="icon">➕</span> Neues Event anlegen
        </button>
      </div>
    </div>

    <!-- Event List -->
    <div class="event-list">
      <div v-if="filteredEvents.length === 0" class="empty-state">
        Keine Events gefunden.
      </div>
      <div v-else v-for="event in filteredEvents" :key="event.id" class="event-card" :class="{ ghost: isPast(event) }">
        <div class="event-date">
          <span class="day">{{ getDay(event.date) }}</span>
          <span class="month">{{ getGermanMonth(event.date) }}</span>
        </div>
        
        <div class="event-details">
          <div class="header-row">
            <h4>{{ event.title }} {{ getYear(event.date) }}</h4>
            <span class="type-badge" :class="event.type">
              {{ event.type === 'seminar' ? 'SEMINAR' : 'TAUFE' }}
            </span>
          </div>
          <div class="meta">
            <span class="leader" v-if="event.leader">Leitung: {{ event.leader }}</span>
            <span class="time" v-if="event.time">Start: {{ event.time }} Uhr</span>
          </div>
        </div>

        <div class="event-actions">
          <button class="edit-btn" @click="editEvent(event)">
            ✏️ Bearbeiten
          </button>
        </div>
      </div>
    </div>

    <!-- Create Event Modal -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { MockDataProvider } from '../services/mock-data-provider';
import type { BaptizoEvent } from '../types/baptizo-types';

const dataProvider = new MockDataProvider();
const events = ref<BaptizoEvent[]>([]);
const showCreateModal = ref(false);

// Filter State
const filterType = ref<'all' | 'seminar' | 'baptism'>('all');
const showPastEvents = ref(false);
const archiveWeeks = ref(12); // Fixed to 12 weeks

const newEvent = ref({
  title: '',
  date: '',
  type: 'seminar',
  leader: ''
});

const loadEvents = async () => {
  events.value = await dataProvider.getEvents();
};

// Logic
const filteredEvents = computed(() => {
  const now = new Date();
  // Reset time to midnight for accurate day comparison
  now.setHours(0, 0, 0, 0);

  return events.value.filter(event => {
    // 1. Type Filter
    if (filterType.value !== 'all' && event.type !== filterType.value) return false;

    // 2. Date Logic
    const eventDate = new Date(event.date);
    const diffTime = now.getTime() - eventDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    // Future events: Always show
    if (eventDate >= now) return true;

    // Past events: Show only if toggle ON AND within archive weeks
    if (showPastEvents.value) {
      const maxDays = archiveWeeks.value * 7;
      return diffDays <= maxDays;
    }

    return false;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

const getDay = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.getDate();
};

const getGermanMonth = (dateStr: string) => {
  const date = new Date(dateStr);
  const month = date.toLocaleString('de-DE', { month: 'short' }).toUpperCase();
  // Manual fix for typical English/German mismatches if locale fails or to be safe
  const map: Record<string, string> = {
    'MAR': 'MÄR', 'MAY': 'MAI', 'OCT': 'OKT', 'DEC': 'DEZ', 'MÄRZ': 'MÄR'
  };
  // Remove dot if present (e.g. "Mär.")
  let clean = month.replace('.', '');
  return map[clean] || clean;
};

const getYear = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.getFullYear();
};

const isPast = (event: BaptizoEvent) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(event.date) < now;
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

const editEvent = (event: BaptizoEvent) => {
  alert(`Bearbeiten: ${event.title}\n(Feature folgt)`);
};

onMounted(() => {
  loadEvents();
});
</script>

<style scoped>
.event-list-container {
  /* Padding handled by parent container .events-content */
}

/* Header Controls */
.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 0.5rem;
  background: #1a1a1a;
  padding: 0.25rem;
  border-radius: 6px;
}

.filter-bar button {
  background: #444;
  border: none;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.filter-bar button.active {
  background: #3C3C5B;
  color: white;
  font-weight: bold;
}

/* Archive Controls */
.archive-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: #1a1a1a;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #aaa;
  font-size: 0.9rem;
  cursor: pointer;
}

.archive-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #aaa;
  font-size: 0.9rem;
}

.archive-input-group.disabled {
  opacity: 0.3;
  pointer-events: none;
}

.archive-input-group input {
  width: 50px;
  background: #333;
  border: 1px solid #555;
  color: white;
  padding: 0.2rem;
  border-radius: 4px;
  text-align: center;
}

/* Event List */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  /* No margin-bottom to avoid double spacing with footer */
}

.event-card {
  background: #2a2a2a;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  border-left: 4px solid transparent; /* Default */
  transition: transform 0.2s;
}

.event-card:hover {
  transform: translateX(5px);
}

.event-date {
  background: rgba(255,255,255,0.05);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-align: center;
  min-width: 70px;
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
  font-weight: bold;
  color: #888;
  line-height: 1.2;
}

.event-details {
  flex: 1;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.event-details h4 {
  margin: 0;
  color: #fff;
  font-size: 1.1rem;
}

.meta {
  font-size: 0.9rem;
  color: #aaa;
  display: flex;
  gap: 1.5rem;
}

/* Badges */
.type-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.type-badge.seminar {
  background: rgba(115, 131, 178, 0.2);
  color: #7383B2;
}

.type-badge.baptism {
  background: rgba(255, 159, 67, 0.2);
  color: #FF9F43;
}

/* Actions */
.edit-btn {
  background: none;
  border: 1px solid #444;
  color: #aaa;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #444;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
  background: #2a2a2a;
  border-radius: 8px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  border: 1px solid #444;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
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
  padding: 0.75rem;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ct-button--primary {
  background: #92C9D6;
  color: #3C3C5B;
}

.ct-button--secondary {
  background: #444;
  color: #fff;
}

/* Ghost Look for Past Events */
/* Ghost Look for Past Events */
.event-card.ghost {
  opacity: 0.5;
  filter: grayscale(100%);
}
</style>
