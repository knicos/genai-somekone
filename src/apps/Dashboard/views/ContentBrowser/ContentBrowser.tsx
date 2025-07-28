import { useEffect, useState } from 'react';
import ImageGrid from '@genaism/common/components/ImageGrid/ImageGrid';
import { ContentNodeId } from '@genai-fi/recom';
import { useContentService } from '@genaism/hooks/services';
import style from './style.module.css';
import BrowserMenu from './BrowserMenu';
import i18n from '@genaism/i18n';
import { I18nextProvider } from 'react-i18next';

export default function ContentBrowser() {
    const [images, setImages] = useState<ContentNodeId[]>([]);
    const contentSvc = useContentService();
    const [selected, setSelected] = useState<ContentNodeId | undefined>();
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        if (tags.length === 0) {
            setImages(contentSvc.getAllContent());
        } else {
            const tagSet = new Set(tags);
            const allContent = contentSvc.getAllContent();
            const filtered = allContent.filter((c) => {
                const meta = contentSvc.getContentMetadata(c);
                if (meta) {
                    for (let i = 0; i < meta.labels.length; ++i) {
                        if (tagSet.has(meta.labels[i].label)) {
                            return true;
                        }
                    }
                }
                return false;
            });
            setImages(filtered);
        }
    }, [contentSvc, tags]);

    return (
        <I18nextProvider
            i18n={i18n}
            defaultNS="tools"
        >
            <BrowserMenu
                hasSelected={selected !== undefined}
                onDelete={() => {
                    const img = selected;
                    if (img) {
                        contentSvc.removeContent(img);
                        setTags((old) => [...old]);
                    }
                }}
                onSearch={(q: string) => {
                    const rawtags = q.split(/[ ,]+/gi);
                    const selectedTags = rawtags.map((t) => t.trim()).filter((t) => t.length > 0);
                    setTags(selectedTags);
                }}
            />
            <div className={style.container}>
                <ImageGrid
                    images={images}
                    columns={5}
                    selected={selected}
                    onSelect={(id) => setSelected((old) => (old === id ? undefined : id))}
                />
            </div>
        </I18nextProvider>
    );
}
