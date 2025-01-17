import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { PropsWithChildren } from 'react';

declare global {
    // eslint-disable-next-line no-var
    var IS_REACT_ACT_ENVIRONMENT: boolean;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('react-i18next', () => ({
    useTranslation: () => {
        return {
            t: (str: string) => str,
            i18n: {
                changeLanguage: () => new Promise(() => {}),
            },
        };
    },
    initReactI18next: {
        type: '3rdParty',
        init: () => {},
    },
    Trans: function Trans({ i18nKey }: { i18nKey: string }) {
        return i18nKey;
    },
    I18nextProvider: function ({ children }: PropsWithChildren) {
        return children;
    },
}));

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
