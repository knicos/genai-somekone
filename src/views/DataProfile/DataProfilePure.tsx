import { ActionLogTable, ContentLogEntry } from '@genaism/components/ActionLogTable';
import ImageCloud, { WeightedImage } from '../../visualisations/ImageCloud/ImageCloud';
import style from './style.module.css';
import { ForwardedRef, forwardRef, useCallback, useState } from 'react';

interface Props {
    log: ContentLogEntry[];
    content: WeightedImage[];
    fixedSize?: number;
    cloudSize?: number;
}

export const DataProfilePure = forwardRef(function DataProfilePure(
    { cloudSize = 300, log, content, fixedSize }: Props,
    ref: ForwardedRef<SVGSVGElement>
) {
    const [wcSize, setWCSize] = useState(cloudSize);
    const doResize = useCallback((size: number) => {
        setWCSize(size);
    }, []);

    return (
        <>
            <div className={style.svgContainer}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height={`${cloudSize}px`}
                    viewBox={`${-(wcSize * 1.67)} ${-wcSize} ${wcSize * 1.67 * 2} ${wcSize * 2}`}
                    ref={ref}
                >
                    <ImageCloud
                        content={content}
                        size={cloudSize}
                        onSize={doResize}
                    />
                </svg>
            </div>
            <ActionLogTable
                log={log}
                fixedSize={fixedSize}
            />
        </>
    );
});
