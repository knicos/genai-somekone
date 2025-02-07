import style from './style.module.css';
import { UserNodeId } from '@knicos/genai-recom';
import { useUserProfile } from '@genaism/hooks/profiler';
import { useProfilerService } from '@genaism/hooks/services';
import { useActionLog } from '@genaism/hooks/actionLog';
import { saveAs } from 'file-saver';
import PrintButton from '@genaism/components/PrintButton/PrintButton';
import { DataProfilePure } from './DataProfilePure';
import { useMemo, useRef } from 'react';
import { IconMenuInline, IconMenuItem } from '@genaism/components/IconMenu';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { appConfiguration } from '@genaism/state/settingsState';
import { svgToPNG } from '@genaism/util/svgToPNG';
import { IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

interface Props {
    id?: UserNodeId;
    disableMenu?: boolean;
    noImageCloud?: boolean;
}

export default function Profile({ id, disableMenu, noImageCloud }: Props) {
    const { t } = useTranslation();
    const profile = useUserProfile(id);
    const profiler = useProfilerService();
    const log = useActionLog(id || profiler.getCurrentUser());
    const appConfig = useRecoilValue(appConfiguration);
    const svgRef = useRef<SVGSVGElement>(null);

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

    const doSave = () => {
        if (svgRef.current) {
            svgToPNG(svgRef.current, 4).then((data) => {
                saveAs(data, `imagecloud_${profile.name}.png`);
            });
        }
    };

    return (
        <div className={style.outerContainer}>
            <div
                className={style.container}
                tabIndex={0}
            >
                {!appConfig?.disablePrinting && !disableMenu && (
                    <IconMenuInline>
                        <IconMenuItem tooltip={t('profile.actions.print')}>
                            <PrintButton
                                ariaLabel={t('profile.actions.print')}
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
                        <IconMenuItem tooltip={t('profile.actions.download')}>
                            <IconButton
                                onClick={doSave}
                                color="inherit"
                                aria-label={t('profile.actions.download')}
                            >
                                <DownloadIcon />
                            </IconButton>
                        </IconMenuItem>
                    </IconMenuInline>
                )}
                <DataProfilePure
                    ref={svgRef}
                    content={noImageCloud ? undefined : weightedImages}
                    log={actionLog}
                />
            </div>
        </div>
    );
}
