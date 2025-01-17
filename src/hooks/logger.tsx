import { appConfiguration } from '@genaism/state/settingsState';
import { PropsWithChildren, createContext, memo, useCallback, useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { SenderType } from '@knicos/genai-base';
import { ResearchLogEvent } from '@genaism/protocol/protocol';
import { useProfilerService } from './services';

type LogFn = null | ((action: string, details?: unknown) => void);

const LoggerContext = createContext<LogFn>(null);

interface Props extends PropsWithChildren {
    sender?: SenderType<ResearchLogEvent>;
}

function LogProviderComp({ sender, children }: Props) {
    const config = useRecoilValue(appConfiguration);
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
