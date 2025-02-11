import Profile from '@genaism/common/views/UserProfile/UserProfile';
import { useTranslation } from 'react-i18next';
import ViewContainer from './ViewContainer';

export function Component() {
    const { t } = useTranslation();

    return (
        <ViewContainer title={t('profile.titles.yourProfile')}>
            <Profile disableMenu />
        </ViewContainer>
    );
}
