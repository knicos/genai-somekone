import { useTranslation } from 'react-i18next';
import PostContent from '@genaism/apps/Somegram/views/PostContent/PostContent';
import ViewContainer from './ViewContainer';

export function Component() {
    const { t } = useTranslation();

    return (
        <ViewContainer title={t('profile.titles.newPost')}>
            <PostContent />
        </ViewContainer>
    );
}
