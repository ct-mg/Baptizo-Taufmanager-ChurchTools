<template>
  <div class="person-list">
    <div v-if="persons.length === 0" class="empty-state">
      Keine Einträge.
    </div>
    <ul v-else>
      <li 
        v-for="person in persons" 
        :key="person.id" 
        class="person-item" 
        :class="{ clickable: clickable }"
        @click="handleClick(person)"
      >
        <div 
          class="avatar-circle" 
          :style="{ backgroundColor: getAvatarColor(person) }"
        >
          <span v-if="!person.imageUrl || person.imageUrl.includes('ui-avatars') || person.imageUrl.includes('dicebear')" class="initials">{{ getInitials(person) }}</span>
          <img v-else :src="person.imageUrl" alt="Avatar" class="avatar-img" />
        </div>
        <div class="details">
          <span class="name">{{ person.firstName }} {{ person.lastName }}</span>
          <span class="status-badge" :class="type">{{ getStatusText(person) }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { BaptizoPerson } from '../types/baptizo-types';

const props = withDefaults(defineProps<{
  persons: (BaptizoPerson & { subtitle?: string })[],
  type?: 'warning' | 'info' | 'default',
  clickable?: boolean
}>(), {
  type: 'default',
  clickable: true
});

const emit = defineEmits(['click']);

// BRAND PALETTE: Exact Chart Colors (Turquoise, Purple, Orange)
const BRAND_PALETTE = [
  '#92C9D6', // Turquoise (Interessenten)
  '#7383B2', // Purple (Seminare)
  '#FF9F43'  // Orange (Taufen)
];

const getAvatarColor = (person: BaptizoPerson) => {
  // Use name hash for better distribution than numeric ID
  const str = (person.firstName || '') + (person.lastName || '') + (person.id || 0);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BRAND_PALETTE.length;
  return BRAND_PALETTE[index];
};

const getInitials = (person: BaptizoPerson) => {
  const f = person.firstName?.charAt(0) || '';
  const l = person.lastName?.charAt(0) || '';
  return (f + l).toUpperCase();
};

const getStatusText = (p: BaptizoPerson & { subtitle?: string }) => {
  if (p.subtitle) return p.subtitle;
  if (props.type === 'warning') return 'Aktion erforderlich';
  if (props.type === 'info') return 'Info';
  return '';
};

const handleClick = (person: BaptizoPerson) => {
  if (props.clickable) {
    emit('click', person);
  }
};
</script>

<style scoped>
.person-list {
  max-height: 300px;
  overflow-y: auto;
}
.person-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s;
}
.person-item:last-child {
  border-bottom: none;
}
.person-item.clickable {
  cursor: pointer;
}
.person-item.clickable:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Avatar Styling */
.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #1a1a1a; /* Match page background for better contrast on bright colors */
  font-weight: bold;
  font-size: 0.85rem;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.1); /* Subtle border */
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.details {
  display: flex;
  flex-direction: column;
}
.name {
  font-weight: bold;
}
.status-badge {
  font-size: 0.8rem;
  color: #666;
}
.status-badge.warning { color: #d97706; }
.status-badge.info { color: #dc2626; }
</style>
