import { NativeSelect } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export const LANGS = [
    { name: 'en-GB', label: 'English' },
    { name: 'fi-FI', label: 'Suomi' },
];

export default function LangSelect() {
    const { t, i18n } = useTranslation();
    const doChangeLanguage = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            i18n.changeLanguage(e.target.value || 'en-GB');
        },
        [i18n]
    );

    return (
        <NativeSelect
            value={i18n.language}
            onChange={doChangeLanguage}
            variant="outlined"
            data-testid="select-lang"
            inputProps={{ 'aria-label': t('app.language') }}
        >
            {LANGS.map((lng) => (
                <option
                    key={lng.name}
                    value={lng.name}
                >
                    {lng.label}
                </option>
            ))}
        </NativeSelect>
    );
}
