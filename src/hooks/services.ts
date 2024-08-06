import { createContext, useContext } from 'react';
import {
    ActionLogService,
    ContentService,
    getActionLogService,
    getBroker,
    getContentService,
    getGraphService,
    getProfilerService,
    getRecommenderService,
    getReplayService,
    GraphService,
    ProfilerService,
    RecommenderService,
    ReplayService,
} from '@knicos/genai-recom';

interface Services {
    broker: ReturnType<typeof getBroker>;
    graph: GraphService;
    content: ContentService;
    profiler: ProfilerService;
    recommender: RecommenderService;
    actionLog: ActionLogService;
    replay: ReplayService;
}

export const defaultServices = {
    broker: getBroker(),
    graph: getGraphService(),
    content: getContentService(),
    profiler: getProfilerService(),
    recommender: getRecommenderService(),
    actionLog: getActionLogService(),
    replay: getReplayService(),
};

const ServiceContext = createContext<Services>(defaultServices);

export const ServiceProvider = ServiceContext.Provider;

export function useServices() {
    return useContext(ServiceContext);
}

export function useGraphService() {
    return useServices().graph;
}

export function useContentService() {
    return useServices().content;
}

export function useProfilerService() {
    return useServices().profiler;
}

export function useRecommenderService() {
    return useServices().recommender;
}

export function useActionLogService() {
    return useServices().actionLog;
}

export function useBroker() {
    return useServices().broker;
}
