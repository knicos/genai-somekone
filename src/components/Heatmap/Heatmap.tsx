import { Fragment, MouseEvent, PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Spinner } from '@knicos/genai-base';
import style from './style.module.css';
import { normWeights } from '@genaism/util/weights';
import { heatmapGrid } from './grid';
import { ContentNodeId, WeightedNode } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';
import HeatLabel from './HeatLabel';
import { useEventListen } from '@genaism/hooks/events';
import { svgToPNG } from '@genaism/util/svgToPNG';
import { saveAs } from 'file-saver';
import ProgressDialog from '../ProgressDialog/ProgressDialog';
import { useTranslation } from 'react-i18next';

interface Props {
    data: WeightedNode<ContentNodeId>[];
    dimensions: number;
    busy?: boolean;
    label?: string;
    invert?: boolean;
}

/*function heatMapColorforValue(value: number) {
    const iv2 = (1 - value) * (1 - value);
    const h = iv2 * 240;
    return 'hsl(' + h + ', 100%, 50%)';
}*/

const ZOOM_SCALE = 60;
const MIN_OPACITY = 0.1;

export default function Heatmap({ data, dimensions, busy, label, invert }: Props) {
    const { t } = useTranslation();
    const [grid, setGrid] = useState<(ContentNodeId | null)[][]>();
    const svgRef = useRef<SVGSVGElement>(null);
    const [zoom, setZoom] = useState(false);
    const content = useContentService();
    const [saving, setSaving] = useState(false);

    const loading = data.length === 0 || !grid || busy;

    const size = 200 / dimensions;

    const normData = useMemo(() => (data ? normWeights(data) : undefined), [data]);
    const heats = useMemo(() => {
        const newHeats = new Map<ContentNodeId, number>();
        normData?.forEach((n) => {
            newHeats.set(n.id, n.weight);
        });
        return newHeats;
    }, [normData]);

    useEffect(() => {
        if (normData && normData.length > 0) {
            setGrid((oldGrid) =>
                oldGrid && oldGrid.length === dimensions
                    ? oldGrid
                    : heatmapGrid(
                          content,
                          normData.map((n) => n.id),
                          dimensions
                      )
            );
        }
    }, [normData, dimensions, content]);

    useEffect(() => {
        if (!zoom) {
            if (svgRef.current) {
                svgRef.current.setAttribute('viewBox', '0 0 200 200');
            }
        }
    }, [zoom]);

    useEventListen('save_heat', () => {
        if (svgRef.current) {
            setSaving(true);
            svgToPNG(svgRef.current, 8, 0).then((data) => {
                saveAs(data, label ? `heatmap_${label}.png` : 'heatmap.png');
                setSaving(false);
            });
        }
    });

    return (
        <div className={style.container}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={style.svg}
                width="100%"
                height="100%"
                viewBox="0 0 200 200"
                ref={svgRef}
                onContextMenu={(e: MouseEvent) => e.preventDefault()}
                onPointerDown={(e: PointerEvent) => {
                    setZoom(true);
                    if (svgRef.current) {
                        const bounds = svgRef.current.getBoundingClientRect();
                        const x = ((e.clientX - bounds.left) / bounds.width) * 200;
                        const y = ((e.clientY - bounds.top) / bounds.height) * 200;
                        const l = x - ZOOM_SCALE / 2;
                        const t = y - ZOOM_SCALE / 2;
                        svgRef.current.setAttribute('viewBox', `${l} ${t} ${ZOOM_SCALE} ${ZOOM_SCALE}`);
                    }
                }}
                onPointerUp={() => setZoom(false)}
                onPointerLeave={() => setZoom(false)}
                onPointerMove={(e: PointerEvent) => {
                    if (svgRef.current && zoom) {
                        const bounds = svgRef.current.getBoundingClientRect();
                        const x = ((e.clientX - bounds.left) / bounds.width) * 200;
                        const y = ((e.clientY - bounds.top) / bounds.height) * 200;
                        const l = x - ZOOM_SCALE / 2;
                        const t = y - ZOOM_SCALE / 2;
                        svgRef.current.setAttribute('viewBox', `${l} ${t} ${ZOOM_SCALE} ${ZOOM_SCALE}`);
                    }
                }}
            >
                <g>
                    {grid?.map((row, ix) => (
                        <g key={ix}>
                            {row.map((img, ix2) => {
                                const heat = img ? (heats.get(img) || 0) * (1 - MIN_OPACITY) + MIN_OPACITY : 0;
                                return img ? (
                                    <Fragment key={ix2}>
                                        <image
                                            data-testid="heatmap-image"
                                            href={content.getContentData(img)}
                                            width={size}
                                            height={size}
                                            x={ix2 * size}
                                            y={ix * size}
                                        />
                                        <rect
                                            x={ix2 * size}
                                            y={ix * size}
                                            width={size}
                                            height={size}
                                            opacity={invert ? heat : 1 - heat}
                                            fill="white"
                                            stroke="white"
                                            strokeWidth={0.5}
                                        />
                                    </Fragment>
                                ) : null;
                            })}
                        </g>
                    ))}
                </g>
            </svg>
            {label && <HeatLabel label={label} />}
            {loading && (
                <div
                    className={style.loading}
                    data-testid="loading-heatmap"
                >
                    <Spinner size="large" />
                </div>
            )}
            <ProgressDialog
                title={t('dashboard.titles.saving')}
                open={saving}
            />
        </div>
    );
}
