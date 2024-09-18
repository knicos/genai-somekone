import { useEffect, useState } from 'react';
import ImageGrid from '../ImageGrid/ImageGrid';
import { ContentNodeId } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';
import style from './style.module.css';
import BrowserMenu from './BrowserMenu';

export default function ContentBrowser() {
    const [images, setImages] = useState<ContentNodeId[]>([]);
    const contentSvc = useContentService();
    const [selected, setSelected] = useState(-1);
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
        <>
            <BrowserMenu
                hasSelected={selected >= 0}
                onDelete={() => {
                    const img = images[selected];
                    if (img) {
                        contentSvc.removeContent(img);
                        setTags((old) => [...old]);
                    }
                }}
                onSearch={(q: string) => {
                    const rawtags = q.split(/[ ,]+/gi);
                    const selectedTags = rawtags.map((t) => t.trim()).filter((t) => t.length > 0);
                    console.log('TAGS', selectedTags);
                    setTags(selectedTags);
                }}
            />
            <div className={style.container}>
                <ImageGrid
                    images={images}
                    columns={5}
                    selected={selected}
                    onSelect={(ix) => setSelected((old) => (old === ix ? -1 : ix))}
                />
            </div>
        </>
    );
}
