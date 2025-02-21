import {
    UserPanel,
    menuDisabledTreeItems,
    menuHideGridMenuActions,
    menuHideGridMenuContent,
    menuMainMenu,
    menuNodeSelectAction,
    menuReplaySpeed,
    menuSelectedUser,
    menuShowGridMenu,
    menuShowReplay,
    menuShowReplayControls,
    menuShowShare,
    menuShowSocialMenu,
    menuShowUserPanel,
    menuTreeMenu,
} from '@genaism/apps/Dashboard/state/menuState';
import {
    NodeDisplayMode,
    settingClusterColouring,
    settingDisplayLabel,
    settingIncludeAllLinks,
    settingSocialGraphScale,
    settingNodeMode,
    settingLinkLimit,
    settingSimilarPercent,
    settingAutoCamera,
    settingAutoEdges,
    settingSocialNodeMenu,
    userApp,
    heatmapAutoUsers,
    HeatmapMode,
    heatmapMode,
    AppType,
} from '@genaism/apps/Dashboard/state/settingsState';
import { appConfiguration } from '@genaism/common/state/configState';
import { SMConfig, mergeConfiguration } from '@genaism/common/state/smConfig';
import { UserNodeId } from '@knicos/genai-recom';
import { useRecoilCallback } from 'recoil';

export interface SomekoneSocialSettings {
    // displayLines?: boolean;
    includeAllLinks?: boolean;
    displayLabels?: boolean;
    scale?: number;
    // showOfflineUsers?: boolean;
    nodeDisplay?: NodeDisplayMode;
    clusterColouring?: number;
    similarityThreshold?: number;
    linkLimit?: number;
    autoCamera?: boolean;
    autoEdges?: boolean;
    showNodeMenu?: boolean;
}

export interface SomekoneGeneralSettings {}

export interface SomekoneUISettings {
    showUserPanel?: UserPanel;
    showShareCode?: boolean;
    showMainMenu?: boolean;
    showGridMenu?: boolean;
    hideGridMenuActions?: boolean;
    hideGridMenuContent?: boolean;
    showSocialMenu?: boolean;
    nodeSelectAction?: UserPanel;
    showTreeMenu?: boolean;
    disabledTreeItems?: string[];
    showReplay?: boolean;
    enableReplayControls?: boolean;
    replaySpeed?: number;
    selectedUser?: UserNodeId;
    heatmapAutoUsers?: number;
    heatmapMode?: HeatmapMode;
}

export interface SomekoneSettings {
    socialGraph?: SomekoneSocialSettings;
    applicationConfig?: Partial<SMConfig>;
    ui?: SomekoneUISettings;
    appType?: AppType;
}

