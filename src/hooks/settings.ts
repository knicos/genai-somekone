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
    heatmapDimension,
} from '@genaism/apps/Dashboard/state/settingsState';
import { appConfiguration } from '@genaism/common/state/configState';
import { SMConfig, mergeConfiguration } from '@genaism/common/state/smConfig';
import { UserNodeId } from '@knicos/genai-recom';
import { useAtomCallback } from 'jotai/utils';
import { useCallback, useMemo } from 'react';

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
    heatmapDimension?: number;
}

export interface SomekoneSettings {
    socialGraph?: SomekoneSocialSettings;
    applicationConfig?: Partial<SMConfig>;
    ui?: SomekoneUISettings;
    appType?: AppType;
}

export function useSettingDeserialise() {
    const deserializer = useAtomCallback(
        useCallback(
            (get, set) => (data: SomekoneSettings) => {
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
                    const cfg = get(appConfiguration);
                    if (data.applicationConfig) {
                        set(appConfiguration, mergeConfiguration(cfg, data.applicationConfig));
                    }
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
                    if (data.ui.heatmapDimension !== undefined) {
                        set(heatmapDimension, data.ui.heatmapDimension);
                    }
                }

                if (data.appType !== undefined) {
                    set(userApp, data.appType);
                }
            },
            []
        )
    );

    return useMemo(() => deserializer(), [deserializer]);
}

export function useSettingSerialise() {
    const serialise = useAtomCallback(
        useCallback(
            (get) => (): SomekoneSettings => {
                return {
                    socialGraph: {
                        displayLabels: get(settingDisplayLabel),
                        clusterColouring: get(settingClusterColouring),
                        nodeDisplay: get(settingNodeMode),
                        scale: get(settingSocialGraphScale),
                        includeAllLinks: get(settingIncludeAllLinks),
                        linkLimit: get(settingLinkLimit),
                        similarityThreshold: get(settingSimilarPercent),
                        autoCamera: get(settingAutoCamera),
                        autoEdges: get(settingAutoEdges),
                        showNodeMenu: get(settingSocialNodeMenu),
                    },
                    applicationConfig: get(appConfiguration),
                    ui: {
                        showUserPanel: get(menuShowUserPanel),
                        showShareCode: get(menuShowShare),
                        showSocialMenu: get(menuShowSocialMenu),
                        showGridMenu: get(menuShowGridMenu),
                        hideGridMenuActions: get(menuHideGridMenuActions),
                        hideGridMenuContent: get(menuHideGridMenuContent),
                        nodeSelectAction: get(menuNodeSelectAction),
                        showTreeMenu: get(menuTreeMenu),
                        disabledTreeItems: get(menuDisabledTreeItems),
                        showReplay: get(menuShowReplay),
                        enableReplayControls: get(menuShowReplayControls),
                        replaySpeed: get(menuReplaySpeed),
                        heatmapAutoUsers: get(heatmapAutoUsers),
                        heatmapMode: get(heatmapMode),
                        heatmapDimension: get(heatmapDimension),
                    },
                    appType: get(userApp),
                };
            },
            []
        )
    );
    return useMemo(() => serialise(), [serialise]);
}
