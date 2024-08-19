import EE from 'eventemitter3';
import { createContext, useContext, useEffect, useMemo } from 'react';

type ComponentEvents = {
    [key in `save_${string}`]: [];
};

export default class ComponentBroker {
    private emitter = new EE();

    emit<TEventName extends keyof ComponentEvents & string>(
        eventName: TEventName,
        ...eventArg: ComponentEvents[TEventName]
    ) {
        this.emitter.emit(eventName, ...(eventArg as []));
    }

    on<TEventName extends keyof ComponentEvents & string>(
        eventName: TEventName,
        handler: (...eventArg: ComponentEvents[TEventName]) => void
    ) {
        this.emitter.on(eventName, handler as (...args: unknown[]) => void);
    }

    off<TEventName extends keyof ComponentEvents & string>(
        eventName: TEventName,
        handler: (...eventArg: ComponentEvents[TEventName]) => void
    ) {
        this.emitter.off(eventName, handler as (...args: unknown[]) => void);
    }
}

const EventContext = createContext<ComponentBroker>(new ComponentBroker());

export const ServiceProvider = EventContext.Provider;

export function useEventEmitter() {
    return useContext(EventContext);
}

export function useEventListen<TEventName extends keyof ComponentEvents & string>(
    name: TEventName,
    handler: (...eventArg: ComponentEvents[TEventName]) => void,
    deps?: unknown[]
) {
    const ee = useEventEmitter();
    useEffect(() => {
        const h = handler;
        ee.on(name, h);
        return () => {
            ee.off(name, h);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ee, name, ...(deps || [])]);
}

export function useEventEmit<TEventName extends keyof ComponentEvents & string>(name: TEventName) {
    const ee = useEventEmitter();
    return useMemo(
        () =>
            (...eventArg: ComponentEvents[TEventName]) => {
                ee.emit(name, ...eventArg);
            },
        [name, ee]
    );
}
