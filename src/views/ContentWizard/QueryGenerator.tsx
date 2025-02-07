import { useTranslation } from 'react-i18next';
import { Widget } from '../../components/WorkflowLayout/Widget';
import QuerySource from './Sources/QuerySource';
import { Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import FileSource from './Sources/FileSource';

interface Props {
    disabled?: boolean;
}

export default function QueryGenerator({ disabled }: Props) {
    const { t } = useTranslation();
    const [tabNumber, setTabNumber] = useState(0);

    return (
        <Widget
            title={t('creator.titles.query')}
            dataWidget="query"
            style={{ maxWidth: '500px' }}
            noPadding
        >
            <Tabs
                value={tabNumber}
                onChange={(_, value) => setTabNumber(value)}
            >
                <Tab label={t('creator.titles.query')} />
                <Tab label={t('creator.titles.local')} />
            </Tabs>
            {tabNumber === 0 && <QuerySource disabled={disabled} />}
            {tabNumber === 1 && <FileSource />}
        </Widget>
    );
}
