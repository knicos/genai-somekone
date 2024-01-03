import { LargeButton } from '@genaism/components/Button/Button';
import style from './style.module.css';
import DownloadIcon from '@mui/icons-material/Download';
import { saveFile } from '@genaism/services/saver/fileSaver';
import { useTranslation } from 'react-i18next';

export default function CategoryRefine() {
    const { t } = useTranslation('creator');
    return (
        <main className={style.contentSection}>
            <header>
                <h1>{t('completeTitle')}</h1>
            </header>
            <LargeButton
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => saveFile({ includeContent: true })}
            >
                {t('actions.download')}
            </LargeButton>
        </main>
    );
}