export function useSettingDeserialise() {
    const deserializer = useRecoilCallback(
        ({ set, snapshot }) =>
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
                    if (data.socialGraph.scale !== undefined) {
                        set(settingSocialGraphScale, data.socialGraph.scale);
                    }
                    if (data.socialGraph.linkLimit !== undefined) {
                        set(settingLinkLimit, data.socialGraph.linkLimit);
                    }
                    if (data.socialGraph.similarityThreshold !== undefined) {
                        set(settingSimilarPercent, data.socialGraph.similarityThreshold);
                    }
                    if (data.socialGraph.includeAllLinks !== undefined) {
                        set(settingIncludeAllLinks, data.socialGraph.includeAllLinks);
                    }
                    if (data.socialGraph.autoCamera !== undefined) {
                        set(settingAutoCamera, data.socialGraph.autoCamera);
                    }
                    if (data.socialGraph.autoEdges !== undefined) {
                        set(settingAutoEdges, data.socialGraph.autoEdges);
                    }
                    if (data.socialGraph.showNodeMenu !== undefined) {
                        set(settingSocialNodeMenu, data.socialGraph.showNodeMenu);
                    }
                }
                if (data.applicationConfig) {
                    snapshot.getPromise(appConfiguration).then((cfg) => {
                        if (data.applicationConfig) {
                            set(appConfiguration, mergeConfiguration(cfg, data.applicationConfig));
                        }
                    });
                }
                if (data.ui) {
                    if (data.ui.showTreeMenu !== undefined) {
                        set(menuTreeMenu, data.ui.showTreeMenu);
                    }
                    if (data.ui.disabledTreeItems !== undefined) {
                        set(menuDisabledTreeItems, data.ui.disabledTreeItems);
                    }
                    if (data.ui.showUserPanel !== undefined) {
                        set(menuShowUserPanel, data.ui.showUserPanel);
                    }
                    if (data.ui.showShareCode !== undefined) {
                        set(menuShowShare, data.ui.showShareCode);
                    }
                    if (data.ui.showMainMenu !== undefined) {
                        set(menuMainMenu, data.ui.showMainMenu);
                    }
                    if (data.ui.showSocialMenu !== undefined) {
                        set(menuShowSocialMenu, data.ui.showSocialMenu);
                    }
                    if (data.ui.showGridMenu !== undefined) {
                        set(menuShowGridMenu, data.ui.showGridMenu);
                    }
                    if (data.ui.hideGridMenuActions !== undefined) {
                        set(menuHideGridMenuActions, data.ui.hideGridMenuActions);
                    }
                    if (data.ui.hideGridMenuContent !== undefined) {
                        set(menuHideGridMenuContent, data.ui.hideGridMenuContent);
                    }
                    if (data.ui.showReplay !== undefined) {
                        set(menuShowReplay, data.ui.showReplay);
                    }
                    if (data.ui.enableReplayControls !== undefined) {
                        set(menuShowReplayControls, data.ui.enableReplayControls);
                    }
                    if (data.ui.replaySpeed !== undefined) {
                        set(menuReplaySpeed, data.ui.replaySpeed);
                    }
                    if (data.ui.nodeSelectAction !== undefined) {
                        set(menuNodeSelectAction, data.ui.nodeSelectAction);
                    }
                    if (data.ui.selectedUser !== undefined) {
                        set(menuSelectedUser, data.ui.selectedUser);
                    }
                    if (data.ui.heatmapAutoUsers !== undefined) {
                        set(heatmapAutoUsers, data.ui.heatmapAutoUsers);
                    }
                    if (data.ui.heatmapMode !== undefined) {
                        set(heatmapMode, data.ui.heatmapMode);
                    }
                }

                if (data.appType !== undefined) {
                    set(userApp, data.appType);
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
                        scale: await snapshot.getPromise(settingSocialGraphScale),
                        includeAllLinks: await snapshot.getPromise(settingIncludeAllLinks),
                        linkLimit: await snapshot.getPromise(settingLinkLimit),
                        similarityThreshold: await snapshot.getPromise(settingSimilarPercent),
                        autoCamera: await snapshot.getPromise(settingAutoCamera),
                        autoEdges: await snapshot.getPromise(settingAutoEdges),
                        showNodeMenu: await snapshot.getPromise(settingSocialNodeMenu),
                    },
                    applicationConfig: await snapshot.getPromise(appConfiguration),
                    ui: {
                        showUserPanel: await snapshot.getPromise(menuShowUserPanel),
                        showShareCode: await snapshot.getPromise(menuShowShare),
                        showSocialMenu: await snapshot.getPromise(menuShowSocialMenu),
                        showGridMenu: await snapshot.getPromise(menuShowGridMenu),
                        hideGridMenuActions: await snapshot.getPromise(menuHideGridMenuActions),
                        hideGridMenuContent: await snapshot.getPromise(menuHideGridMenuContent),
                        nodeSelectAction: await snapshot.getPromise(menuNodeSelectAction),
                        showTreeMenu: await snapshot.getPromise(menuTreeMenu),
                        disabledTreeItems: await snapshot.getPromise(menuDisabledTreeItems),
                        showReplay: await snapshot.getPromise(menuShowReplay),
                        enableReplayControls: await snapshot.getPromise(menuShowReplayControls),
                        replaySpeed: await snapshot.getPromise(menuReplaySpeed),
                        heatmapAutoUsers: await snapshot.getPromise(heatmapAutoUsers),
                        heatmapMode: await snapshot.getPromise(heatmapMode),
                    },
                    appType: await snapshot.getPromise(userApp),
                };
            },
        []
    );
    return serialise;
}
