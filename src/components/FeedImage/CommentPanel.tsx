import style from './style.module.css';
import TextField from '@mui/material/TextField';
import ActionPanel from './ActionPanel';

interface Props {
    onClose?: () => void;
    onChange?: () => void;
}

export default function CommentPanel({ onClose }: Props) {
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
                    placeholder="write a comment..."
                />
                <div className={style.commentList}>No comments yet.</div>
            </div>
        </ActionPanel>
    );
}
