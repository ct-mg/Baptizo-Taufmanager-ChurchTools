import type { DataProvider } from './data-provider.interface.ts';
import type { BaptizoGroup, BaptizoFields, BaptizoEvent } from '../types/baptizo-types.ts';

export class MockDataProvider implements DataProvider {
    private groups: BaptizoGroup[] = [
        {
            id: 100,
            title: 'Taufinteressenten',
            members: [
                {
                    id: 1,
                    firstName: 'Anna',
                    lastName: 'Anfänger',
                    status: 'active',
                    fields: {
                        seminar_besucht_am: null,
                    },
                    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
                },
                {
                    id: 2,
                    firstName: 'Ben',
                    lastName: 'Bereit',
                    status: 'active',
                    fields: {
                        seminar_besucht_am: '2023-10-15',
                    },
                    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ben',
                },
                {
                    id: 3,
                    firstName: 'Chris',
                    lastName: 'Chillig',
                    status: 'inactive',
                    fields: {
                        seminar_besucht_am: null,
                    },
                    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
                },
            ],
        },
        {
            id: 101,
            title: 'Getaufte',
            members: [
                {
                    id: 4,
                    firstName: 'Dora',
                    lastName: 'Durch',
                    status: 'active',
                    fields: {
                        seminar_besucht_am: '2023-09-01',
                        getauft_am: '2023-11-01',
                        urkunde_ueberreicht: false,
                        in_gemeinde_integriert: false,
                    },
                    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dora',
                },
                {
                    id: 5,
                    firstName: 'Emil',
                    lastName: 'Etabliert',
                    status: 'active',
                    fields: {
                        seminar_besucht_am: '2023-01-10',
                        getauft_am: '2023-02-20',
                        urkunde_ueberreicht: true,
                        in_gemeinde_integriert: true,
                    },
                    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emil',
                },
            ],
        },
    ];

    private events: BaptizoEvent[] = [
        {
            id: 1,
            title: 'Taufseminar März',
            date: '2025-03-15',
            type: 'seminar',
            leader: 'Pastor Peter',
        },
        {
            id: 2,
            title: 'Oster-Taufe',
            date: '2025-04-20',
            type: 'baptism',
            leader: 'Pastor Paul',
        },
    ];

    async getGroups(): Promise<BaptizoGroup[]> {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return [...this.groups];
    }

    async getGroup(id: number): Promise<BaptizoGroup | null> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const group = this.groups.find((g) => g.id === id);
        return group || null;
    }

    async updatePersonFields(personId: number, fields: Partial<BaptizoFields>): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 300));

        for (const group of this.groups) {
            const person = group.members.find((p) => p.id === personId);
            if (person) {
                person.fields = { ...person.fields, ...fields };
                console.log(`[MockDB] Updated Person ${personId}:`, person.fields);
                return;
            }
        }

        console.warn(`[MockDB] Person ${personId} not found.`);
        console.warn(`[MockDB] Person ${personId} not found.`);
    }

    async getEvents(): Promise<BaptizoEvent[]> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return [...this.events];
    }

    async createEvent(event: Omit<BaptizoEvent, 'id'>): Promise<BaptizoEvent> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const newEvent = { ...event, id: Math.max(0, ...this.events.map(e => e.id)) + 1 };
        this.events.push(newEvent);
        return newEvent;
    }
}
