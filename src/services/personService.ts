import { churchtoolsClient } from '@churchtools/churchtools-client';
import type { Person } from '../utils/ct-types';

/**
 * Service for fetching person and group related data
 * Uses globally configured churchtoolsClient with Token-Auth
 */
export const personService = {
    /**
     * Retrieves members of a specific group
     * @param groupId The ID of the group
     * @returns Promise<Person[]> List of group members
     */
    async getGroupMembers(groupId: number): Promise<Person[]> {
        try {
            // churchtoolsClient.get returns the response body directly
            // CT API returns { data: [...] } for collections
            const response = await churchtoolsClient.get<{ data: Person[] }>(`/groups/${groupId}/members`);

            if (response && response.data) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error(`[Baptizo] Error fetching members for group ${groupId}:`, error);
            throw error;
        }
    }
};
