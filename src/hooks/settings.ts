import {
    GraphTypes,
    UserPanel,
    menuGraphType,
    menuShowSave,
    menuShowShare,
    menuShowUserPanel,
} from '@genaism/state/menuState';
import {
    NodeDisplayMode,
    appConfiguration,
    settingClusterColouring,
    settingDisplayLabel,
    settingIncludeAllLinks,
    settingLinkDistanceScale,
    settingNodeCharge,
    settingNodeMode,
    settingSimilarPercent,
    settingTopicThreshold,
} from '@genaism/state/settingsState';
import { SMConfig } from '@genaism/views/Genagram/smConfig';
import { useRecoilCallback } from 'recoil';

export interface SomekoneSocialSettings {
    // displayLines?: boolean;
    includeAllLinks?: boolean;
    displayLabels?: boolean;
    linkDistanceScale?: number;
    similarPercent?: number;
    nodeCharge?: number;
    topicThreshold?: number;
    // showOfflineUsers?: boolean;
    nodeDisplay?: NodeDisplayMode;
    clusterColouring?: number;
}

export interface SomekoneGeneralSettings {}

export interface SomekoneUISettings {
    showUserPanel?: UserPanel;
    showShareCode?: boolean;
    showSaveDialog?: boolean;
    showGraph?: GraphTypes;
}

export interface SomekoneSettings {
    socialGraph?: SomekoneSocialSettings;
    applicationConfig?: SMConfig;
    ui?: SomekoneUISettings;
}

export function useSettingDeserialise() {
    const deserializer = useRecoilCallback(
        ({ set }) =>
            (data: SomekoneSettings) => {
                if (data.socialGraph) {
                    if (data.socialGraph.displayLabels !== undefined) {
                        set(settingDisplayLabel, data.socialGraph.displayLabels);
                    }
                    if (data.socialGraph.clusterColouring !== undefined) {
                        set(settingClusterColouring, data.socialGraph.clusterColouring);
                    }
                    if (data.socialGraph.nodeDisplay !== undefined) {
                        set(settingNodeMode, data.socialGraph.nodeDisplay);
                    }
                    if (data.socialGraph.nodeCharge !== undefined) {
                        set(settingNodeCharge, data.socialGraph.nodeCharge);
                    }
                    if (data.socialGraph.linkDistanceScale !== undefined) {
                        set(settingLinkDistanceScale, data.socialGraph.linkDistanceScale);
                    }
                    if (data.socialGraph.topicThreshold !== undefined) {
                        set(settingTopicThreshold, data.socialGraph.topicThreshold);
                    }
                    if (data.socialGraph.includeAllLinks !== undefined) {
                        set(settingIncludeAllLinks, data.socialGraph.includeAllLinks);
                    }
                    if (data.socialGraph.similarPercent !== undefined) {
                        set(settingSimilarPercent, data.socialGraph.similarPercent);
                    }
                }
                if (data.applicationConfig) {
                    set(appConfiguration, data.applicationConfig);
                }
                if (data.ui) {
                    if (data.ui.showUserPanel !== undefined) {
                        set(menuShowUserPanel, data.ui.showUserPanel);
                    }
                    if (data.ui.showShareCode !== undefined) {
                        set(menuShowShare, data.ui.showShareCode);
                    }
                    if (data.ui.showGraph !== undefined) {
                        set(menuGraphType, data.ui.showGraph);
                    }
                    if (data.ui.showSaveDialog !== undefined) {
                        set(menuShowSave, data.ui.showSaveDialog);
                    }
                }
            },
        []
    );

    return deserializer;
}

export function useSettingSerialise() {
    const serialise = useRecoilCallback(
        ({ snapshot }) =>
            async (): Promise<SomekoneSettings> => {
                return {
                    socialGraph: {
                        displayLabels: await snapshot.getPromise(settingDisplayLabel),
                        clusterColouring: await snapshot.getPromise(settingClusterColouring),
                        nodeDisplay: await snapshot.getPromise(settingNodeMode),
                        nodeCharge: await snapshot.getPromise(settingNodeCharge),
                        linkDistanceScale: await snapshot.getPromise(settingLinkDistanceScale),
                        topicThreshold: await snapshot.getPromise(settingTopicThreshold),
                        includeAllLinks: await snapshot.getPromise(settingIncludeAllLinks),
                        similarPercent: await snapshot.getPromise(settingSimilarPercent),
                    },
                    applicationConfig: await snapshot.getPromise(appConfiguration),
                    ui: {
                        showUserPanel: await snapshot.getPromise(menuShowUserPanel),
                        showGraph: await snapshot.getPromise(menuGraphType),
                        showSaveDialog: await snapshot.getPromise(menuShowSave),
                        showShareCode: await snapshot.getPromise(menuShowShare),
                    },
                };
            },
        []
    );
    return serialise;
}
