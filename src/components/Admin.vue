<template>
  <div class="admin-container">
    <header class="admin-header">
      <h1>Baptizo Einstellungen</h1>
      <p>Konfiguration für Taufmanager</p>
    </header>

    <div class="admin-tabs">
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

    <div class="admin-content">
      <!-- Tab 1: Allgemein -->
      <div v-if="currentTab === 'general'" class="tab-pane">
        <section class="settings-section">
          <h3>Allgemeine Einstellungen</h3>
          
          <div class="form-group toggle-group">
            <label>Multi-Site Modus</label>
            <div class="toggle-switch" @click="settings.multiSiteMode = !settings.multiSiteMode" :class="{ active: settings.multiSiteMode }">
              <div class="knob"></div>
            </div>
            <span class="status-text">{{ settings.multiSiteMode ? 'Aktiv' : 'Inaktiv' }}</span>
          </div>

          <div class="form-group" v-if="settings.multiSiteMode">
            <label>Standorte (Campus)</label>
            <div class="campus-list">
              <div v-for="(campus, index) in settings.campuses" :key="index" class="campus-item">
                <input v-model="campus.name" type="text" />
                <button @click="removeCampus(index)" class="icon-btn">🗑️</button>
              </div>
              <button @click="addCampus" class="add-btn">+ Standort hinzufügen</button>
            </div>
          </div>

          <div class="form-group">
            <label>Link zum Anmeldeformular</label>
            <input v-model="settings.registrationFormUrl" type="text" placeholder="https://..." />
            <p class="help-text">URL zum externen Anmeldeformular (z.B. ChurchTools oder Typeform)</p>
          </div>
        </section>
      </div>

      <!-- Tab 2: E-Mail Vorlagen -->
      <div v-if="currentTab === 'emails'" class="tab-pane">
        <section class="settings-section">
          <h3>E-Mail Vorlagen</h3>
          <div class="email-templates">
            <div v-for="template in settings.emailTemplates" :key="template.id" class="template-card">
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
            <div v-for="field in settings.customFieldLabels" :key="field.key" class="form-group">
              <label>{{ field.key }} (Intern)</label>
              <input v-model="field.label" type="text" />
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="admin-actions">
      <button @click="saveSettings" class="ct-button ct-button--primary" :disabled="saving">
        {{ saving ? 'Speichert...' : 'Einstellungen speichern' }}
      </button>
      <span v-if="saveMessage" class="save-message">{{ saveMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MockDataProvider } from '../services/mock-data-provider';
import { DEFAULT_SETTINGS } from '../types/baptizo-settings';
import type { BaptizoSettings } from '../types/baptizo-settings';

const dataProvider = new MockDataProvider();
const settings = ref<BaptizoSettings>({ ...DEFAULT_SETTINGS });
const currentTab = ref('general');
const expandedTemplate = ref<string | null>(null);
const saving = ref(false);
const saveMessage = ref('');

const tabs = [
  { id: 'general', label: 'Allgemein' },
  { id: 'emails', label: 'E-Mail Vorlagen' },
  { id: 'fields', label: 'Custom Fields' }
];

const loadSettings = async () => {
  const data = await dataProvider.getSettings();
  settings.value = data;
};

const saveSettings = async () => {
  saving.value = true;
  await dataProvider.updateSettings(settings.value);
  saving.value = false;
  saveMessage.value = 'Gespeichert! ✓';
  setTimeout(() => saveMessage.value = '', 3000);
};

const addCampus = () => {
  settings.value.campuses.push({ id: Date.now().toString(), name: 'Neuer Campus' });
};

const removeCampus = (index: number) => {
  settings.value.campuses.splice(index, 1);
};

const toggleTemplate = (id: string) => {
  expandedTemplate.value = expandedTemplate.value === id ? null : id;
};

onMounted(() => {
  loadSettings();
});
</script>

<style>
:root {
  --ct-bg: #1E1E2E;
  --ct-card-bg: #2a2a2a;
  --ct-text: #eee;
  --ct-primary: #92C9D6;
  --ct-secondary: #3C3C5B;
  --ct-border: #444;
}

body {
  background-color: var(--ct-bg);
  color: var(--ct-text);
  font-family: 'Inter', sans-serif;
  margin: 0;
}

.admin-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-header h1 {
  color: var(--ct-primary);
  margin-bottom: 0.5rem;
}

.admin-header p {
  color: #aaa;
  margin-top: 0;
}

.admin-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--ct-border);
  padding-bottom: 1rem;
}

.tab-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--ct-secondary);
  color: #fff;
  font-weight: bold;
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.settings-section {
  background: var(--ct-card-bg);
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.settings-section h3 {
  margin-top: 0;
  color: var(--ct-primary);
  border-bottom: 1px solid var(--ct-border);
  padding-bottom: 1rem;
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
  border: 1px solid var(--ct-border);
  color: #fff;
  border-radius: 4px;
  font-family: inherit;
}

.help-text {
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.5rem;
}

/* Toggle Switch */
.toggle-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-switch {
  width: 50px;
  height: 26px;
  background: #444;
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-switch.active {
  background: var(--ct-primary);
}

.toggle-switch .knob {
  width: 22px;
  height: 22px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.3s;
}

.toggle-switch.active .knob {
  left: 26px;
}

/* Campus List */
.campus-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.add-btn {
  background: none;
  border: 1px dashed var(--ct-border);
  color: var(--ct-primary);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  margin-top: 0.5rem;
}

/* Email Templates */
.template-card {
  background: #222;
  border: 1px solid var(--ct-border);
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
  border-top: 1px solid var(--ct-border);
}

/* Actions */
.admin-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.ct-button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-weight: bold;
  font-size: 1rem;
}

.ct-button--primary {
  background: var(--ct-primary);
  color: var(--ct-secondary);
}

.ct-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.save-message {
  color: #10b981;
  font-weight: bold;
  animation: fadeIn 0.3s;
}
</style>
