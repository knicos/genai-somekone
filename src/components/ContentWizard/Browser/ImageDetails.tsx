import { ContentNodeId } from '@knicos/genai-recom';
import { Widget } from '../Widget';
import { useTranslation } from 'react-i18next';
import { Chip, IconButton, Menu, MenuItem } from '@mui/material';
import style from '../style.module.css';
import { useContent } from '@genaism/hooks/content';
import { useRef, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { useContentService } from '@genaism/hooks/services';
import AddIcon from '@mui/icons-material/Add';
import AddTagDialog from '@genaism/components/AddTagDialog/AddTagDialog';

interface Props {
    image?: ContentNodeId;
    onDeleted: () => void;
}

export default function ImageDetails({ image, onDeleted }: Props) {
    const { t } = useTranslation();
    const anchorEl = useRef<HTMLButtonElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [tagDialog, setTagDialog] = useState(false);
    const contentSvc = useContentService();

    const [meta, data] = useContent(image);

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
                                if (image) {
                                    contentSvc.removeContent(image);
                                    onDeleted();
                                }
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
                    if (image) {
                        contentSvc.addLabel(image, tag, 1);
                    }
                }}
            />
            <div className={style.imageContainer}>
                {image && (
                    <img
                        src={data}
                        width="300px"
                        height="300px"
                        alt=""
                    />
                )}
                {!image && <div style={{ width: '300px', height: '300px', background: '#ddd' }} />}
            </div>
            <div className={style.imageTags}>
                {meta &&
                    meta.labels.map((label, ix) => (
                        <Chip
                            variant="outlined"
                            key={ix}
                            label={`#${label.label}`}
                            onDelete={() => {
                                if (image) contentSvc.removeLabel(image, label.label);
                            }}
                        />
                    ))}
                {meta && (
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
