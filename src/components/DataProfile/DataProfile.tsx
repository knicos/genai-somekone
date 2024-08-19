import ImageCloud from '../ImageCloud/ImageCloud';
import { useCallback, useRef, useState } from 'react';
import ActionLogTable from '../ActionLogTable/ActionLogTable';
import style from './style.module.css';
import { UserNodeId } from '@knicos/genai-recom';
import { useUserProfile } from '@genaism/hooks/profiler';
import { useProfilerService } from '@genaism/hooks/services';
import { useActionLog } from '@genaism/hooks/actionLog';
import { IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { svgToPNG } from '@genaism/util/svgToPNG';
import { saveAs } from 'file-saver';

interface Props {
    id?: UserNodeId;
}

export default function Profile({ id }: Props) {
    const [wcSize, setWCSize] = useState(300);
    const profile = useUserProfile(id);
    const profiler = useProfilerService();
    const log = useActionLog(id || profiler.getCurrentUser());
    const svgRef = useRef<SVGSVGElement>(null);

    const doResize = useCallback((size: number) => {
        setWCSize(size);
    }, []);

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
                <div className={style.svgContainer}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="300px"
                        viewBox={`${-(wcSize * 1.67)} ${-wcSize} ${wcSize * 1.67 * 2} ${wcSize * 2}`}
                        ref={svgRef}
                    >
                        <ImageCloud
                            content={profile.affinities.contents.contents}
                            size={300}
                            onSize={doResize}
                        />
                    </svg>
                    <IconButton onClick={doSave}>
                        <DownloadIcon />
                    </IconButton>
                </div>
                <ActionLogTable
                    user={id || profiler.getCurrentUser()}
                    log={log}
                />
            </div>
        </div>
    );
}
