import type { DataProvider } from './data-provider.interface';
import type { BaptizoGroup, BaptizoFields, BaptizoEvent, BaptizoPerson } from '../types/baptizo-types';
import { DEFAULT_SETTINGS } from '../types/baptizo-settings';
import type { BaptizoSettings } from '../types/baptizo-settings';

export class MockDataProvider implements DataProvider {
    private groups: BaptizoGroup[] = [
        {
            id: 100,
            title: 'Taufinteressenten',
            members: [],
        },
        {
            id: 101,
            title: 'Getaufte',
            members: [],
        },
    ];

    constructor() {
        this.generateRandomData();
    }

    async updatePerson(updatedPerson: BaptizoPerson): Promise<void> {
        // Find person in groups and update
        for (const group of this.groups) {
            const index = group.members.findIndex(p => p.id === updatedPerson.id);
            if (index !== -1) {
                group.members[index] = updatedPerson;

                // Check if we need to move from Interested (100) to Baptized (101)
                if (group.id === 100 && updatedPerson.fields.getauft_am) {
                    // Remove from 100
                    group.members.splice(index, 1);
                    // Add to 101
                    const baptizedGroup = this.groups.find(g => g.id === 101);
                    if (baptizedGroup) baptizedGroup.members.push(updatedPerson);
                }
                return;
            }
        }
    }

    async deletePerson(id: number): Promise<void> {
        for (const group of this.groups) {
            const index = group.members.findIndex(p => p.id === id);
            if (index !== -1) {
                group.members.splice(index, 1);
                console.log(`[MockDB] Deleted Person ${id}`);
                return;
            }
        }
    }

    private generateRandomData() {
        const firstNames = ['Anna', 'Ben', 'Chris', 'Dora', 'Emil', 'Felix', 'Greta', 'Hannes', 'Ina', 'Jan', 'Klara', 'Leo', 'Mia', 'Noah', 'Paula', 'Paul', 'Sarah', 'Tim', 'Ulla', 'Vera', 'Lukas', 'Marie', 'Sophie', 'Elias', 'Leon', 'Finn', 'Lena', 'Emily', 'Luca', 'Max'];
        const lastNames = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hofmann', 'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz'];

        // Helper to get random date in a specific year, weighted towards second half
        const getRandomDateInYear = (year: number) => {
            const isSecondHalf = Math.random() > 0.3; // 70% chance for second half
            const month = isSecondHalf ? Math.floor(Math.random() * 6) + 6 : Math.floor(Math.random() * 6);
            const day = Math.floor(Math.random() * 28) + 1;
            const date = new Date(year, month, day);
            // Ensure we don't generate future dates if year is current year (assuming 2025 is current)
            const now = new Date();
            if (year === now.getFullYear() && date > now) {
                return now.toISOString().split('T')[0];
            }
            return date.toISOString().split('T')[0];
        };

        // Distribution Config
        const years = [
            { year: 2023, interested: 8, seminar: 5, baptized: 5 },
            { year: 2024, interested: 14, seminar: 12, baptized: 10 },
            { year: 2025, interested: 25, seminar: 20, baptized: 19 }
        ];

        let idCounter = 1000;

        years.forEach(config => {
            for (let i = 0; i < config.interested; i++) {
                const id = idCounter++;
                const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                const entryDate = getRandomDateInYear(config.year);

                // Determine status based on counts
                // We need to ensure we exactly hit the target counts for seminar and baptized
                // Logic: The first N people get seminar, the first M people get baptized
                const getsSeminar = i < config.seminar;
                const getsBaptized = i < config.baptized;

                // Dates must be sequential: Entry -> Seminar -> Baptism
                let seminarDate = null;
                let baptismDate = null;

                if (getsSeminar) {
                    const d = new Date(entryDate);
                    d.setDate(d.getDate() + Math.floor(Math.random() * 30) + 14); // 2-6 weeks later
                    seminarDate = d.toISOString().split('T')[0];
                }

                if (getsBaptized) {
                    const d = new Date(seminarDate!); // Seminar date is guaranteed if getsBaptized is true
                    d.setDate(d.getDate() + Math.floor(Math.random() * 60) + 14); // 2-10 weeks later
                    baptismDate = d.toISOString().split('T')[0];
                }

                const person: BaptizoPerson = {
                    id,
                    firstName,
                    lastName,
                    status: 'active',
                    entry_date: entryDate,
                    fields: {
                        seminar_besucht_am: seminarDate,
                        getauft_am: baptismDate,
                        urkunde_ueberreicht: getsBaptized ? Math.random() > 0.1 : false, // 90% have certificate
                        in_gemeinde_integriert: getsBaptized ? Math.random() > 0.2 : false, // 80% integrated
                    },
                    imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
                };

                // Add to correct group
                if (getsBaptized) {
                    this.groups[1].members.push(person);
                } else {
                    this.groups[0].members.push(person);
                }
            }
        });
    }

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

    // Settings
    private settings: BaptizoSettings = { ...DEFAULT_SETTINGS };

    async getSettings(): Promise<BaptizoSettings> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { ...this.settings };
    }

    async updateSettings(settings: Partial<BaptizoSettings>): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        this.settings = { ...this.settings, ...settings };
        console.log('[MockDB] Updated Settings:', this.settings);
    }
}
