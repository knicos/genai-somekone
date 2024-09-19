import { useChangeNodeType } from '@genaism/hooks/graph';
import style from './style.module.css';
import { ContentNodeId, ContentService } from '@knicos/genai-recom';
import { useCallback, useMemo, useReducer, useRef, useState } from 'react';
import { useContentService } from '@genaism/hooks/services';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { deleteTags, deleteWithTags, mergeTags, renameTag } from './contentUtilities';
import { useTranslation } from 'react-i18next';
import { Widget } from './Widget';

interface Row {
    id: string;
    label: string;
    weight: number;
}

const columns: GridColDef<Row>[] = [
    {
        field: 'label',
        headerName: 'Label',
        width: 200,
        editable: true,
    },
    { field: 'weight', headerName: 'Count', width: 80 },
];

function analyseTags(service: ContentService, content: ContentNodeId[]) {
    const tags = new Map<string, number>();
    content.forEach((c) => {
        const meta = service.getContentMetadata(c);
        if (meta) {
            meta.labels.forEach((l) => {
                const v = tags.get(l.label) || 0;
                tags.set(l.label, v + 1);
            });
        }
    });

    const arr = Array.from(tags).map((v) => ({ id: v[0], label: v[0], weight: v[1] }));
    arr.sort((a, b) => b.weight - a.weight);
    return arr;
}

interface Props {
    onFindMore?: (tags: string[]) => void;
}

export default function ContentSummary({ onFindMore }: Props) {
    const { t } = useTranslation();
    const content = useChangeNodeType('content');
    const contentSvc = useContentService();
    const apiRef = useGridApiRef();
    const anchorEl = useRef<HTMLButtonElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [counter, trigger] = useReducer((a) => a + 1, 0);

    const tags = useMemo(() => {
        return analyseTags(contentSvc, content);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentSvc, content, counter]);

    const doDeleteTags = useCallback(() => {
        if (apiRef.current) {
            const selected = apiRef.current.getSelectedRows();
            const tags: string[] = [];
            selected.forEach((v) => {
                tags.push(v.label);
            });
            console.log('Deletes', tags);
            deleteTags(contentSvc, tags);
            trigger();
        }
    }, [contentSvc, apiRef]);

    const doDeleteWithTags = useCallback(() => {
        if (apiRef.current) {
            const selected = apiRef.current.getSelectedRows();
            const tags: string[] = [];
            selected.forEach((v) => {
                tags.push(v.label);
            });

            deleteWithTags(contentSvc, tags);
            trigger();
        }
    }, [contentSvc, apiRef]);

    const doMergeTags = useCallback(() => {
        if (apiRef.current) {
            const selected = apiRef.current.getSelectedRows();
            const tags: string[] = [];
            selected.forEach((v) => {
                tags.push(v.label);
            });

            mergeTags(contentSvc, tags);
            trigger();
        }
    }, [contentSvc, apiRef]);

    const doFindMore = useCallback(() => {
        if (apiRef.current && onFindMore) {
            const selected = apiRef.current.getSelectedRows();
            const tags: string[] = [];
            selected.forEach((v) => {
                tags.push(v.label);
            });
            onFindMore(tags);
        }
    }, [apiRef, onFindMore]);

    return (
        <Widget
            title={t('creator.titles.summary')}
            dataWidget="summary"
            style={{ maxWidth: '400px' }}
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
                        <MenuItem onClick={doDeleteTags}>{t('creator.actions.deleteTags')}</MenuItem>
                        <MenuItem onClick={doDeleteWithTags}>{t('creator.actions.deleteImagesWithTags')}</MenuItem>
                        <MenuItem onClick={doMergeTags}>{t('creator.actions.mergeTags')}</MenuItem>
                        <MenuItem
                            disabled={!onFindMore}
                            onClick={doFindMore}
                        >
                            {t('creator.actions.findMoreTag')}
                        </MenuItem>
                    </Menu>
                </div>
            }
        >
            <div className={style.controlsContainer}>
                <div>{t('creator.labels.count', { count: content.length })}</div>
            </div>
            <DataGrid
                apiRef={apiRef}
                rows={tags}
                columns={columns}
                checkboxSelection
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                    },
                }}
                processRowUpdate={(newRow, oldRow) => {
                    renameTag(contentSvc, oldRow.label, newRow.label);
                    return newRow;
                }}
            />
        </Widget>
    );
}
