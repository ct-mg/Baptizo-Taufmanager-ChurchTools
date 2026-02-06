import { type BaptizoSettings, type EmailTemplate } from '../types/baptizo-settings';
import { type BaptizoEvent } from '../types/baptizo-types';

/* 
 * Mock Service Interface - strictly following the rule:
 * "E-Mails werden nur versendet an Mitglieder mit dem Status aktiv."
 */

export class EmailService {

    /**
     * Checks for due emails and sends them if conditions are met.
     * @param settings Current App Settings
     * @param events List of all events
     */
    public async checkAndSendEmails(settings: BaptizoSettings, events: BaptizoEvent[]): Promise<string[]> {
        const logs: string[] = [];

        if (!settings.emailSendingEnabled) {
            logs.push("Mailversand ist deaktiviert.");
            return logs;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        logs.push(`Prüfe E-Mail-Versand für ${today.toLocaleDateString()}...`);

        // Iterate over all templates
        for (const template of settings.emailTemplates || []) {
            if (!template.subject || !template.body) continue;

            const relevantEvents = this.getRelevantEventsForTemplate(template, events);

            for (const event of relevantEvents) {
                const triggerDate = this.calculateTriggerDate(event.date, template.daysOffset, template.offsetType);

                // Compare dates (assuming daily check)
                if (this.isSameDay(triggerDate, today)) {
                    logs.push(`Template '${template.name}' ist fällig für Event '${event.title}' (${event.date}).`);

                    // Note: Mock events currently don't have participants attached directly in type structure 
                    // presented in BaptizoEvent, needing a workaround or assuming existing data structure.
                    // Assuming for now event has participants attached at runtime or fetched separately.
                    // For mock purposes, we'll cast to any to access dynamic props.
                    const evt: any = event;

                    const recipients = this.getRecipients(evt, template.recipientType);

                    if (recipients.length === 0) {
                        logs.push("  -> Keine Empfänger gefunden.");
                        continue;
                    }

                    for (const person of recipients) {
                        // CRITICAL CHECK: Status 'active'
                        // Matches strict requirement
                        const isActive = this.isPersonActive(person);

                        if (isActive) {
                            await this.sendMail(person, template, evt);
                            logs.push(`  -> E-MAIL VERSENDET: ${person.firstName} ${person.lastName} (${person.email})`);
                        } else {
                            logs.push(`  -> ÜBERSPRUNGEN: ${person.firstName} ${person.lastName} (Status nicht 'active')`);
                        }
                    }
                }
            }
        }

        return logs;
    }

    private getRelevantEventsForTemplate(template: EmailTemplate, events: BaptizoEvent[]): BaptizoEvent[] {
        return events.filter(e => {
            const title = (e.title || '').toLowerCase();
            if (template.category === 'seminar') return title.includes('seminar');
            if (template.category === 'baptism') return title.includes('taufe') && !title.includes('seminar');
            return false;
        });
    }

    private calculateTriggerDate(eventDateStr: string, offset: number, type: 'before' | 'after'): Date {
        const date = new Date(eventDateStr);
        if (type === 'before') {
            date.setDate(date.getDate() - offset);
        } else {
            date.setDate(date.getDate() + offset);
        }
        date.setHours(0, 0, 0, 0);
        return date;
    }

    private isSameDay(d1: Date, d2: Date): boolean {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    private getRecipients(event: any, type: 'leader' | 'participant'): any[] {
        if (type === 'leader') {
            return event.leader ? [event.leader] : [];
        } else {
            return event.participants || [];
        }
    }

    private isPersonActive(person: any): boolean {
        // Implementation of strict status check
        // Check for various common status fields in mock data
        const status = person.status || person.memberStatus;
        return status === 'active' || status === 'Aktiv' || status === 'Active';
    }

    private async sendMail(recipient: any, template: EmailTemplate, event: any): Promise<void> {
        // MOCKED SENDING
        // Ideally this hits CT API: /api/mail/send

        let body = template.body;
        if (recipient.firstName) body = body.replace(/{{person.firstName}}/g, recipient.firstName);
        if (recipient.lastName) body = body.replace(/{{person.lastName}}/g, recipient.lastName);
        if (event.date) body = body.replace(/{{event.date}}/g, event.date);

        console.log(`[EmailService] MOCK SENDING to ${recipient.email}`, {
            subject: template.subject,
            body: body
        });

        return new Promise(resolve => setTimeout(resolve, 100));
    }
}
