import { useCallback } from 'react';
import style from './style.module.css';
import AddIcon from '@mui/icons-material/Add';
import { ImageResult } from '@genaism/services/imageSearch/hook';

interface Props {
    data: ImageResult;
    disabled?: boolean;
    onClick?: (data: ImageResult) => void;
}

export default function ImageItem({ data, disabled, onClick }: Props) {
    const doClick = useCallback(() => {
        if (onClick) {
            onClick(data);
        }
    }, [data, onClick]);

    return (
        <div
            className={disabled ? style.disabledCandidate : style.candidate}
            onClick={doClick}
        >
            <img
                className={style.candidateImage}
                src={data.url}
                alt="Insta Upload"
                width={data.width}
                style={{ aspectRatio: `${data.width} / ${data.height}` }}
            />
            <div className={style.addIcon}>
                <AddIcon fontSize="inherit" />
            </div>
        </div>
    );
}
