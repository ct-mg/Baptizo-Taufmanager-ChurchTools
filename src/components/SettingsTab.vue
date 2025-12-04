<template>
  <div class="settings-container">
    <!-- New Header: Sub-nav left, Save button right -->
    <div class="settings-header">
      <div class="settings-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-btn"
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <button @click="saveSettings" class="save-btn" :disabled="saving">
        {{ saving ? 'Speichert...' : 'Einstellungen speichern' }}
      </button>
    </div>

    <div class="settings-content">
      <!-- Tab 1: Allgemein -->
      <div v-if="currentTab === 'general'" class="tab-pane">
        <section class="settings-section">
          <h3>Allgemeine Einstellungen</h3>
          
          <div class="form-group">
            <label>Link zum Anmeldeformular</label>
            <input v-model="localSettings.registrationFormUrl" type="text" placeholder="https://..." />
            <p class="help-text">URL zum externen Anmeldeformular (z.B. ChurchTools oder Typeform)</p>
          </div>
        </section>
      </div>

      <!-- Tab 2: E-Mail Vorlagen -->
      <div v-if="currentTab === 'emails'" class="tab-pane">
        <section class="settings-section">
          <h3>E-Mail Vorlagen</h3>
          <div class="email-templates">
            <div v-for="template in localSettings.emailTemplates" :key="template.id" class="template-card">
              <div class="template-header" @click="toggleTemplate(template.id)">
                <h4>{{ template.name }}</h4>
                <span class="offset-badge">{{ template.daysOffset > 0 ? '+' : '' }}{{ template.daysOffset }} Tage</span>
              </div>
              <div v-if="expandedTemplate === template.id" class="template-body">
                <div class="form-group">
                  <label>Betreff</label>
                  <input v-model="template.subject" type="text" />
                </div>
                <div class="form-group">
                  <label>Inhalt</label>
                  <textarea v-model="template.body" rows="6"></textarea>
                  <p class="help-text">Verfügbare Platzhalter: {name}, {uhrzeit}, {ort}, {leader}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Tab 3: Custom Fields -->
      <div v-if="currentTab === 'fields'" class="tab-pane">
        <section class="settings-section">
          <h3>Feld-Bezeichnungen</h3>
          <p class="intro-text">Hier können die Bezeichnungen der Status-Flags angepasst werden.</p>
          
          <div class="fields-list">
            <div v-for="field in localSettings.customFieldLabels" :key="field.key" class="form-group">
              <label>{{ field.key }} (Intern)</label>
              <input v-model="field.label" type="text" />
            </div>
          </div>
        </section>
      </div>
    </div>
    
    <div v-if="saveMessage" class="save-toast">{{ saveMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { BaptizoSettings } from '../types/baptizo-settings';
import { MockDataProvider } from '../services/mock-data-provider';

const props = defineProps<{
  settings: BaptizoSettings;
}>();

const emit = defineEmits<{
  (e: 'update', settings: BaptizoSettings): void;
}>();

const provider = new MockDataProvider();
const localSettings = ref<BaptizoSettings>({ ...props.settings });
const currentTab = ref('general');
const expandedTemplate = ref<string | null>(null);
const saving = ref(false);
const saveMessage = ref('');

const tabs = [
  { id: 'general', label: 'Allgemein' },
  { id: 'emails', label: 'E-Mail Vorlagen' },
  { id: 'fields', label: 'Custom Fields' }
];

// Watch for external changes
watch(() => props.settings, (newSettings) => {
  localSettings.value = { ...newSettings };
}, { deep: true });

const saveSettings = async () => {
  saving.value = true;
  await provider.updateSettings(localSettings.value);
  emit('update', localSettings.value);
  saving.value = false;
  saveMessage.value = 'Gespeichert! ✓';
  setTimeout(() => saveMessage.value = '', 3000);
};

const toggleTemplate = (id: string) => {
  expandedTemplate.value = expandedTemplate.value === id ? null : id;
};
</script>

<style scoped>
.settings-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* New Header Layout */
.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.settings-tabs {
  display: flex;
  gap: 0.5rem;
  background: #1a1a1a;
  padding: 0.25rem;
  border-radius: 6px;
}

.tab-btn {
  background: #444;
  border: none;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #3C3C5B;
  color: white;
  font-weight: bold;
}

/* Save Button */
.save-btn {
  background: #92C9D6;
  color: #3C3C5B;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #7ab8c5;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Content Area */
.settings-content {
  margin-bottom: 2rem;
}

.settings-section {
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.settings-section h3 {
  margin-top: 0;
  color: #92C9D6;
  border-bottom: 1px solid #444;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.intro-text {
  color: #aaa;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ccc;
  font-weight: 500;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
  font-family: inherit;
}

.help-text {
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.5rem;
}

/* Email Templates */
.template-card {
  background: #222;
  border: 1px solid #444;
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.template-header {
  padding: 1rem;
  background: #333;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-header h4 {
  margin: 0;
  color: #fff;
}

.offset-badge {
  background: #444;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.template-body {
  padding: 1rem;
  border-top: 1px solid #444;
}

/* Save Toast */
.save-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
