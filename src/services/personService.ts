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
        if (!token) {
            console.error('[Baptizo] Umgebungsvariable VITE_LOGIN_TOKEN fehlt. Bitte Server neu starten.');
        } else {
            console.log(`[Baptizo] Verwendeter Token: ${token.substring(0, 5)}...`);
        }

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
        console.warn(`[Baptizo] Delete person ${id} not implemented in real provider`);
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
        console.warn('createEvent not implemented', event);
        throw new Error('Method not implemented.');
    }

    async runGlobalDiscoveryAndSync(): Promise<{ addedToInterest: number; addedToBaptized: number; removedFromInterest: number }> {
        const settings = await getAdminSettings();
        if (!settings) return { addedToInterest: 0, addedToBaptized: 0, removedFromInterest: 0 };

        console.log('[Baptizo] Starting Global Discovery & Sync...');

        let stats = { addedToInterest: 0, addedToBaptized: 0, removedFromInterest: 0 };

        try {
            // 1. Fetch current members of target groups for efficient lookup
            const interestGroup = await this.fetchGroupInternal(parseInt(settings.interestGroupId), 'Interest', settings);
            const baptizedGroup = await this.fetchGroupInternal(parseInt(settings.baptizedGroupId), 'Baptized', settings);

            const interestMemberIds = new Set(interestGroup.members.map(m => m.id));
            const baptizedMemberIds = new Set(baptizedGroup.members.map(m => m.id));

            // 2. Iterate ALL persons (Pagination)
            let page = 1;
            const limit = 500;
            let hasMore = true;

            while (hasMore) {
                // IMPORTANT: Use /persons endpoint (v2) which seems to work relative to baseURL
                // ADDED: status_ids to filter for active+inactive+archive to find everyone
                // IDs: 1 (active), 2 (archive), 3 (inactive) - standardized in CT usually
                // Safe approach: status_ids[]=active&status_ids[]=inactive

                // DEBUG: Inspect Base URL to prevent double slashes
                // @ts-ignore
                const baseUrl = churchtoolsClient.ax?.defaults?.baseURL || 'UNKNOWN';

                // Construct path carefully. User requested /api/persons check.
                // Note: churchtoolsClient adds /api prefix automatically!
                // Simplified: remove status_ids to test basic endpoint first
                const endpoint = '/persons';
                const query = `limit=${limit}&page=${page}`;
                const url = `${endpoint}?${query}`;

                console.log(`[Baptizo] DEBUG URL Config: Base: '${baseUrl}', Request: '${url}'`);

                const response = await churchtoolsClient.get<{ data: any[], meta: any }>(url);

                // DEBUG: Log raw response structure
                console.log('[Baptizo] RAW Response (first 500 chars):', JSON.stringify(response).substring(0, 500));

                const persons = response.data || [];

                console.log(`[Baptizo] Page ${page}: Received ${persons.length} persons.`);
                // DEBUG: Log Meta to see total count
                if (response.meta) {
                    console.log('[Baptizo] API Meta:', response.meta);
                }

                if (persons.length === 0) {
                    hasMore = false;
                    break;
                }

                for (const [index, p] of persons.entries()) {
                    const pid = p.id;
                    const fields = p.fields || {};

                    // DEBUG: Log first person's fields to check key structure
                    if (page === 1 && index === 0) {
                        console.log('[Baptizo] DEBUG CHECK - Settings IDs:', {
                            seminar: settings.seminarDateId,
                            baptism: settings.baptismDateId,
                            certificate: settings.certificateDateId,
                            integration: settings.integratedDateId,
                            status: settings.statusFieldId
                        });
                        console.log('[Baptizo] DEBUG CHECK - First Person Fields (Keys):', Object.keys(fields));
                        console.log('[Baptizo] DEBUG CHECK - First Person Fields (Full):', fields);
                    }

                    // Check Fields
                    const hasSeminar = !!fields[settings.seminarDateId];
                    const hasBaptism = !!fields[settings.baptismDateId]; // Field 187 => TAUFE
                    const hasCertificate = !!fields[settings.certificateDateId];
                    const hasIntegration = !!fields[settings.integratedDateId];
                    const hasStatus = !!fields[settings.statusFieldId]; // Field 196

                    // LOGIC:

                    // Case A: Has Baptism Date (187) -> MUST be in Group 16 (Baptized)
                    if (hasBaptism) {
                        // Ensure in Group 16
                        if (!baptizedMemberIds.has(pid)) {
                            console.log(`[Baptizo] [SYNC] Found Baptized (ID ${pid}): adding to Group ${settings.baptizedGroupId}`);
                            try {
                                await churchtoolsClient.put(`/groups/${settings.baptizedGroupId}/members/${pid}`, {});
                                stats.addedToBaptized++;
                                baptizedMemberIds.add(pid);
                            } catch (e) {
                                console.error(`[Baptizo] Failed to add ${pid} to Baptized group`, e);
                            }
                        }

                        // Ensure NOT in Group 13
                        if (interestMemberIds.has(pid)) {
                            console.log(`[Baptizo] [SYNC] Removing ${p.firstName} ${p.lastName} from Interest Group (${settings.interestGroupId}) because they are baptized.`);
                            try {
                                await churchtoolsClient.deleteApi(`/groups/${settings.interestGroupId}/members/${pid}`);
                                stats.removedFromInterest++;
                                interestMemberIds.delete(pid);
                            } catch (e) {
                                console.error(`[Baptizo] Failed to remove ${pid} from Interest group`, e);
                            }
                        }
                    }
                    // Case B: NO Baptism Date, but Has Other Milestones -> MUST be in Group 13 (Interest)
                    else if (hasSeminar || hasCertificate || hasIntegration || hasStatus) {
                        const ininterest = interestMemberIds.has(pid);
                        const inbaptized = baptizedMemberIds.has(pid);

                        if (!ininterest && !inbaptized) {
                            console.log(`[Baptizo] [SYNC] Found Lost candidate: ${p.firstName} ${p.lastName}. Adding to Interest Group (${settings.interestGroupId})`);
                            try {
                                await churchtoolsClient.put(`/groups/${settings.interestGroupId}/members/${pid}`, {});
                                stats.addedToInterest++;
                                interestMemberIds.add(pid);
                            } catch (e) {
                                console.error(`[Baptizo] Failed to add ${pid} to Interest group`, e);
                            }
                        }
                    }
                }

                // Check pagination meta
                if (response.meta && response.meta.pagination) {
                    if (page >= response.meta.pagination.lastPage) {
                        hasMore = false;
                    }
                } else {
                    // Fallback if meta missing
                    if (persons.length < limit) hasMore = false;
                }
                page++;
            }

        } catch (error) {
            console.error('[Baptizo] Auto-Sync Failed:', error);
        }

        console.log('[Baptizo] Auto-Sync Complete. Stats:', stats);
        return stats;
    }
}
