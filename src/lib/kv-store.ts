/**
 * KV-Store for Baptizo Admin Settings
 * Stores configuration IDs for groups, status fields, etc.
 */

import { churchtoolsClient } from '@churchtools/churchtools-client';

export interface AdminSettings {
    taufpoolGroupId: string;
    seminarGroupId: string;
    taufdatumStatusId: string;
    taufstatusFieldId: string;
    taufortFieldId: string;
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
 * Get default empty settings
 */
export function getDefaultAdminSettings(): AdminSettings {
    return {
        taufpoolGroupId: '',
        seminarGroupId: '',
        taufdatumStatusId: '',
        taufstatusFieldId: '',
        taufortFieldId: ''
    };
}
