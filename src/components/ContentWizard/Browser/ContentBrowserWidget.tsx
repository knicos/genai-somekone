import { useTranslation } from 'react-i18next';
import { Widget } from '../Widget';
import ImageGrid from '../../ImageGrid/ImageGrid';
import { useEffect, useState } from 'react';
import { ContentNodeId } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';
import ImageDetails from './ImageDetails';
import style from '../style.module.css';

export default function ContentBrowserWidget() {
    const { t } = useTranslation();
    const [images, setImages] = useState<ContentNodeId[]>([]);
    const contentSvc = useContentService();
    const [selected, setSelected] = useState(-1);
    // const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        setImages(contentSvc.getAllContent());
    }, [contentSvc]);

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
            >
                <div style={{ width: '100%', height: '500px', overflowY: 'scroll' }}>
                    <ImageGrid
                        images={images}
                        columns={4}
                        selected={selected}
                        onSelect={(ix) => setSelected((old) => (old === ix ? -1 : ix))}
                    />
                </div>
            </Widget>
            <ImageDetails
                image={selected >= 0 ? images[selected] : undefined}
                onDeleted={() => {
                    setSelected(-1);
                    setImages(contentSvc.getAllContent());
                }}
            />
        </div>
    );
}
