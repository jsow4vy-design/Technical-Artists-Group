import { TeamMember } from '../types';
import { studioTeam } from '../data/studioData';

const STORAGE_KEY = 'tag_team_members';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Use existing data from studioData as seed
const SEED_DATA: TeamMember[] = studioTeam as TeamMember[];

export const getTeamMembers = async (): Promise<TeamMember[]> => {
    await delay(300);
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        // Seed if empty
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
        return SEED_DATA;
    } catch (e) {
        console.error("Failed to load team members", e);
        return SEED_DATA;
    }
};

export const saveTeamMembers = async (members: TeamMember[]): Promise<void> => {
    await delay(200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
};

export const addTeamMember = async (member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
    const members = await getTeamMembers();
    const newMember = { ...member, id: Date.now() };
    const updatedMembers = [...members, newMember];
    await saveTeamMembers(updatedMembers);
    return newMember;
};

export const updateTeamMember = async (updatedMember: TeamMember): Promise<void> => {
    const members = await getTeamMembers();
    const index = members.findIndex(m => m.id === updatedMember.id);
    if (index !== -1) {
        members[index] = updatedMember;
        await saveTeamMembers(members);
    }
};

export const deleteTeamMember = async (id: number): Promise<void> => {
    const members = await getTeamMembers();
    const updatedMembers = members.filter(m => m.id !== id);
    await saveTeamMembers(updatedMembers);
};