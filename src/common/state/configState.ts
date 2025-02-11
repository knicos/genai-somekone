import { SMConfig } from '@genaism/common/state/smConfig';
import { UserNodeId } from '@knicos/genai-recom';
import { atom, atomFamily, selectorFamily } from 'recoil';

export const appConfiguration = atom<SMConfig>({
    key: 'appconfig',
    default: undefined,
});

export const userConfiguration = atomFamily<Partial<SMConfig>, UserNodeId>({
    key: 'userconfig',
    default: undefined,
});

export const configuration = selectorFamily<SMConfig, UserNodeId>({
    key: 'configuration',
    get:
        (id: UserNodeId) =>
        ({ get }) => ({ ...get(appConfiguration), ...get(userConfiguration(id)) }),
});
