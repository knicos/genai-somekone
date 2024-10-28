import style from './style.module.css';
import { UserNodeId } from '@knicos/genai-recom';
import { useUserProfile } from '@genaism/hooks/profiler';
import { useProfilerService } from '@genaism/hooks/services';
import { useActionLog } from '@genaism/hooks/actionLog';
import { saveAs } from 'file-saver';
import PrintButton from '@genaism/components/PrintButton/PrintButton';
import DataProfileRaw from './DataProfilePure';
import { useMemo } from 'react';
import { IconMenuInline, IconMenuItem } from '@genaism/components/IconMenu';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { appConfiguration } from '@genaism/state/settingsState';

interface Props {
    id?: UserNodeId;
}

export default function Profile({ id }: Props) {
    const { t } = useTranslation();
    const profile = useUserProfile(id);
    const profiler = useProfilerService();
    const log = useActionLog(id || profiler.getCurrentUser());
    const appConfig = useRecoilValue(appConfiguration);

    const weightedImages = useMemo(
        () =>
            profile.affinities.contents.contents.map((c) => ({
                weight: c.weight,
                image: profiler.content.getContentData(c.id) || '',
            })),
        [profile, profiler]
    );

    const actionLog = useMemo(
        () =>
            log.map((l) => ({
                entry: l,
                content: l.id ? profiler.content.getContentData(l.id) || '' : '',
            })),
        [log, profiler]
    );

    return (
        <div className={style.outerContainer}>
            <div
                className={style.container}
                tabIndex={0}
            >
                {!appConfig?.disablePrinting && (
                    <IconMenuInline>
                        <IconMenuItem tooltip={t('profile.actions.print')}>
                            <PrintButton
                                data={() => {
                                    return {
                                        title: profile.name,
                                        weightedImages,
                                        actionLog,
                                    };
                                }}
                                path="data"
                            />
                        </IconMenuItem>
                    </IconMenuInline>
                )}
                <DataProfileRaw
                    content={weightedImages}
                    log={actionLog}
                    onSave={(data: string) => saveAs(data, `imagecloud_${profile.name}.png`)}
                />
            </div>
        </div>
    );
}
