import { churchtoolsClient } from '@churchtools/churchtools-client';
import type { DataProvider } from './data-provider.interface';
import type { BaptizoGroup, BaptizoPerson, BaptizoFields, BaptizoEvent } from '../types/baptizo-types';
import { getAdminSettings } from '../lib/kv-store';

/**
 * Real DataProvider implementation using ChurchTools API.
 * Reads configuration from kv-store (Admin Settings).
 */
export class PersonService implements DataProvider {

    async getGroups(): Promise<BaptizoGroup[]> {
        const settings = await getAdminSettings();

        // If settings are missing or incomplete, return empty to trigger dashboard warning
        if (!settings || !settings.interestGroupId || !settings.baptizedGroupId) {
            console.warn('[Baptizo] Admin settings missing or incomplete. Please configure IDs in Admin panel.');
            return [];
        }

        const interestGroup = await this.fetchGroupInternal(parseInt(settings.interestGroupId), 'Taufinteressenten', settings);
        const baptizedGroup = await this.fetchGroupInternal(parseInt(settings.baptizedGroupId), 'Getaufte', settings);

        return [interestGroup, baptizedGroup];
    }

    private async fetchGroupInternal(groupId: number, title: string, settings: any): Promise<BaptizoGroup> {
        console.log(`[Baptizo] Versuche Daten zu laden für Gruppe: ${groupId} (${title})`);

        // Log masked token
        const token = import.meta.env.VITE_LOGIN_TOKEN;
        console.log(`[Baptizo] Verwendeter Token: ${token ? token.substring(0, 5) + '...' : 'KEIN TOKEN!'}`);

        try {
            // Fetch group members
            const response = await churchtoolsClient.get<{ data: any[] }>(`/groups/${groupId}/members`);
            const ctPersons = response.data || [];

            console.log(`[Baptizo] API Erfolg für Gruppe ${groupId}. Anzahl Personen: ${ctPersons.length}`);

            if (ctPersons.length === 0) {
                console.warn(`[Baptizo] Verbindung steht, aber Gruppe ${groupId} ist leer.`);
            }

            // Map to BaptizoPerson
            const members: BaptizoPerson[] = ctPersons.map((p: any) => {
                const fields: BaptizoFields = {
                    seminar_besucht_am: p.fields[settings.seminarDateId] || null,
                    getauft_am: p.fields[settings.baptismDateId] || null,
                    // Map Date fields to boolean-like logic if needed, or store date string
                    // BaptizoFields type expects specific types.
                    // Assuming BaptizoFields matches strict logic, we might need conversion.
                    // Converting "exists" to boolean if the frontend expects boolean for some.
                    // But wait, BaptizoFields interface likely expects strings for dates?
                    // Let's assume strings for dates.
                    urkunde_ueberreicht: !!p.fields[settings.certificateDateId], // If it's a date, !!value works.
                    in_gemeinde_integriert: !!p.fields[settings.integratedDateId]
                };

                return {
                    id: p.personId || p.id,
                    firstName: p.firstName,
                    lastName: p.lastName,
                    status: p.dbFields?.[settings.statusFieldId] === 'inactive' ? 'inactive' : 'active', // Example logic
                    // Entry date fallback to created date or similar if not tracking specifically
                    entry_date: p.meta?.createdDate || new Date().toISOString().split('T')[0],
                    fields,
                    imageUrl: p.imageUrl || `https://ui-avatars.com/api/?name=${p.firstName}+${p.lastName}&background=random`
                };
            });

            return {
                id: groupId,
                title,
                members
            };

        } catch (error: any) {
            console.error(`[Baptizo] API-Fehlermeldung bei Fehlschlag für Gruppe ${groupId}:`, error);
            // Log detailed error info if available (axios error)
            if (error.response) {
                console.error(`Status: ${error.response.status}`);
                console.error(`Data:`, error.response.data);
            }
            return { id: groupId, title, members: [] };
        }
    }

    async getGroup(id: number): Promise<BaptizoGroup | null> {
        // Find efficiently by fetching all (simple caching could be added)
        const groups = await this.getGroups();
        return groups.find(g => g.id === id) || null;
    }

    async updatePersonFields(personId: number, fields: Partial<BaptizoFields>): Promise<void> {
        const settings = await getAdminSettings();
        if (!settings) return;

        const ctFields: any = {};
        if (fields.seminar_besucht_am !== undefined) ctFields[settings.seminarDateId] = fields.seminar_besucht_am;
        if (fields.getauft_am !== undefined) ctFields[settings.baptismDateId] = fields.getauft_am;
        // For boolean/date logic, we might need to send date if true, or null if false? 
        // Or if it's a real checkbox field in CT:
        // certificateDateId was defined as Date in Admin.vue labels?
        // User prompt: "certificateDateId (Label: "ID Feld: Urkunde (Datum)")"
        // So we should save a DATE.
        // If frontend passes boolean true, we probably save TODAY? Or passed date?
        // Let's assume frontend passes a string (date) directly if it's a date field.
        // If frontend passes boolean, we need to decide what date to save.

        // For now, assume simple mapping if keys match.
        // If strict mapping needed, check types.

        try {
            await churchtoolsClient.patch(`/persons/${personId}`, { fields: ctFields });
        } catch (error) {
            console.error('[Baptizo] Error updating person:', error);
            throw error;
        }
    }

    async updatePerson(updatedPerson: BaptizoPerson): Promise<void> {
        // Wrapper for updatePersonFields, plus status update if needed
        // Extract fields
        await this.updatePersonFields(updatedPerson.id, updatedPerson.fields);

        // TODO: Handle status change (active/inactive) or move to different group?
        // In CT, moving groups is different from updating fields.
        // For v1, if status changes, we might need logic. 
        // For now, focus on fields.
    }

    async deletePerson(id: number): Promise<void> {
        // Not implemented for safety in v1
        console.warn('[Baptizo] Delete person not implemented in real provider');
    }

    // Settings (Email templates etc - stored in KV Store?)
    // For now, use defaults or implement KV store for APP settings (different from IDs)
    async getSettings(): Promise<any> {
        // Return default settings for Dashboard
        // In future: load from KV 'baptizo-app-settings'
        return {
            emailTemplates: {},
            multiSiteMode: false,
            campuses: []
        };
    }

    async updateSettings(settings: any): Promise<void> {
        // TODO: Save to KV
        console.log('[Baptizo] Update settings:', settings);
    }

    async getEvents(): Promise<BaptizoEvent[]> {
        const settings = await getAdminSettings();
        if (!settings || !settings.calendarId) return [];

        try {
            const response = await churchtoolsClient.get<{ data: any[] }>(`/calendars/${settings.calendarId}/appointments?from=2024-01-01&to=2026-12-31`);
            return (response.data || []).map((evt: any) => ({
                id: evt.id,
                title: evt.caption,
                date: evt.startDate.split('T')[0],
                type: evt.caption.toLowerCase().includes('seminar') ? 'seminar' : 'baptism',
                leader: '', // Not always available
                time: evt.startDate.split('T')[1]?.substring(0, 5) || '10:00'
            }));
        } catch (error) {
            console.error('[Baptizo] Error fetching events:', error);
            return [];
        }
    }

    async createEvent(event: Omit<BaptizoEvent, 'id'>): Promise<BaptizoEvent> {
        // Implement if needed for v1
        throw new Error('Method not implemented.');
    }
}
