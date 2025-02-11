import { useTranslation } from 'react-i18next';
import RecommendationsProfile from '@genaism/common/views/RecommendationsProfile/RecommendationsProfile';
import ViewContainer from './ViewContainer';

export function Component() {
    const { t } = useTranslation();

    return (
        <ViewContainer title={t('profile.titles.yourRecommendations')}>
            <RecommendationsProfile />
        </ViewContainer>
    );
}
