import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
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
    ServiceEvents,
} from '@knicos/genai-recom';

export interface Services {
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

export function useServiceEventMemo<TEventName extends keyof ServiceEvents & string, T>(
    f: () => T,
    deps: unknown[],
    name: TEventName
) {
    const [state, dispatch] = useReducer((a) => a + 1, 0);
    const service = useBroker();

    useEffect(() => {
        const handler = () => {
            dispatch();
        };
        service.on(name, handler);
        return () => {
            service.off(name, handler);
        };
    }, [service, name]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(f, [state, ...deps]);
}
