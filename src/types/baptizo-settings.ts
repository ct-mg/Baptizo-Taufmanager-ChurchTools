export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    daysOffset: number; // e.g. 3 for 3 days
    offsetType: 'before' | 'after'; // before or after event
    category: 'seminar' | 'baptism'; // seminar or baptism email
    recipientType: 'participant' | 'leader'; // who receives the email
}

export interface Campus {
    id: string;
    name: string;
}

export interface CustomFieldLabel {
    key: string; // e.g. 'seminar_besucht_am'
    label: string; // e.g. 'Seminar besucht'
}

export interface Placeholder {
    id: string;
    label: string;
    value: string;
    key: string; // e.g. '{{link_anmeldung}}'
    type: 'link' | 'text';
}

export interface BaptizoSettings {
    multiSiteMode: boolean;
    campuses: Campus[];
    emailSendingEnabled: boolean; // Toggle for mail sending
    // Retired specific fields in favor of generic placeholders array
    placeholders: Placeholder[];
    emailTemplates: EmailTemplate[];
    customFieldLabels: CustomFieldLabel[];
}

export const DEFAULT_SETTINGS: BaptizoSettings = {
    multiSiteMode: false,
    campuses: [],
    emailSendingEnabled: false,
    placeholders: [
        // Links
        { id: 'p_reg', label: 'Anmeldeformular', value: '', key: '{{link_anmeldung}}', type: 'link' },
        { id: 'p_groups', label: 'Kleingruppen', value: '', key: '{{link_kleingruppen}}', type: 'link' },
        { id: 'p_info', label: 'Taufinfo & FAQ', value: '', key: '{{link_taufinfo}}', type: 'link' },
        // Text/Dates
        { id: 'p_date_baptism', label: 'Datum der nächsten Taufe', value: '', key: '{{datum_taufe}}', type: 'text' },
        { id: 'p_date_seminar', label: 'Datum des nächsten Taufseminars', value: '', key: '{{datum_seminar}}', type: 'text' },
        { id: 'p_custom', label: 'Custom', value: '', key: '{{custom}}', type: 'text' }
    ],
    emailTemplates: [
        {
            id: 'seminar_invite',
            name: 'Seminar-Einladung',
            subject: 'Einladung zu deinem Taufseminar 🌊',
            body: 'Hallo {{person.firstName}}, wir freuen uns riesig, dass du dich für das Thema Taufe interessierst! In 3 Tagen startet unser Taufseminar am {{datum_seminar}}. Komm vorbei und entdecke, was dieser Schritt für dein Leben bedeuten kann. Infos: {{link_taufinfo}}',
            daysOffset: 3,
            offsetType: 'before' as const,
            category: 'seminar' as const,
            recipientType: 'participant' as const
        },
        {
            id: 'seminar_reminder',
            name: 'Seminar-Reminder',
            subject: 'Morgen: Dein Taufseminar! 📅',
            body: 'Hey {{person.firstName}}, morgen ist es soweit! Wir treffen uns um 10:00 Uhr im Gemeindezentrum. Bring gerne Fragen mit!',
            daysOffset: 1,
            offsetType: 'before' as const,
            category: 'seminar' as const,
            recipientType: 'participant' as const
        },
        {
            id: 'baptism_info',
            name: 'Tauf-Info',
            subject: 'Bald ist dein großer Tag! Infos zur Taufe',
            body: 'Hallo {{person.firstName}}, bald ist es soweit! Die nächste Taufe ist am {{datum_taufe}}. Hier sind die letzten Infos: Bitte bringe dunkle Badekleidung und ein Handtuch mit. Wir treffen uns um 09:30 Uhr im Gemeindezentrum. Wir freuen uns auf dich!',
            daysOffset: 5,
            offsetType: 'before' as const,
            category: 'baptism' as const,
            recipientType: 'participant' as const
        },
        {
            id: 'congrats',
            name: 'Glückwunsch',
            subject: 'Willkommen in der Familie! 🎉',
            body: 'Herzlichen Glückwunsch zu deiner Taufe, {{person.firstName}}! Es war ein gewaltiger Moment. Wir wollen dich ermutigen, jetzt dranzubleiben.',
            daysOffset: 1,
            offsetType: 'after' as const,
            category: 'baptism' as const,
            recipientType: 'participant' as const
        },
        {
            id: 'follow_up',
            name: 'Follow-Up',
            subject: 'Wie geht es dir nach der Taufe?',
            body: 'Hallo {{person.firstName}}, deine Taufe ist nun einen Monat her. Wir wollten hören, wie es dir geht? Hast du schon eine Kleingruppe gefunden? Hier findest du Anschluss: {{link_kleingruppen}}',
            daysOffset: 30,
            offsetType: 'after' as const,
            category: 'baptism' as const,
            recipientType: 'participant' as const
        },
        {
            id: 'leader_reminder_seminar',
            name: 'Leader-Reminder Seminar',
            subject: 'Reminder: Bitte Taufmanager pflegen (Seminar)',
            body: 'Hallo {{person.firstName}}, das Seminar ist vorbei. Bitte logge dich jetzt in den Baptizo Taufmanager ein und hake ab, wer anwesend war.',
            daysOffset: 1,
            offsetType: 'after' as const,
            category: 'seminar' as const,
            recipientType: 'leader' as const
        },
        {
            id: 'leader_reminder_baptism',
            name: 'Leader-Reminder Taufe',
            subject: 'Reminder: Bitte Taufmanager pflegen (Taufe)',
            body: 'Hallo {{person.firstName}}, die Taufe ist vorbei. Bitte logge dich jetzt in den Baptizo Taufmanager ein und hake ab, wer getauft wurde.',
            daysOffset: 1,
            offsetType: 'after' as const,
            category: 'baptism' as const,
            recipientType: 'leader' as const
        }
    ],
    customFieldLabels: [
        { key: 'seminar_besucht_am', label: 'Seminar besucht' },
        { key: 'getauft_am', label: 'Getauft am' },
        { key: 'urkunde_ueberreicht', label: 'Urkunde überreicht' },
        { key: 'in_gemeinde_integriert', label: 'Integriert' }
    ]
};
