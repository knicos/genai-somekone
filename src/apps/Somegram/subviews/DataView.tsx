import Profile from '@genaism/common/views/DataProfile/DataProfile';
import { useTranslation } from 'react-i18next';
import ViewContainer from './ViewContainer';

export function Component() {
    const { t } = useTranslation();

    return (
        <ViewContainer title={t('profile.titles.yourData')}>
            <Profile disableMenu />
        </ViewContainer>
    );
}
