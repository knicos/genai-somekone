import { appConfiguration } from '@genaism/common/state/configState';
import { PropsWithChildren, createContext, memo, useCallback, useContext } from 'react';
import { useAtomValue } from 'jotai';
import { SenderType } from '@genai-fi/base';
import { ResearchLogEvent } from '@genaism/protocol/protocol';
import { useProfilerService } from './services';

type LogFn = null | ((action: string, details?: unknown) => void);

const LoggerContext = createContext<LogFn>(null);

interface Props extends PropsWithChildren {
    sender?: SenderType<ResearchLogEvent>;
}

function LogProviderComp({ sender, children }: Props) {
    const config = useAtomValue(appConfiguration);
    const profiler = useProfilerService();

    const logFn = useCallback(
        (action: string, details: unknown) => {
            if (sender)
                sender({
                    event: 'researchlog',
                    action,
                    timestamp: Date.now(),
                    userId: profiler.getCurrentUser(),
                    details,
                });
        },
        [sender, profiler]
    );

    return (
        <LoggerContext.Provider value={config?.collectResearchData ? logFn : null}>{children}</LoggerContext.Provider>
    );
}

export const LogProvider = memo(LogProviderComp);

export function useLogger() {
    return useContext(LoggerContext);
}
