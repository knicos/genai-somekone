import { SMConfig } from '@genaism/common/state/smConfig';
import { UserNodeId } from '@knicos/genai-recom';
import { Atom, atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import DEFAULT from './defaultConfig.json';

export const appConfiguration = atom<SMConfig>(DEFAULT.configuration as SMConfig);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const userConfiguration = atomFamily((_: UserNodeId) => atom<Partial<SMConfig>>({}));

export const configuration = atomFamily<UserNodeId, Atom<SMConfig>>((id: UserNodeId) =>
    atom((get) => {
        return { ...get(appConfiguration), ...get(userConfiguration(id)) };
    })
);
