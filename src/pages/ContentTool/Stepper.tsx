import { LargeButton } from '@knicos/genai-base';
import { useTranslation } from 'react-i18next';

interface Props {
    onNext?: () => void;
}

export default function Stepper({ onNext }: Props) {
    const { t } = useTranslation('creator');
    return (
        <nav>
            <LargeButton
                variant="contained"
                color="secondary"
                disabled={!onNext}
                onClick={onNext}
            >
                {t('actions.next')}
            </LargeButton>
        </nav>
    );
}
