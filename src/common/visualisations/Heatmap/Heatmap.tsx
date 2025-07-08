import { Fragment, MouseEvent, PointerEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Spinner } from '@genai-fi/base';
import style from './style.module.css';
import { zNormWeights } from '@genaism/util/weights';
import { ContentNodeId, WeightedNode } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';
import HeatLabel from './HeatLabel';
import { useEventListen } from '@genaism/hooks/events';
import { svgToPNG } from '@genaism/util/svgToPNG';
import { saveAs } from 'file-saver';
import ProgressDialog from '@genaism/common/components/ProgressDialog/ProgressDialog';
import { useTranslation } from 'react-i18next';
import MapService from '@genaism/services/map/MapService';

interface Props {
    data: WeightedNode<ContentNodeId>[];
    dimensions?: number;
    busy?: boolean;
    label?: string;
    invert?: boolean;
    deviationFactor?: number;
    mapService?: MapService;
}

/*function heatMapColorforValue(value: number) {
    const iv2 = (1 - value) * (1 - value);
    const h = iv2 * 240;
    return 'hsl(' + h + ', 100%, 50%)';
}*/

const ZOOM_SCALE = 40;
const MIN_OPACITY = 0.1;

export default function Heatmap({ data, dimensions, busy, label, invert, mapService, deviationFactor = 1 }: Props) {
    const { t } = useTranslation();
    const [agrid, setGrid] = useState<(ContentNodeId | null)[][]>();
    const svgRef = useRef<SVGSVGElement>(null);
    const [zoom, setZoom] = useState(false);
    const content = useContentService();
    const [saving, setSaving] = useState(false);
    const [mapper, setMapper] = useState<MapService>();
    const id = useId();

    const loading = data.length === 0 || !agrid || busy;
    const adim = dimensions || Math.floor(Math.sqrt(content.getAllContent().length));

    useEffect(() => {
        if (mapService) {
            setMapper(mapService);
        } else {
            setMapper(new MapService(content, { dataSetSize: 1, dim: adim }));
        }
    }, [mapService, content, adim]);

    useEffect(() => {
        if (mapper) {
            const h = (grid: ContentNodeId[][]) => {
                setGrid(grid);
            };
            if (mapper.grid && mapper.grid.length > 0) {
                setGrid(mapper.grid);
            }
            mapper.on('grid', h);
            return () => {
                mapper.off('grid', h);
            };
        }
    }, [mapper]);

    const size = 200 / adim;

    const normData = useMemo(() => (data ? zNormWeights(data, deviationFactor) : undefined), [data, deviationFactor]);
    const heats = useMemo(() => {
        const newHeats = new Map<ContentNodeId, number>();
        normData?.forEach((n) => {
            newHeats.set(n.id, n.weight);
        });
        return newHeats;
    }, [normData]);

    useEffect(() => {
        if (mapper && normData && normData.length > 0) {
            mapper.addData(id, normData);
        }
    }, [normData, id, mapper]);

    useEffect(() => {
        if (!zoom) {
            if (svgRef.current) {
                svgRef.current.setAttribute('viewBox', '0 0 200 200');
            }
        }
    }, [zoom]);

    useEventListen(
        () => {
            if (svgRef.current) {
                setSaving(true);
                svgToPNG(svgRef.current, 8, 0).then((data) => {
                    saveAs(data, label ? `heatmap_${label}.png` : 'heatmap.png');
                    setSaving(false);
                });
            }
        },
        [label],
        'save_heat'
    );

    return (
        <div className={style.container}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={style.svg}
                width="100%"
                height="100%"
                viewBox="0 0 200 200"
                ref={svgRef}
                data-testid="heatmap-svg"
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
                    {agrid?.map((row, ix) => (
                        <g key={ix}>
                            {row.map((img, ix2) => {
                                const heat = img ? (heats.get(img) || 0) * (1 - MIN_OPACITY) + MIN_OPACITY : 0;
                                return img ? (
                                    <Fragment key={ix2}>
                                        <image
                                            data-testid="heatmap-image"
                                            href={content.getContentData(img, true)}
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
                title={t('common.titles.saving', { ns: 'common' })}
                open={saving}
            />
        </div>
    );
}
