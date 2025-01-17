import { describe, it, vi } from 'vitest';
import LangSelect from './LangSelect';
import { render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import userEvent from '@testing-library/user-event';

vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(),
    initReactI18next: {
        type: '3rdParty',
        init: () => {},
    },
}));

describe('LangSelect', () => {
    it('can change language', async ({ expect }) => {
        const changeLangFn = vi.fn();
        const user = userEvent.setup();

        const useTranslationSpy = useTranslation as ReturnType<typeof vi.fn>;
        useTranslationSpy.mockReturnValue({
            t: (str: string) => str,
            i18n: {
                changeLanguage: changeLangFn,
            },
        });

        render(<LangSelect />);

        const buttonElement = screen.getByLabelText('app.language');
        await user.selectOptions(buttonElement, 'fi');
        expect(changeLangFn).toHaveBeenCalledWith('fi');
    });
});
