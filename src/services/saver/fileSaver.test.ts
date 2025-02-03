import { describe, it, vi } from 'vitest';
import { saveFile } from './fileSaver';
import JSZip from 'jszip';
import {
    ActionLogService,
    ContentService,
    createEmptyProfile,
    GraphService,
    LogEntry,
    ProfilerService,
    ServiceBroker,
    UserNodeData,
} from '@knicos/genai-recom';

const { mockUsers, mockProfiles, mockSave, mockLog } = vi.hoisted(() => ({
    mockUsers: vi.fn(),
    mockProfiles: vi.fn<(a: unknown[]) => UserNodeData>(),
    mockSave: vi.fn(),
    mockLog: vi.fn<(a: unknown[]) => LogEntry[]>(),
}));

vi.mock('@knicos/genai-recom', async () => {
    const mod = await vi.importActual<typeof import('@knicos/genai-recom')>('@knicos/genai-recom');
    return {
        ...mod,
        GraphService: vi.fn(() => ({
            getNodesByType: mockUsers,
        })),
        ProfilerService: vi.fn((broker, graph) => ({
            broker,
            graph,
            getUserProfile: mockProfiles,
        })),
        ActionLogService: vi.fn(() => ({
            getActionLog: mockLog,
        })),
    };
});

vi.mock('file-saver', () => ({
    saveAs: mockSave,
}));

describe('saveFile()', () => {
    it('generates a zip containing user profiles', async ({ expect }) => {
        const broker = new ServiceBroker();
        const graph = new GraphService(broker);
        const content = new ContentService(broker, graph);
        const profiler = new ProfilerService(broker, graph, content);
        const actionLog = new ActionLogService(broker);

        mockUsers.mockImplementation(() => ['xyz']);
        mockProfiles.mockImplementation(() => createEmptyProfile('user:xyz', 'TestUser'));

        const blob = await saveFile(profiler, content, actionLog, {
            includeProfiles: true,
        });

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

    it('generates a zip containing action logs', async ({ expect }) => {
        const broker = new ServiceBroker();
        const graph = new GraphService(broker);
        const content = new ContentService(broker, graph);
        const profiler = new ProfilerService(broker, graph, content);
        const actionLog = new ActionLogService(broker);

        mockUsers.mockImplementation(() => ['xyz']);
        mockLog.mockImplementation(() => [{ activity: 'like', timestamp: 1 }] as LogEntry[]);

        const blob = await saveFile(profiler, content, actionLog, {
            includeLogs: true,
        });

        expect(mockUsers).toHaveBeenCalledTimes(1);
        expect(mockLog).toHaveBeenCalledWith('xyz');
        expect(mockSave).toHaveBeenCalledTimes(1);

        const zip = await JSZip.loadAsync(blob);
        expect(zip.files).toHaveProperty('logs.json');
        expect(zip.files['logs.json'].name).toBe('logs.json');

        const data = JSON.parse(await zip.files['logs.json'].async('string'));
        expect(data).toHaveLength(1);
        expect(data[0].id).toBe('xyz');
        expect(data[0].log).toHaveLength(1);
    });
});
