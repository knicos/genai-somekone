import {
    Autocomplete,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import style from './style.module.css';
import { Button } from '@knicos/genai-base';
import AddIcon from '@mui/icons-material/Add';
import TagIcon from '@mui/icons-material/Tag';
import { useMemo, useState } from 'react';
import { useContentService } from '@genaism/hooks/services';
import { ContentService } from '@knicos/genai-recom';

interface Props {
    open: boolean;
    onClose: () => void;
    onAdd: (tag: string) => void;
}

function getAllTags(contentSvc: ContentService) {
    const tags = new Set<string>();
    const content = contentSvc.getAllContent();
    content.forEach((c) => {
        const meta = contentSvc.getContentMetadata(c);
        if (meta) {
            meta.labels.forEach((l) => {
                tags.add(l.label);
            });
        }
    });
    console.log(tags);
    return Array.from(tags);
}

export default function AddTagDialog({ open, onClose, onAdd }: Props) {
    const { t } = useTranslation();
    const contentSvc = useContentService();
    const [value, setValue] = useState<string | null>(null);

    const allTags = useMemo(() => getAllTags(contentSvc), [contentSvc]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle>{t('creator.titles.addTag')}</DialogTitle>
            <DialogContent>
                <div className={style.column}>
                    <Autocomplete
                        sx={{ width: '300px' }}
                        freeSolo
                        value={value}
                        onChange={(_, newValue: string | null) => {
                            setValue(newValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={t('creator.labels.addTag')}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <TagIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                        options={allTags}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        if (value && value.length > 2) {
                            onAdd(value);
                            onClose();
                        }
                    }}
                >
                    {t('creator.actions.add')}
                </Button>
                <Button
                    variant="outlined"
                    onClick={onClose}
                >
                    {t('creator.actions.cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
