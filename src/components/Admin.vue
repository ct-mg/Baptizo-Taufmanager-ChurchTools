<template>
  <div class="admin-panel">
    <h2 class="admin-title">🔐 Admin-Einstellungen</h2>
    <p class="admin-description">
      Hier werden die technischen IDs für die ChurchTools-Integration konfiguriert.
      Diese Einstellungen sind nur für Administratoren sichtbar.
    </p>

    <div class="settings-form">
      <div class="form-group">
        <label for="taufpoolGroupId">Taufpool Gruppen-ID</label>
        <input 
          id="taufpoolGroupId"
          v-model="localSettings.taufpoolGroupId" 
          type="text" 
          placeholder="z.B. 123"
          class="form-input"
        />
        <span class="form-hint">ID der Gruppe, die den Taufpool enthält</span>
      </div>

      <div class="form-group">
        <label for="seminarGroupId">Taufseminar Gruppen-ID</label>
        <input 
          id="seminarGroupId"
          v-model="localSettings.seminarGroupId" 
          type="text" 
          placeholder="z.B. 456"
          class="form-input"
        />
        <span class="form-hint">ID der Gruppe für Taufseminar-Teilnehmer</span>
      </div>

      <div class="form-group">
        <label for="taufdatumStatusId">Taufdatum Status-Feld-ID</label>
        <input 
          id="taufdatumStatusId"
          v-model="localSettings.taufdatumStatusId" 
          type="text" 
          placeholder="z.B. 789"
          class="form-input"
        />
        <span class="form-hint">ID des Personenstatus-Feldes für das Taufdatum</span>
      </div>

      <div class="form-group">
        <label for="taufstatusFieldId">Taufstatus Feld-ID</label>
        <input 
          id="taufstatusFieldId"
          v-model="localSettings.taufstatusFieldId" 
          type="text" 
          placeholder="z.B. 101"
          class="form-input"
        />
        <span class="form-hint">ID des Personenfeldes für den Taufstatus</span>
      </div>

      <div class="form-group">
        <label for="taufortFieldId">Taufort Feld-ID</label>
        <input 
          id="taufortFieldId"
          v-model="localSettings.taufortFieldId" 
          type="text" 
          placeholder="z.B. 102"
          class="form-input"
        />
        <span class="form-hint">ID des Personenfeldes für den Taufort</span>
      </div>

      <div class="form-actions">
        <button @click="handleSave" class="save-button" :disabled="saving">
          {{ saving ? 'Speichern...' : '💾 Speichern' }}
        </button>
        <span v-if="saveMessage" class="save-message" :class="{ error: saveError }">
          {{ saveMessage }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAdminSettings, saveAdminSettings, getDefaultAdminSettings, type AdminSettings } from '../lib/kv-store';

const localSettings = ref<AdminSettings>(getDefaultAdminSettings());
const saving = ref(false);
const saveMessage = ref('');
const saveError = ref(false);

onMounted(async () => {
  const stored = await getAdminSettings();
  if (stored) {
    localSettings.value = stored;
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
  }
}
</script>

<style scoped>
.admin-panel {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.admin-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #c00;
}

.admin-description {
  color: #666;
  margin-bottom: 24px;
  font-size: 0.9rem;
}

.settings-form {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #ddd;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
}

.form-hint {
  display: block;
  font-size: 0.8rem;
  color: #888;
  margin-top: 4px;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.save-button {
  background: #c00;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.save-button:hover:not(:disabled) {
  background: #a00;
}

.save-button:disabled {
  background: #999;
  cursor: not-allowed;
}

.save-message {
  color: #060;
  font-weight: 500;
}

.save-message.error {
  color: #c00;
}
</style>
