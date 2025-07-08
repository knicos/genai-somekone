import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import style from './style.module.css';
import { settingContentWizardAdvanced } from '@genaism/apps/Dashboard/state/settingsState';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function ContentSettingsDialog({ open, onClose }: Props) {
    const { t } = useTranslation();
    const [advanced, setAdvanced] = useAtom(settingContentWizardAdvanced);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            scroll="paper"
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>{t('creator.titles.settings')}</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent>
                <div className={style.column}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={advanced}
                                onChange={(_, checked) => setAdvanced(checked)}
                            />
                        }
                        label={t('creator.labels.advanced')}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
