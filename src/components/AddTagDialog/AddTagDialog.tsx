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
import { useMemo, useRef, useState } from 'react';
import { useContentService } from '@genaism/hooks/services';

interface Props {
    open: boolean;
    onClose: () => void;
    onAdd: (tag: string) => void;
}

export default function AddTagDialog({ open, onClose, onAdd }: Props) {
    const { t } = useTranslation();
    const contentSvc = useContentService();
    const [value, setValue] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const allTags = useMemo(() => contentSvc.getAllLabels(), [contentSvc]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle>{t('creator.titles.addTag')}</DialogTitle>
            <DialogContent>
                <div className={style.column}>
                    <Autocomplete
                        selectOnFocus
                        sx={{ width: '300px' }}
                        freeSolo
                        value={value}
                        onChange={(_, newValue: string | null) => {
                            setValue(newValue);
                            if (newValue) {
                                onAdd(newValue);
                                onClose();
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                inputRef={inputRef}
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
                        const v = inputRef.current?.value || '';
                        if (v.length > 2) {
                            onAdd(v);
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
