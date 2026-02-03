/**
 * KV-Store for Baptizo Admin Settings
 * Stores configuration IDs for groups, fields, and calendar.
 * 
 * Final v1 Mapping: 7 IDs total
 * - 2 Groups (Pipeline, Baptized)
 * - 4 Fields (Seminar Date, Baptism Date, Certificate, Integrated)
 * - 1 Calendar
 */

import { churchtoolsClient } from '@churchtools/churchtools-client';

export interface AdminSettings {
    // === DIE MENSCHEN (Gruppen) ===
    /** ID Gruppe: Taufpool / Interessenten - Quelle für Liste 1 & 2 */
    pipelineGroupId: string;
    /** ID Gruppe: Getaufte - Quelle für Liste 3 & 4 */
    baptizedGroupId: string;

    // === DER FORTSCHRITT (Felder) ===
    /** ID Feld: Seminar besucht am (Datum) - Trigger Liste 1 -> 2 */
    fieldSeminarDateId: string;
    /** ID Feld: Getauft am (Datum) - Trigger für Verschiebung in Gruppe Getaufte */
    fieldBaptismDateId: string;
    /** ID Feld: Urkunde überreicht (Checkbox) - Erledigt Liste 3 */
    fieldCertificateId: string;
    /** ID Feld: Integriert (Checkbox) - Erledigt Liste 4 */
    fieldIntegratedId: string;

    // === DIE TERMINE (Kalender) ===
    /** ID Kalender - Tauf-Termine und Seminare */
    calendarId: string;
}

const STORAGE_KEY = 'baptizo-admin-settings';

/**
 * Get admin settings from localStorage (dev) or ChurchTools KV store (prod)
 */
export async function getAdminSettings(): Promise<AdminSettings | null> {
    // In development, use localStorage
    if (import.meta.env.MODE === 'development') {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    }

    // In production, use ChurchTools KV store API
    try {
        const response = await churchtoolsClient.get('/api/config/kv-store') as { data?: Array<{ key: string; value: string }> };
        const kvData = response?.data?.find((item) => item.key === STORAGE_KEY);
        return kvData?.value ? JSON.parse(kvData.value) : null;
    } catch (error) {
        console.error('[Baptizo] Failed to load admin settings from KV store:', error);
        return null;
    }
}

/**
 * Save admin settings to localStorage (dev) or ChurchTools KV store (prod)
 */
export async function saveAdminSettings(settings: AdminSettings): Promise<boolean> {
    // In development, use localStorage
    if (import.meta.env.MODE === 'development') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        console.log('[Baptizo] Admin settings saved to localStorage');
        return true;
    }

    // In production, use ChurchTools KV store API
    try {
        await churchtoolsClient.put('/api/config/kv-store', {
            key: STORAGE_KEY,
            value: JSON.stringify(settings)
        });
        console.log('[Baptizo] Admin settings saved to KV store');
        return true;
    } catch (error) {
        console.error('[Baptizo] Failed to save admin settings to KV store:', error);
        return false;
    }
}

/**
 * Get default empty settings (all 7 IDs)
 */
export function getDefaultAdminSettings(): AdminSettings {
    return {
        // Gruppen
        pipelineGroupId: '',
        baptizedGroupId: '',
        // Felder
        fieldSeminarDateId: '',
        fieldBaptismDateId: '',
        fieldCertificateId: '',
        fieldIntegratedId: '',
        // Kalender
        calendarId: ''
    };
}
