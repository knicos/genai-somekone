import { LargeButton } from '@genaism/components/Button/Button';
import style from './style.module.css';
import DownloadIcon from '@mui/icons-material/Download';
import LoopIcon from '@mui/icons-material/Loop';
import { saveFile } from '@genaism/services/saver/fileSaver';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';
import { unsavedChanges } from '@genaism/state/interaction';

interface Props {
    onNext: () => void;
}

export default function ConfirmPage({ onNext }: Props) {
    const setUnsaved = useSetRecoilState(unsavedChanges);
    const { t } = useTranslation('creator');
    return (
        <main className={style.contentSection}>
            <header>
                <h1>{t('completeTitle')}</h1>
            </header>
            <div className={style.confirmButtons}>
                <LargeButton
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                        setUnsaved(false);
                        saveFile({ includeContent: true });
                    }}
                >
                    {t('actions.download')}
                </LargeButton>
                <LargeButton
                    variant="outlined"
                    startIcon={<LoopIcon />}
                    onClick={onNext}
                >
                    {t('actions.again')}
                </LargeButton>
            </div>
        </main>
    );
}
