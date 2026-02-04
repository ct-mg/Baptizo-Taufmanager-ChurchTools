export interface BaptizoFields {
    seminar_besucht_am?: string | null; // ISO Date YYYY-MM-DD
    getauft_am?: string | null; // ISO Date YYYY-MM-DD
    urkunde_ueberreicht?: string | null; // ISO Date YYYY-MM-DD (date when certificate was given)
    in_gemeinde_integriert?: string | null; // ISO Date YYYY-MM-DD (date when integrated)
    custom_flag?: string | boolean | null;
}

export type BaptizoStatus = 'active' | 'inactive' | 'removed';

export interface BaptizoPerson {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
    status: BaptizoStatus; // Status within the group (e.g. Leiter, Teilnehmer, etc. mapped to our logic)
    entry_date?: string; // ISO Date YYYY-MM-DD (When they entered the process/group)
    fields: BaptizoFields;
    imageUrl?: string;
}

export interface BaptizoGroup {
    id: number;
    title: string;
    members: BaptizoPerson[];
}

export interface BaptizoEvent {
    id: number;
    title: string;
    date: string; // ISO Date YYYY-MM-DD
    type: 'seminar' | 'baptism';
    leader?: string;
    time?: string;
}
