import { useServices } from '@genaism/hooks/services';
import style from './style.module.css';
import { useMemo } from 'react';
import ImageGrid from '../ImageGrid/ImageGrid';
import { useUserProfile } from '@genaism/hooks/profiler';
import { UserNodeId } from '@knicos/genai-recom';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import { useTranslation } from 'react-i18next';

interface Props {
    id?: UserNodeId;
}

export default function PersonalProfile({ id }: Props) {
    const { t } = useTranslation();
    const { profiler: profilerSvc, content: contentSvc } = useServices();
    const profile = useUserProfile(id);

    const images = useMemo(() => profilerSvc.getUserContent(profile.id), [profilerSvc, profile]);

    return (
        <div className={style.profileContainer}>
            <div className={style.innerContainer}>
                <div className={style.headerBar}>
                    <div className={style.avatarBlock}>
                        {profile.image && (
                            <img
                                width={80}
                                height={80}
                                src={contentSvc.getContentData(profile.image)}
                                alt="Profile picture"
                            />
                        )}
                        <div className={style.statsBlock}>
                            <div className={style.statsNumber}>{images.length}</div>
                            <div>{t('profile.labels.posts')}</div>
                        </div>
                        <div className={style.statsBlock}>
                            <div className={style.statsNumber}>{profile.followerCount || 0}</div>
                            <div>{t('profile.labels.followers')}</div>
                        </div>
                        <div className={style.statsBlock}>
                            <div className={style.statsNumber}>{profile.followsCount || 0}</div>
                            <div>{t('profile.labels.follows')}</div>
                        </div>
                    </div>
                    <h2>{profile.name}</h2>
                </div>
                <ImageGrid images={images} />
                {images.length === 0 && (
                    <div
                        className={style.noPosts}
                        data-testid="noposts-box"
                    >
                        <div className={style.noPostsIcon}>
                            <PhotoCameraOutlinedIcon fontSize="inherit" />
                        </div>
                        <div className={style.noPostsMain}>{t('profile.labels.yourPosts')}</div>
                        <div className={style.noPostsDesc}>{t('profile.labels.missingPosts')}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
