import { useContentService, useServiceEventMemo } from '@genaism/hooks/services';
import { Autocomplete, InputAdornment, TextField } from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';
import { useTranslation } from 'react-i18next';

interface Props {
    value: string | null;
    onChange: (value: string | null) => void;
}

export default function TagSelect({ value, onChange }: Props) {
    const { t } = useTranslation();
    const contentSvc = useContentService();
    const allTags = useServiceEventMemo(() => contentSvc.getAllLabels(), [contentSvc], 'contentmeta');

    return (
        <Autocomplete
            selectOnFocus
            sx={{ width: '200px' }}
            value={value}
            onChange={(_, newValue: string | null) => {
                onChange(newValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={t('creator.labels.selectTag')}
                    size="small"
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <InputAdornment position="start">
                                <TagIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
            )}
            options={allTags}
        />
    );
}
