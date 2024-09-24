import { useContentService, useServiceEventMemo } from '@genaism/hooks/services';
import { Autocomplete, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
    value: string | null;
    onChange: (value: string | null) => void;
}

export default function ClusterSelect({ value, onChange }: Props) {
    const { t } = useTranslation();
    const contentSvc = useContentService();

    const allClusters = useServiceEventMemo(
        () => {
            let maxCluster = 0;
            const content = contentSvc.getAllContent();
            content.forEach((c) => {
                const meta = contentSvc.getContentMetadata(c);
                if (meta && meta.cluster !== undefined) {
                    maxCluster = Math.max(maxCluster, meta.cluster);
                }
            });
            const result: string[] = [];
            for (let i = 0; i <= maxCluster; ++i) {
                result.push(`Cluster-${i}`);
            }
            console.log('Clusters', result);
            return result;
        },
        [contentSvc],
        'contentmeta'
    );

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
                    label={t('creator.labels.selectCluster')}
                    size="small"
                />
            )}
            options={allClusters}
        />
    );
}
