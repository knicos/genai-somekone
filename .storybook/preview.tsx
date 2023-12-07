import type { Preview } from '@storybook/react';
import { FC, Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n';
import '../src/index.css';

const withI18next = (Story: FC) => {
    return (
        // This catches the suspense from components not yet ready (still loading translations)
        // Alternative: set useSuspense to false on i18next.options.react when initializing i18next
        <Suspense fallback={<div>loading translations...</div>}>
            <I18nextProvider i18n={i18n}>
                <Story />
            </I18nextProvider>
        </Suspense>
    );
};

// export decorators for storybook to wrap your stories in
export const decorators = [withI18next];

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
