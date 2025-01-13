import { LargeButton } from '@knicos/genai-base';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import uploadImages from '../upload';
import { useContentService } from '@genaism/hooks/services';

export default function FileSource() {
    const { t } = useTranslation();
    const contentSvc = useContentService();
    const fileRef = useRef<HTMLInputElement>(null);
    return (
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
                type="file"
                multiple
                ref={fileRef}
                accept=".png,.jpg,.jpeg"
            />
            <LargeButton
                variant="contained"
                onClick={() => {
                    if (fileRef.current) {
                        uploadImages(contentSvc, Array.from(fileRef.current.files || []));
                        fileRef.current.value = '';
                    }
                }}
                color="secondary"
            >
                {t('creator.actions.addImages')}
            </LargeButton>
        </div>
    );
}
