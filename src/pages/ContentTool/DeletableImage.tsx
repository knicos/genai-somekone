import { useCallback } from 'react';
import style from './style.module.css';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MIconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ContentNodeId } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';

const IconButton = styled(MIconButton)({
    position: 'absolute',
    top: '0px',
    left: '0px',
    color: 'white',
});

interface Props {
    id: ContentNodeId;
    onDelete: (id: ContentNodeId) => void;
}

export default function DeletableImage({ id, onDelete }: Props) {
    const { t } = useTranslation();
    const content = useContentService();

    const doClick = useCallback(() => onDelete(id), [onDelete, id]);

    return (
        <li
            className={style.deletableImage}
            data-testid={`image-${id}`}
        >
            <IconButton
                aria-label={t('trainingdata.aria.delete')}
                onClick={doClick}
            >
                <DeleteForeverIcon />
            </IconButton>
            <img
                src={content.getContentData(id)}
                width={64}
                height={64}
                alt={t('trainingdata.aria.sample')}
            />
        </li>
    );
}
