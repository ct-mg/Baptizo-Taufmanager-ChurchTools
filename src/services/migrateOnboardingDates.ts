// Migration Script: Fix Onboarding Dates in ChurchTools
// Run this once to update all persons' onboarding dates to 2-20 days before seminar

import { churchtoolsClient } from '@churchtools/churchtools-client';
import { getAdminSettings } from '../lib/kv-store';

export async function migrateOnboardingDates(): Promise<{ updated: number; skipped: number; errors: number }> {
    console.log('[Migration] Starting onboarding date migration...');

    const adminCfg = await getAdminSettings();
    const interestGroupId = parseInt(adminCfg?.interestGroupId || '0');
    const baptizedGroupId = parseInt(adminCfg?.baptizedGroupId || '0');

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Fetch all groups
    const groupIds = [interestGroupId, baptizedGroupId].filter(id => id > 0);

    for (const groupId of groupIds) {
        console.log(`[Migration] Processing group ${groupId}...`);

        // Fetch group members with pagination
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            try {
                const response = await churchtoolsClient.get(`/groups/${groupId}/members`, {
                    params: { limit: 500, page }
                });

                const members = response.data || [];
                if (members.length === 0) {
                    hasMore = false;
                    break;
                }

                // Process each member
                for (const member of members) {
                    try {
                        // Fetch full person details
                        const personDetail = await churchtoolsClient.get(`/persons/${member.personId}`);

                        const seminarDate = personDetail.taufmanager_seminar;
                        const currentOnboarding = personDetail.taufmanager_onboarding;

                        // Skip if no seminar date
                        if (!seminarDate) {
                            skipped++;
                            continue;
                        }

                        // Skip if onboarding already set and different from seminar
                        if (currentOnboarding && currentOnboarding !== seminarDate) {
                            console.log(`[Migration] Skipping person ${member.personId} - onboarding already customized`);
                            skipped++;
                            continue;
                        }

                        // Calculate new onboarding date (2-20 days before seminar)
                        const seminarDateObj = new Date(seminarDate);
                        const daysOffset = 2 + (member.personId % 19); // 2-20 days
                        const onboardingDateObj = new Date(seminarDateObj.getTime() - daysOffset * 86400000);
                        const newOnboarding = onboardingDateObj.toISOString().split('T')[0];

                        // Update person in ChurchTools
                        await churchtoolsClient.patch(`/persons/${member.personId}`, {
                            taufmanager_onboarding: newOnboarding
                        });

                        console.log(`[Migration] ✓ Updated person ${member.personId}: ${seminarDate} → ${newOnboarding} (${daysOffset} days earlier)`);
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
