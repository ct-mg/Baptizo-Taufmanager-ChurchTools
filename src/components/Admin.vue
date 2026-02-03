<template>
  <div class="admin-container">
    <!-- Header (Identical to Dashboard) -->
    <header class="dashboard-header">
      <div class="logo-area">
        <img src="/logo.png" alt="Baptizo Logo" class="logo-img" />
        <h1 class="app-title">BAPTIZO TAUFMANAGER</h1>
      </div>
      <div class="actions">
        <!-- Back Button (Ghost Style) -->
        <button @click="navigateBack" class="ct-button ct-button--report">
          <span class="icon">←</span> ZURÜCK ZUM DASHBOARD
        </button>
      </div>
    </header>

    <!-- Content Area -->
    <div class="admin-content">
      <!-- Settings Header -->
      <div class="settings-header">
        <h2 class="section-title">ChurchTools IDs konfigurieren</h2>
        <button @click="handleSave" class="ct-button ct-button--primary" :disabled="saving">
          <span v-if="!saving">Einstellungen speichern</span>
          <span v-else>Speichert...</span>
        </button>
      </div>

      <!-- Section 1: DIE MENSCHEN (Gruppen) -->
      <div class="config-section">
        <div class="section-header">
          <h3>1. Die Menschen (Gruppen)</h3>
          <p class="section-description">Gruppen-IDs für den Tauf-Workflow</p>
        </div>
        <div class="ids-grid">
          <div class="id-card">
            <div class="card-header">
              <h4>Taufpool / Interessenten</h4>
            </div>
            <div class="form-group">
              <label>Gruppen-ID</label>
              <input 
                v-model="localSettings.pipelineGroupId" 
                type="text" 
                placeholder="z.B. 123"
              />
              <p class="help-text">Hier kommen neue Leute rein (Quelle für Liste 1 & 2)</p>
            </div>
          </div>

          <div class="id-card">
            <div class="card-header">
              <h4>Getaufte</h4>
            </div>
            <div class="form-group">
              <label>Gruppen-ID</label>
              <input 
                v-model="localSettings.baptizedGroupId" 
                type="text" 
                placeholder="z.B. 456"
              />
              <p class="help-text">Hier landen Leute nach der Taufe (Quelle für Liste 3 & 4)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: DER FORTSCHRITT (Felder) -->
      <div class="config-section">
        <div class="section-header">
          <h3>2. Der Fortschritt (Felder)</h3>
          <p class="section-description">Personenfelder für Status-Tracking</p>
        </div>
        <div class="ids-grid">
          <div class="id-card">
            <div class="card-header">
              <h4>Seminar besucht am</h4>
              <span class="field-type">Datum</span>
            </div>
            <div class="form-group">
              <label>Feld-ID</label>
              <input 
                v-model="localSettings.fieldSeminarDateId" 
                type="text" 
                placeholder="z.B. 101"
              />
              <p class="help-text">Trigger für Wechsel von Liste 1 → 2</p>
            </div>
          </div>

          <div class="id-card">
            <div class="card-header">
              <h4>Getauft am</h4>
              <span class="field-type">Datum</span>
            </div>
            <div class="form-group">
              <label>Feld-ID</label>
              <input 
                v-model="localSettings.fieldBaptismDateId" 
                type="text" 
                placeholder="z.B. 102"
              />
              <p class="help-text">Trigger für Verschiebung in Gruppe "Getaufte"</p>
            </div>
          </div>

          <div class="id-card">
            <div class="card-header">
              <h4>Urkunde überreicht</h4>
              <span class="field-type">Checkbox</span>
            </div>
            <div class="form-group">
              <label>Feld-ID</label>
              <input 
                v-model="localSettings.fieldCertificateId" 
                type="text" 
                placeholder="z.B. 103"
              />
              <p class="help-text">Erledigt Liste 3</p>
            </div>
          </div>

          <div class="id-card">
            <div class="card-header">
              <h4>Integriert</h4>
              <span class="field-type">Checkbox</span>
            </div>
            <div class="form-group">
              <label>Feld-ID</label>
              <input 
                v-model="localSettings.fieldIntegratedId" 
                type="text" 
                placeholder="z.B. 104"
              />
              <p class="help-text">Erledigt Liste 4</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: DIE TERMINE (Kalender) -->
      <div class="config-section">
        <div class="section-header">
          <h3>3. Die Termine (Kalender)</h3>
          <p class="section-description">Kalender für Tauf-Events und Seminare</p>
        </div>
        <div class="ids-grid">
          <div class="id-card id-card--wide">
            <div class="card-header">
              <h4>Kalender</h4>
            </div>
            <div class="form-group">
              <label>Kalender-ID</label>
              <input 
                v-model="localSettings.calendarId" 
                type="text" 
                placeholder="z.B. 5"
              />
              <p class="help-text">Hier werden Tauf-Termine und Seminare gespeichert und gelesen</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Toast -->
    <div v-if="saveMessage" class="save-toast" :class="{ error: saveError }">
      {{ saveMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAdminSettings, saveAdminSettings, getDefaultAdminSettings, type AdminSettings } from '../lib/kv-store';

const props = defineProps<{
  onNavigate?: (target: string) => void;
}>();

function navigateBack() {
  console.log('[Baptizo] Navigating back to Main Entry Point...');
  const menuItems = document.querySelectorAll('.menu-item');
  for (const item of menuItems) {
    if (item.textContent?.includes('main')) {
      console.log('[Baptizo] Found main menu item, clicking...');
      (item as HTMLElement).click();
      return;
    }
  }
  if (props.onNavigate) {
    props.onNavigate('main');
  } else {
    console.warn('[Baptizo] Could not find main menu item');
  }
}

const localSettings = ref<AdminSettings>(getDefaultAdminSettings());
const saving = ref(false);
const saveMessage = ref('');
const saveError = ref(false);

onMounted(async () => {
  try {
    const settings = await getAdminSettings();
    localSettings.value = settings ?? getDefaultAdminSettings();
    console.log('[Baptizo] Admin settings loaded:', settings);
  } catch (error) {
    console.error('[Baptizo] Error loading admin settings:', error);
  }
});

async function handleSave() {
  saving.value = true;
  saveMessage.value = '';
  saveError.value = false;

  try {
    const success = await saveAdminSettings(localSettings.value);
    if (success) {
      saveMessage.value = '✓ Einstellungen gespeichert';
      saveError.value = false;
    } else {
      saveMessage.value = '✗ Fehler beim Speichern';
      saveError.value = true;
    }
  } catch (error) {
    saveMessage.value = '✗ Fehler beim Speichern';
    saveError.value = true;
    console.error('[Baptizo] Error saving admin settings:', error);
  } finally {
    saving.value = false;
    setTimeout(() => saveMessage.value = '', 3000);
  }
}
</script>

<style scoped>
/* Container */
.admin-container {
  background: #1a1a1a;
  min-height: 100vh;
  color: #eee;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Header - Identical to Dashboard */
.dashboard-header {
  background: #3C3C5B;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-img {
  height: 50px;
  width: auto;
}

.app-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  margin: 0;
  text-transform: uppercase;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Buttons */
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
  background-color: #92C9D6;
  color: #3C3C5B;
  border: 2px solid #92C9D6;
}

.ct-button--primary:hover {
  background: #7ab8c5;
}

.ct-button--report {
  background-color: rgba(0, 0, 0, 0.3);
  border: 2px solid #92C9D6;
  color: #fff;
}

.ct-button--report:hover {
  background: rgba(146, 201, 214, 0.2);
}

.ct-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Content Area */
.admin-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Settings Header */
.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #92C9D6;
  margin: 0;
}

/* Config Sections */
.config-section {
  margin-bottom: 2.5rem;
}

.section-header {
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
  margin: 0 0 0.25rem 0;
}

.section-description {
  color: #888;
  font-size: 0.9rem;
  margin: 0;
}

/* ID Cards Grid */
.ids-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.id-card {
  background: #2a2a2a;
  padding: 1.25rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.id-card:hover {
  background: #2f2f2f;
}

.id-card--wide {
  max-width: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #444;
}

.card-header h4 {
  margin: 0;
  color: #92C9D6;
  font-size: 1rem;
  font-weight: bold;
}

.field-type {
  background: #444;
  color: #aaa;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  text-transform: uppercase;
}

/* Form Group */
.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ccc;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #92C9D6;
}

.form-group input::placeholder {
  color: #666;
}

.help-text {
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.5rem;
  margin-bottom: 0;
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
  z-index: 1000;
}

.save-toast.error {
  background: #ef4444;
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
