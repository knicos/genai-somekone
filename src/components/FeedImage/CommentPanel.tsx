import style from './style.module.css';
import TextField from '@mui/material/TextField';
import ActionPanel from './ActionPanel';
import { useTranslation } from 'react-i18next';

interface Props {
    onClose?: () => void;
    onChange?: () => void;
}

export default function CommentPanel({ onClose }: Props) {
    const { t } = useTranslation();
    /*const doClick = useCallback(
        (e: React.MouseEvent) => {
            if (onChange) onChange();
            if (onClose) onClose();
        },
        [onChange, onClose]
    );*/

    return (
        <ActionPanel
            horizontal="hfull"
            vertical="bottom"
            onClose={onClose}
        >
            <div className={style.commentbubble}>
                <TextField
                    variant="outlined"
                    placeholder={t('feed.placeholders.comment')}
                />
                <div className={style.commentList}>{t('feed.messages.noComments')}</div>
            </div>
        </ActionPanel>
    );
}
