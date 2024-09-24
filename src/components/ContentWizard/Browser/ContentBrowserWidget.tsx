import { useTranslation } from 'react-i18next';
import { Widget } from '../Widget';
import ImageGrid from '../../ImageGrid/ImageGrid';
import { useEffect, useRef, useState } from 'react';
import { ContentNodeId } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';
import ImageDetails from './ImageDetails';
import style from '../style.module.css';
import { useAllContent } from '@genaism/hooks/content';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export default function ContentBrowserWidget() {
    const { t } = useTranslation();
    const [images, setImages] = useState<ContentNodeId[]>([]);
    const contentSvc = useContentService();
    const [selected, setSelected] = useState<ContentNodeId[]>([]);
    // const [tags, setTags] = useState<string[]>([]);
    const allContent = useAllContent();
    const anchorEl = useRef<HTMLButtonElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setImages(allContent);
    }, [contentSvc, allContent]);

    return (
        <div
            className={style.widgetColumn}
            data-widget="container"
        >
            <Widget
                title={t('creator.titles.browser')}
                dataWidget="browser"
                style={{ maxWidth: '500px' }}
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
