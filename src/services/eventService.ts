import { churchtoolsClient } from '@churchtools/churchtools-client';
import type { BaptizoEvent } from '../types/baptizo-types';

export class EventService {
    private calendarId: number | null = null;
    private calendarName = 'Taufmanager';

    /**
     * Finds the 'Taufmanager' calendar ID by searching all calendars.
     * Returns cached ID if available.
     */
    private async getCalendarId(): Promise<number | null> {
        if (this.calendarId) return this.calendarId;

        try {
            console.log('[EventService] Searching for Calendar...');
            const response = await churchtoolsClient.get<any>('/calendars');
            const calendars = Array.isArray(response) ? response : (response.data || []);

            const target = calendars.find((c: any) =>
                c.name.trim().toLowerCase() === this.calendarName.toLowerCase() ||
                c.name.trim().toLowerCase().includes('taufmanager')
            );

            if (target) {
                console.log(`[EventService] Found Calendar: ${target.name} (ID: ${target.id})`);
                this.calendarId = target.id;
                return target.id;
            } else {
                console.warn(`[EventService] Calendar '${this.calendarName}' not found.`);
                return null;
            }
        } catch (e) {
            console.error('[EventService] Failed to fetch calendars', e);
            return null;
        }
    }

    /**
     * Fetches appointments from the connected calendar.
     * Maps them to BaptizoEvent format.
     */
    async getEvents(): Promise<BaptizoEvent[]> {
        const calId = await this.getCalendarId();
        if (!calId) {
            console.warn('[EventService] Aborting fetch: No Calendar ID.');
            return [];
        }

        try {
            // Fetch appointments (range: -1 year to +2 years to cover past/future)
            const from = new Date();
            from.setFullYear(from.getFullYear() - 1);
            const to = new Date();
            to.setFullYear(to.getFullYear() + 2);

            const fromStr = from.toISOString().split('T')[0];
            const toStr = to.toISOString().split('T')[0];

            console.log(`[EventService] Fetching events for Calendar ${calId} from ${fromStr} to ${toStr}`);

            const response = await churchtoolsClient.get<any>(`/calendars/${calId}/appointments`, {
                from: fromStr,
                to: toStr
            });

            const appointments = Array.isArray(response) ? response : (response.data || []);
            console.log(`[EventService] Received ${appointments.length} appointments.`);
            if (appointments.length > 0) console.log('First Appt:', appointments[0]);

            return appointments.map((appt: any) => this.mapToBaptizoEvent(appt));
        } catch (e) {
            console.error('[EventService] Failed to fetch events', e);
            return [];
        }
    }

    /**
     * Maps CT Appointment to BaptizoEvent.
     * Heuristic: 'Seminar' in title -> 'seminar', else 'baptism'.
     */
    private mapToBaptizoEvent(appt: any): BaptizoEvent {
        // Handle nested API structure (CT 3.x / New Calendar API)
        // Structure is usually { base: { caption, ... }, calculated: { startDate, ... } }
        const base = appt.base || appt;
        const calculated = appt.calculated || appt;

        const title = base.caption || base.title || 'Unbenanntes Event';
        const isSeminar = title.toLowerCase().includes('seminar');

        // Leader parsing from note
        let leader = undefined;
        if (base.note) {
            const match = base.note.match(/Leitung:\s*(.*)/i);
            if (match) leader = match[1].trim();
        }

        // Date extraction
        // calculated.startDate is ISO DateTime (e.g. 2025-02-05T10:00:00Z)
        const fullDate = calculated.startDate || base.startDate;
        const datePart = fullDate ? fullDate.split('T')[0] : '';

        // Time extraction
        let timePart = undefined;
        if (fullDate && fullDate.includes('T')) {
            timePart = fullDate.split('T')[1].substring(0, 5); // HH:MM
        } else if (base.startTime) {
            timePart = base.startTime.substring(0, 5);
        }

        // Generate Unique ID for Frontend (Composite of ID + Date)
        // CT Series IDs are identical for all instances.
        const id = (appt.id || base.id || 0);
        const uniqueId = `${id}_${datePart}`; // e.g. "31_2025-05-31"

        return {
            id: uniqueId,
            title: title,
            date: datePart,
            time: timePart,
            type: isSeminar ? 'seminar' : 'baptism',
            leader: leader
        };
    }

    async createEvent(event: Omit<BaptizoEvent, 'id'>): Promise<void> {
        const calId = await this.getCalendarId();
        if (!calId) throw new Error('Kalender nicht gefunden');

        // Construct ISO DateTime strings
        const dateStr = event.date; // YYYY-MM-DD
        const timeStr = event.time || '10:00';
        const startTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr; // Ensure HH:MM:SS

        // Calculate End Time (Start + 2h)
        const startDateTime = new Date(`${dateStr}T${startTime}`);
        const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // +2 hours

        const payload = {
            caption: event.title,
            note: `Leitung: ${event.leader || ''}`,
            startDate: startDateTime.toISOString(),
            endDate: endDateTime.toISOString(),
            address: '' // Optional
        };

        console.log('[EventService] Creating event:', payload);
        await churchtoolsClient.post(`/calendars/${calId}/appointments`, payload);
        console.log('[EventService] Event created.');
    }

    async updateEvent(id: string | number, event: Partial<BaptizoEvent>): Promise<void> {
        const calId = await this.getCalendarId();
        if (!calId) throw new Error('Kalender nicht gefunden');

        const realId = typeof id === 'string' ? parseInt(id.split('_')[0]) : id;

        // Simplified Payload Construction (Matching Create Logic)
        const payload: any = {
            isInternal: false // REQUIRED by API
        };

        if (event.title) payload.caption = event.title;
        if (event.leader !== undefined) payload.note = `Leitung: ${event.leader}`;

        if (event.date) {
            const timeStr = event.time || '10:00';
            const startTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
            const startDateTime = new Date(`${event.date}T${startTime}`);
            const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // +2h
            payload.startDate = startDateTime.toISOString();
            payload.endDate = endDateTime.toISOString();
        }

        console.log(`[EventService] Updating event ${realId}:`, payload);

        try {
            await churchtoolsClient.put(`/calendars/${calId}/appointments/${realId}`, payload);
            console.log('[EventService] Event updated.');
        } catch (e: any) {
            console.error('[EventService] Update failed.');
            if (e.response?.data) {
                console.error('SERVER RESPONSE:', JSON.stringify(e.response.data, null, 2));
                // Attempt to extract friendly message
                const msg = e.response.data.translatedMessage || e.response.data.message || 'Unknown Error';
                throw new Error(msg);
            }
            throw e;
        }
    }

    async deleteEvent(id: string | number): Promise<void> {
        const calId = await this.getCalendarId();
        if (!calId) throw new Error('Kalender nicht gefunden');

        const realId = typeof id === 'string' ? parseInt(id.split('_')[0]) : id;

        console.log(`[EventService] Deleting event ${realId}`);
        // churchtoolsClient.delete does not exist, use deleteApi
        await churchtoolsClient.deleteApi(`/calendars/${calId}/appointments/${realId}`);
        console.log('[EventService] Event deleted.');
    }
}
