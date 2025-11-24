export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    daysOffset: number; // e.g. -3 for 3 days before, 5 for 5 days after
}

export interface Campus {
    id: string;
    name: string;
}

export interface CustomFieldLabel {
    key: string; // e.g. 'seminar_besucht_am'
    label: string; // e.g. 'Seminar besucht'
}

export interface BaptizoSettings {
    multiSiteMode: boolean;
    campuses: Campus[];
    registrationFormUrl: string;
    emailTemplates: EmailTemplate[];
    customFieldLabels: CustomFieldLabel[];
}

export const DEFAULT_SETTINGS: BaptizoSettings = {
    multiSiteMode: false,
    campuses: [],
    registrationFormUrl: '',
    emailTemplates: [
        {
            id: 'seminar_invite',
            name: 'Seminar-Einladung',
            subject: 'Einladung zu deinem Taufseminar 🌊',
            body: 'Hallo {name}, wir freuen uns riesig, dass du dich für das Thema Taufe interessierst! In 3 Tagen startet unser Taufseminar. Komm vorbei und entdecke, was dieser Schritt für dein Leben bedeuten kann.',
            daysOffset: -3
        },
        {
            id: 'baptism_info',
            name: 'Tauf-Info',
            subject: 'Bald ist dein großer Tag! Infos zur Taufe',
            body: 'Hallo {name}, bald ist es soweit! Hier sind die letzten Infos für deine Taufe: Bitte bringe dunkle Badekleidung und ein Handtuch mit. Wir treffen uns um {uhrzeit} am {ort}. Wir freuen uns auf dich!',
            daysOffset: -5
        },
        {
            id: 'congrats',
            name: 'Glückwunsch',
            subject: 'Willkommen in der Familie! 🎉',
            body: 'Herzlichen Glückwunsch zu deiner Taufe, {name}! Es war ein gewaltiger Moment. Wir wollen dich ermutigen, jetzt dranzubleiben.',
            daysOffset: 5
        },
        {
            id: 'follow_up',
            name: 'Follow-Up',
            subject: 'Wie geht es dir nach der Taufe?',
            body: 'Hallo {name}, deine Taufe ist nun einen Monat her. Wir wollten hören, wie es dir geht? Hast du schon eine Kleingruppe gefunden? Hier findest du Anschluss: {link_kleingruppen}',
            daysOffset: 30
        },
        {
            id: 'leader_reminder',
            name: 'Leader-Reminder',
            subject: 'Reminder: Bitte Taufmanager pflegen',
            body: 'Hallo {leader}, das Event ist vorbei. Bitte logge dich jetzt in den Baptizo Taufmanager ein und hake ab, wer anwesend war bzw. getauft wurde.',
            daysOffset: 1
        }
    ],
    customFieldLabels: [
        { key: 'seminar_besucht_am', label: 'Seminar besucht' },
        { key: 'getauft_am', label: 'Getauft am' },
        { key: 'urkunde_ueberreicht', label: 'Urkunde überreicht' },
        { key: 'in_gemeinde_integriert', label: 'Integriert' }
    ]
};
