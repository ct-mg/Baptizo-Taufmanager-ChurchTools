<template>
  <div class="admin-container">
    <!-- Header (Identical to Dashboard) -->
    <header class="dashboard-header">
      <div class="logo-area">
        <img src="/logo.png" alt="Baptizo Logo" class="logo-img" />
        <h1 class="app-title">BAPTIZO TAUFMANAGER</h1>
      </div>
      <div class="actions">
        <!-- Back Button (Ghost Style like Report Button) -->
        <button @click="navigateBack" class="ct-button ct-button--report">
          <span class="icon">←</span> ZURÜCK ZUM DASHBOARD
        </button>
      </div>
    </header>

    <!-- Content Area -->
    <div class="admin-content">
      <!-- Settings Header (Same as SettingsTab) -->
      <div class="settings-header">
        <div class="filter-bar">
          <button class="active">ChurchTools IDs</button>
        </div>
        <button @click="handleSave" class="ct-button ct-button--primary" :disabled="saving">
          <span v-if="!saving">Einstellungen speichern</span>
          <span v-else>Speichert...</span>
        </button>
      </div>

      <!-- ID Cards Grid (Same styling as SettingsTab links-grid) -->
      <div class="ids-grid">
        <!-- Taufpool ID -->
        <div class="id-card">
          <div class="card-header">
            <h4>Taufpool Gruppe</h4>
          </div>
          <div class="form-group">
            <label>Gruppen-ID</label>
            <input 
              v-model="localSettings.taufpoolGroupId" 
              type="text" 
              placeholder="z.B. 123"
            />
            <p class="help-text">ID der ChurchTools-Gruppe für den Taufpool</p>
          </div>
        </div>

        <!-- Seminar ID -->
        <div class="id-card">
          <div class="card-header">
            <h4>Taufseminar Gruppe</h4>
          </div>
          <div class="form-group">
            <label>Gruppen-ID</label>
            <input 
              v-model="localSettings.seminarGroupId" 
              type="text" 
              placeholder="z.B. 456"
            />
            <p class="help-text">ID der ChurchTools-Gruppe für Seminarteilnehmer</p>
          </div>
        </div>

        <!-- Taufdatum Status ID -->
        <div class="id-card">
          <div class="card-header">
            <h4>Taufdatum Status</h4>
          </div>
          <div class="form-group">
            <label>Status-Feld-ID</label>
            <input 
              v-model="localSettings.taufdatumStatusId" 
              type="text" 
              placeholder="z.B. 789"
            />
            <p class="help-text">ID des Personenstatus-Feldes für das Taufdatum</p>
          </div>
        </div>

        <!-- Taufstatus Field ID -->
        <div class="id-card">
          <div class="card-header">
            <h4>Taufstatus Feld</h4>
          </div>
          <div class="form-group">
            <label>Feld-ID</label>
            <input 
              v-model="localSettings.taufstatusFieldId" 
              type="text" 
              placeholder="z.B. 101"
            />
            <p class="help-text">ID des Personenfeldes für den Taufstatus</p>
          </div>
        </div>

        <!-- Taufort Field ID -->
        <div class="id-card">
          <div class="card-header">
            <h4>Taufort Feld</h4>
          </div>
          <div class="form-group">
            <label>Feld-ID</label>
            <input 
              v-model="localSettings.taufortFieldId" 
              type="text" 
              placeholder="z.B. 102"
            />
            <p class="help-text">ID des Personenfeldes für den Taufort</p>
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
/* Container - Full dark background like Dashboard */
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
  gap: 0.75rem;
  align-items: center;
}

/* Buttons - Identical to Dashboard */
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

/* Tabs - Identical to Dashboard */
.tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #252538;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.tab-btn {
  background: rgba(255,255,255,0.1);
  border: none;
  color: #ccc;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #3C3C5B;
  color: white;
}

/* Content Area */
.admin-content {
  padding: 0 2rem 2rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Settings Header - Identical to SettingsTab */
.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

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

/* ID Cards Grid - Similar to SettingsTab links-grid */
.ids-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.id-card {
  background: #2a2a2a;
  padding: 1.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.id-card:hover {
  background: #2f2f2f;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #444;
}

.card-icon {
  font-size: 1.5rem;
}

.card-header h4 {
  margin: 0;
  color: #92C9D6;
  font-size: 1rem;
  font-weight: bold;
}

/* Form Group - Identical to SettingsTab */
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
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

/* Save Toast - Identical to SettingsTab */
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
