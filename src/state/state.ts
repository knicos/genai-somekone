import { ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import { atomFamily } from 'recoil';

export const cachedProfiles = atomFamily<ProfileSummary | null, string>({
    key: 'cachedProfiles',
    default: null,
});
