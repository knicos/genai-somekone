import { ContentNodeId } from '@knicos/genai-recom';
import { Widget } from '@genaism/common/components/WorkflowLayout/Widget';
import { useTranslation } from 'react-i18next';
import { Chip, IconButton, Menu, MenuItem } from '@mui/material';
import style from '../style.module.css';
import { useRef, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { useContentService, useServiceEventMemo } from '@genaism/hooks/services';
import AddIcon from '@mui/icons-material/Add';
import { AddTagDialog } from '@genaism/apps/Dashboard/components/AddTagDialog';
import ImageGrid from '@genaism/common/components/ImageGrid/ImageGrid';

interface Props {
    images?: ContentNodeId[];
    onDeleted: () => void;
}

export default function ImageDetails({ images, onDeleted }: Props) {
    const { t } = useTranslation();
    const anchorEl = useRef<HTMLButtonElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [tagDialog, setTagDialog] = useState(false);
    const contentSvc = useContentService();

    const labels = useServiceEventMemo(
        () => {
            const labelSet = new Map<string, number>();
            if (images) {
                images.forEach((img) => {
                    const meta = contentSvc.getContentMetadata(img);
                    if (meta) {
                        meta.labels.forEach((l) => {
                            labelSet.set(l.label, (labelSet.get(l.label) || 0) + 1);
                        });
                    }
                });
            }
            return Array.from(labelSet);
        },
        [contentSvc, images],
        'contentmeta'
    );

    const imageLength = images?.length || 0;

    return (
        <Widget
            title={t('creator.titles.imageDetail')}
            dataWidget="image"
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
                        <MenuItem
                            onClick={() => {
                                if (images && images.length > 0) {
                                    images.forEach((image) => {
                                        contentSvc.clearLabels(image);
                                    });
                                }
                                setMenuOpen(false);
                            }}
                        >
                            {t('creator.actions.deleteTags')}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                if (images && images.length > 0) {
                                    images.forEach((image) => {
                                        contentSvc.removeContent(image);
                                    });
                                    onDeleted();
                                }
                                setMenuOpen(false);
                            }}
                        >
                            {t('creator.actions.deleteImage')}
                        </MenuItem>
                    </Menu>
                </div>
            }
        >
            <AddTagDialog
                open={tagDialog}
                onClose={() => setTagDialog(false)}
                onAdd={(tag) => {
                    if (images) {
                        images.forEach((image) => {
                            contentSvc.addLabel(image, tag, 1);
                        });
                    }
                }}
            />
            <div className={style.imageContainer}>
                <ImageGrid
                    images={images || []}
                    columns={imageLength === 1 ? 1 : imageLength < 5 ? 2 : 3}
                />
            </div>
            <div className={style.imageTags}>
                {labels.map((label, ix) => (
                    <Chip
                        color={label[1] === imageLength ? 'success' : 'warning'}
                        variant="outlined"
                        key={ix}
                        label={`#${label[0]}`}
                        onDelete={() => {
                            if (images) {
                                images.forEach((image) => contentSvc.removeLabel(image, label[0]));
                            }
                        }}
                    />
                ))}
                {images && (
                    <Chip
                        variant="filled"
                        color="primary"
                        label={t('creator.actions.add')}
                        icon={<AddIcon />}
                        onClick={() => setTagDialog(true)}
                    />
                )}
            </div>
        </Widget>
    );
}
