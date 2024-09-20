import { ContentNodeId } from '@knicos/genai-recom';
import style from './style.module.css';
import ImageGrid from '../ImageGrid/ImageGrid';
import { IconButton, Menu, MenuItem, Pagination } from '@mui/material';
import { useContentService } from '@genaism/hooks/services';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Widget } from './Widget';
import MenuIcon from '@mui/icons-material/Menu';

interface Props {
    clusters: ContentNodeId[][];
}

export default function ContentCluster({ clusters }: Props) {
    const { t } = useTranslation();
    const contentSvc = useContentService();
    const [page, setPage] = useState(0);
    const anchorEl = useRef<HTMLButtonElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const doDelete = useCallback(() => {
        clusters[page].forEach((img) => {
            contentSvc.removeContent(img);
        });
    }, [contentSvc, clusters, page]);

    return (
        <Widget
            title={t('creator.titles.clusterViewer')}
            dataWidget="clusterinstance"
            style={{ width: '400px' }}
            noPadding
            menu={
                <div>
                    <IconButton
                        ref={anchorEl}
                        onClick={() => setMenuOpen(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl.current}
                        open={menuOpen}
                        onClose={() => setMenuOpen(false)}
                    >
                        <MenuItem onClick={doDelete}>{t('creator.actions.deleteCluster')}</MenuItem>
                    </Menu>
                </div>
            }
        >
            <div className={style.clusterGroup}>
                <Pagination
                    count={clusters.length}
                    page={page + 1}
                    onChange={(_, value) => setPage(value - 1)}
                />
                <div style={{ height: '300px', overflow: 'auto' }}>
                    {page < clusters.length && (
                        <ImageGrid
                            images={clusters[page]}
                            columns={5}
                        />
                    )}
                </div>
            </div>
        </Widget>
    );
}
