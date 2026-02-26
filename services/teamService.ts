import { TeamMember } from '../types';

export const getTeamMembers = async (): Promise<TeamMember[]> => {
    try {
        const response = await fetch('/api/team');
        if (!response.ok) throw new Error('Failed to fetch team members');
        return await response.json();
    } catch (e) {
        console.error("Failed to load team members", e);
        return [];
    }
};

export const saveTeamMembers = async (members: TeamMember[]): Promise<void> => {
    // This function was used for bulk save in localStorage.
    // For API, we use it for reordering (bulk update).
    try {
        const response = await fetch('/api/team', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(members),
        });
        if (!response.ok) throw new Error('Failed to save team members order');
    } catch (e) {
        console.error("Failed to save team members", e);
    }
};

export const addTeamMember = async (member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
    const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
    });
    if (!response.ok) throw new Error('Failed to add team member');
    return await response.json();
};

export const updateTeamMember = async (updatedMember: TeamMember): Promise<void> => {
    const response = await fetch(`/api/team/${updatedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMember),
    });
    if (!response.ok) throw new Error('Failed to update team member');
};

export const deleteTeamMember = async (id: number): Promise<void> => {
    const response = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete team member');
};