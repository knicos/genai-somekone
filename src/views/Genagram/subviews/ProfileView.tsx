import Profile from '@genaism/components/UserProfile/UserProfile';
import { useTranslation } from 'react-i18next';
import ViewContainer from './ViewContainer';

export function Component() {
    const { t } = useTranslation();

    return (
        <ViewContainer title={t('profile.titles.yourProfile')}>
            <Profile />
        </ViewContainer>
    );
}
