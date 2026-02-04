// Migration Script: Fix Onboarding Dates in ChurchTools
// Run this once to update all persons' onboarding dates to 2-20 days before seminar

import { churchtoolsClient } from '@churchtools/churchtools-client';
import { getAdminSettings } from '../lib/kv-store';

export async function migrateOnboardingDates(): Promise<{ updated: number; skipped: number; errors: number }> {
    console.log('[Migration] Starting onboarding date migration...');

    const adminCfg = await getAdminSettings();
    const interestGroupId = parseInt(adminCfg?.interestGroupId || '0');
    const baptizedGroupId = parseInt(adminCfg?.baptizedGroupId || '0');

    console.log('[Migration] Group IDs:', { interestGroupId, baptizedGroupId });

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Fetch all groups
    const groupIds = [interestGroupId, baptizedGroupId].filter(id => id > 0);

    if (groupIds.length === 0) {
        console.error('[Migration] No group IDs configured!');
        return { updated, skipped, errors };
    }

    for (const groupId of groupIds) {
        console.log(`[Migration] Processing group ${groupId}...`);

        // Fetch group members with pagination
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            try {
                // Use correct API endpoint - without params, just query string
                const response: any = await churchtoolsClient.get(`/groups/${groupId}/members?limit=500&page=${page}`);

                console.log(`[Migration] Group ${groupId} page ${page} response:`, response);

                const members = Array.isArray(response) ? response : (response.data || []);
                console.log(`[Migration] Found ${members.length} members on page ${page}`);

                if (members.length === 0) {
                    hasMore = false;
                    break;
                }

                // Process each member
                for (const member of members) {
                    try {
                        const personId = member.personId || member.id;
                        if (!personId) {
                            console.warn('[Migration] Member has no personId:', member);
                            skipped++;
                            continue;
                        }

                        // Fetch full person details
                        const personDetail: any = await churchtoolsClient.get(`/persons/${personId}`);

                        console.log(`[Migration] Person ${personId} details:`, {
                            seminar: personDetail.taufmanager_seminar,
                            onboarding: personDetail.taufmanager_onboarding
                        });

                        const seminarDate = personDetail.taufmanager_seminar;
                        const currentOnboarding = personDetail.taufmanager_onboarding;

                        // Skip if no seminar date
                        if (!seminarDate) {
                            console.log(`[Migration] Skipping person ${personId} - no seminar date`);
                            skipped++;
                            continue;
                        }

                        // Skip if onboarding already set and different from seminar
                        if (currentOnboarding && currentOnboarding !== seminarDate) {
                            console.log(`[Migration] Skipping person ${personId} - onboarding already customized (${currentOnboarding})`);
                            skipped++;
                            continue;
                        }

                        // Calculate new onboarding date (2-20 days before seminar)
                        const seminarDateObj = new Date(seminarDate);
                        const daysOffset = 2 + (personId % 19); // 2-20 days
                        const onboardingDateObj = new Date(seminarDateObj.getTime() - daysOffset * 86400000);
                        const newOnboarding = onboardingDateObj.toISOString().split('T')[0];

                        // Update person in ChurchTools
                        await churchtoolsClient.patch(`/persons/${personId}`, {
                            taufmanager_onboarding: newOnboarding
                        });

                        console.log(`[Migration] ✓ Updated person ${personId}: ${seminarDate} → ${newOnboarding} (${daysOffset} days earlier)`);
                        updated++;

                    } catch (personError) {
                        console.error(`[Migration] Error processing person ${member.personId}:`, personError);
                        errors++;
                    }
                }

                page++;

            } catch (groupError) {
                console.error(`[Migration] Error fetching group ${groupId} page ${page}:`, groupError);
                hasMore = false;
            }
        }
    }

    console.log(`[Migration] Complete! Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
    return { updated, skipped, errors };
}
