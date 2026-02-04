// Debug Script: Find the correct field name for onboarding in ChurchTools

import { churchtoolsClient } from '@churchtools/churchtools-client';

export async function findOnboardingFieldName(): Promise<void> {
    console.log('[DEBUG] ==========================================');
    console.log('[DEBUG] Searching for Taufmanager Onboarding field...');
    console.log('[DEBUG] ==========================================');

    try {
        // Fetch a person with data
        const person: any = await churchtoolsClient.get(`/persons/148`); // Nils Frost - we know has data

        console.log('[DEBUG] ALL FIELDS in person object:');
        console.log('[DEBUG] ==========================================');

        // Show ALL keys
        const allKeys = Object.keys(person);
        console.log('[DEBUG] Total fields:', allKeys.length);

        // Filter for taufmanager fields
        const taufmanagerFields = allKeys.filter(k => k.toLowerCase().includes('tauf'));
        console.log('[DEBUG] Fields containing "tauf":', taufmanagerFields);

        // Show values for taufmanager fields
        console.log('[DEBUG] ==========================================');
        console.log('[DEBUG] Taufmanager field values:');
        taufmanagerFields.forEach(field => {
            console.log(`[DEBUG]   ${field} = ${person[field]}`);
        });

        // Also check for "onboard" in field names
        const onboardFields = allKeys.filter(k => k.toLowerCase().includes('onboard'));
        console.log('[DEBUG] ==========================================');
        console.log('[DEBUG] Fields containing "onboard":', onboardFields);
        onboardFields.forEach(field => {
            console.log(`[DEBUG]   ${field} = ${person[field]}`);
        });

        // Check for "einstieg" or similar German terms
        const germanFields = allKeys.filter(k => k.toLowerCase().includes('einstieg') || k.toLowerCase().includes('start') || k.toLowerCase().includes('beginn'));
        console.log('[DEBUG] ==========================================');
        console.log('[DEBUG] Fields containing "einstieg/start/beginn":', germanFields);
        germanFields.forEach(field => {
            console.log(`[DEBUG]   ${field} = ${person[field]}`);
        });

        // Show ALL taufmanager fields we currently know about
        console.log('[DEBUG] ==========================================');
        console.log('[DEBUG] Known working fields:');
        console.log(`[DEBUG]   taufmanager_seminar = ${person.taufmanager_seminar}`);
        console.log(`[DEBUG]   taufmanager_taufe = ${person.taufmanager_taufe}`);
        console.log(`[DEBUG]   taufmanager_urkunde = ${person.taufmanager_urkunde}`);
        console.log(`[DEBUG]   taufmanager_integration = ${person.taufmanager_integration}`);
        console.log(`[DEBUG]   taufmanager_offboarding = ${person.taufmanager_offboarding}`);

        // Try different name variations
        console.log('[DEBUG] ==========================================');
        console.log('[DEBUG] Testing name variations:');
        const variations = [
            'taufmanager_onboarding',
            'taufmanager_onbording', // typo?
            'taufmanagerOnboarding',
            'taufmanager_einstieg',
            'taufmanager_start',
            'taufmanager_beginn',
            'onboarding',
            'einstieg'
        ];

        variations.forEach(name => {
            console.log(`[DEBUG]   ${name} = ${person[name]}`);
        });

        console.log('[DEBUG] ==========================================');

    } catch (error) {
        console.error('[DEBUG] Error:', error);
    }
}
