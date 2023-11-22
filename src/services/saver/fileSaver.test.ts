import { describe, it, vi } from 'vitest';
import { UserProfile } from '../profiler/profilerTypes';
import { saveFile } from './fileSaver';
import JSZip from 'jszip';

const { mockUsers, mockProfiles, mockSave } = vi.hoisted(() => ({
    mockUsers: vi.fn(),
    mockProfiles: vi.fn<unknown[], UserProfile>(),
    mockSave: vi.fn(),
}));

vi.mock('@genaism/services/graph/nodes', () => ({
    getNodesByType: mockUsers,
}));

vi.mock('@genaism/services/profiler/profiler', () => ({
    getUserProfile: mockProfiles,
}));

vi.mock('file-saver', () => ({
    saveAs: mockSave,
}));

describe('saveFile()', () => {
    it('generates a zip containing user profiles', async ({ expect }) => {
        mockUsers.mockImplementation(() => ['xyz']);
        mockProfiles.mockImplementation(() => ({
            name: 'TestUser',
            id: 'xyz',
            engagement: -1,
            engagedContent: [],
            taste: [],
            attributes: {},
        }));

        const blob = await saveFile(false, true);

        expect(mockUsers).toHaveBeenCalledTimes(1);
        expect(mockProfiles).toHaveBeenCalledWith('xyz');
        expect(mockSave).toHaveBeenCalledTimes(1);

        const zip = await JSZip.loadAsync(blob);
        expect(zip.files).toHaveProperty('users.json');
        expect(zip.files['users.json'].name).toBe('users.json');

        const data = JSON.parse(await zip.files['users.json'].async('string'));
        expect(data).toHaveLength(1);
        expect(data[0].name).toBe('TestUser');
    });
});
