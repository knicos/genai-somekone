import { useTranslation } from 'react-i18next';
import { Widget } from '../Widget';
import ImageGrid from '../../ImageGrid/ImageGrid';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ContentNodeId } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';
import ImageDetails from './ImageDetails';
import style from '../style.module.css';
import { useAllContent } from '@genaism/hooks/content';
import { FormControl, IconButton, InputLabel, Menu, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TagSelect from './TagSelect';
import ClusterSelect from './ClusterSelect';

type FilterType = 'none' | 'tag' | 'cluster' | 'notag';

export default function ContentBrowserWidget() {
    const { t } = useTranslation();
    const [images, setImages] = useState<ContentNodeId[]>([]);
    const contentSvc = useContentService();
    const [selected, setSelected] = useState<ContentNodeId[]>([]);
    // const [tags, setTags] = useState<string[]>([]);
    const allContent = useAllContent();
    const anchorEl = useRef<HTMLButtonElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [filter, setFilter] = useState<FilterType>('none');
    const [tag, setTag] = useState<string | null>(null);
    const [cluster, setCluster] = useState<string | null>(null);

    useEffect(() => {
        if (filter === 'none') {
            setImages(allContent);
        } else if (filter === 'tag') {
            if (tag === null) {
                setImages(allContent);
            } else {
                setImages(
                    allContent.filter((content) => {
                        const meta = contentSvc.getContentMetadata(content);
                        return meta && meta.labels.map((l) => l.label).includes(tag);
                    })
                );
            }
        } else if (filter === 'notag') {
            setImages(
                allContent.filter((content) => {
                    const meta = contentSvc.getContentMetadata(content);
                    return meta && meta.labels.length === 0;
                })
            );
        } else if (filter === 'cluster') {
            setImages(
                allContent.filter((content) => {
                    const meta = contentSvc.getContentMetadata(content);
                    return meta && `Cluster-${meta.cluster}` === cluster;
                })
            );
        }
    }, [contentSvc, allContent, filter, tag, cluster]);

    const doFilter = useCallback((event: SelectChangeEvent) => {
        setFilter(event.target.value as FilterType);
    }, []);

    return (
        <div
            className={style.widgetColumn}
            data-widget="container"
        >
            <Widget
                title={t('creator.titles.browser')}
                dataWidget="browser"
                style={{ width: '500px' }}
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
                            <MenuItem
                                onClick={() => {
                                    setSelected([]);
                                    setMenuOpen(false);
                                }}
                            >
                                {t('creator.actions.unselectAll')}
                            </MenuItem>
                        </Menu>
                    </div>
                }
            >
                <div className={style.controls}>
                    <FormControl>
                        <InputLabel id="browser-filter-select">{t('creator.labels.filter')}</InputLabel>
                        <Select
                            labelId="browser-filter-select"
                            value={filter}
                            label={t('creator.labels.filter')}
                            onChange={doFilter}
                            size="small"
                        >
                            <MenuItem value={'none'}>{t('creator.labels.noFilter')}</MenuItem>
                            <MenuItem value="tag">{t('creator.labels.byTag')}</MenuItem>
                            <MenuItem value="cluster">{t('creator.labels.byCluster')}</MenuItem>
                            <MenuItem value="notag">{t('creator.labels.noTags')}</MenuItem>
                        </Select>
                    </FormControl>
                    {filter === 'tag' && (
                        <TagSelect
                            value={tag}
                            onChange={setTag}
                        />
                    )}
                    {filter === 'cluster' && (
                        <ClusterSelect
                            value={cluster}
                            onChange={setCluster}
                        />
                    )}
                </div>
                <div style={{ width: '100%', height: '500px', overflowY: 'scroll' }}>
                    <ImageGrid
                        images={images}
                        columns={4}
                        selected={selected}
                        onSelect={(id) =>
                            setSelected((old) => (old.includes(id) ? old.filter((c) => c !== id) : [...old, id]))
                        }
                    />
                </div>
            </Widget>
            <ImageDetails
                images={selected.length > 0 ? selected : undefined}
                onDeleted={() => {
                    setSelected([]);
                    setImages(contentSvc.getAllContent());
                }}
            />
        </div>
    );
}
