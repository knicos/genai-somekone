import { ContentNodeId } from '@knicos/genai-recom';
import IconMenuInline from '../IconMenu/IconMenuInline';
import style from './style.module.css';
import ImageGrid from '../ImageGrid/ImageGrid';
import IconMenuItem from '../IconMenu/Item';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useContentService } from '@genaism/hooks/services';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    title: string;
    cluster: ContentNodeId[];
}

export default function ContentCluster({ title, cluster }: Props) {
    const { t } = useTranslation();
    const contentSvc = useContentService();

    const doDelete = useCallback(() => {
        cluster.forEach((img) => {
            contentSvc.removeContent(img);
        });
    }, [contentSvc, cluster]);

    return (
        <div className={style.clusterGroup}>
            <IconMenuInline label={<div className={style.menuLogoSmall}>{title}</div>}>
                <IconMenuItem tooltip={t('creator.tooltips.deleteTheseImages')}>
                    <IconButton
                        color="inherit"
                        onClick={doDelete}
                    >
                        <DeleteIcon />
                    </IconButton>
                </IconMenuItem>
            </IconMenuInline>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                <ImageGrid
                    images={cluster}
                    columns={5}
                />
            </div>
        </div>
    );
}
