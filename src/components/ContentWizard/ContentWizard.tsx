import style from './style.module.css';
import QueryGenerator from './QueryGenerator';
import { useState } from 'react';
import { Options } from '@genaism/services/imageSearch/hook';
import CaptureProcess from './CaptureProcess';
import ContentSummary from './ContentSummary';
import ResetContent from './ResetContent';
import EmbeddingTool from './EmbeddingTool';

export default function ContentWizard() {
    const [query, setQuery] = useState<string | undefined>();
    const [options, setOptions] = useState<Options>();

    return (
        <div className={style.container}>
            <h1>Content Creator</h1>
            <ResetContent />
            <QueryGenerator
                disabled={!!query && !!options}
                onQuery={(q: string, options: Options) => {
                    setQuery(q);
                    setOptions(options);
                }}
            />
            {query && options && (
                <CaptureProcess
                    query={query}
                    options={options}
                    onComplete={() => {}}
                />
            )}
            <ContentSummary />
            <EmbeddingTool />
        </div>
    );
}
