import {
    useRef,
    useEffect,
    useState,
    useReducer,
    WheelEvent,
    PropsWithChildren,
    PointerEvent,
    MouseEvent,
    FunctionComponent,
    KeyboardEvent,
    CSSProperties,
} from 'react';
import * as d3 from 'd3';
import style from './style.module.css';
import gsap from 'gsap';
import { GraphLink, GraphNode, InternalGraphLink, LinkStyle } from './types';
import Nodes from './Nodes';
import Lines from './Lines';
import { createSimulation } from './simulation';
import { makeLinks, makeNodes } from './utilities';
import { Mover, ZoomState, wheelZoom } from './controls';
import { NodeID } from '@knicos/genai-recom';
import { useEventListen } from '@genaism/hooks/events';
import { saveAs } from 'file-saver';
import { svgToPNG } from '@genaism/util/svgToPNG';
import ProgressDialog from '../../components/ProgressDialog/ProgressDialog';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@knicos/genai-base';
import { calcAutoCamera, calcExtents, calculateViewBox, DEFAULT_EXTENTS } from './camera';
import ZoomControls from './ZoomControls';

interface LabelProps<T extends NodeID> {
    node: GraphNode<T>;
    scale: number;
}

const BUTTON_ZOOM_SPEED = 0.2;

export interface Props<T extends NodeID> extends PropsWithChildren {
    nodes: GraphNode<T>[];
    links?: GraphLink<T, T>[];
    onSelect?: (
        node: Readonly<GraphNode<T>>,
        links: InternalGraphLink<T, T>[],
        element: SVGElement,
        parent: SVGSVGElement
    ) => void;
    onUnselect?: () => void;
    focusNode?: string;
    zoom?: number;
    center?: [number, number];
    onZoom?: (z: number) => void;
    linkScale?: number;
    showLines?: boolean;
    charge?: number;
    linkStyles?: Map<T, LinkStyle<T>>;
    defaultLinkStyle?: LinkStyle<T>;
    LabelComponent?: FunctionComponent<LabelProps<T>>;
    labelProps?: object;
    disableControls?: boolean;
    disableCenter?: boolean;
    injectStyle?: JSX.Element;
    style?: CSSProperties;
    onDragStop?: () => void;
    autoCamera?: boolean;
    onNodeDensity?: (density: number) => void;
    inert?: boolean;
}

interface InternalState {
    focusNode?: string;
}

const DEFAULT_STATE: InternalState = {};

const DEFAULT_LINK_STYLE = {
    className: style.link,
};

const MOVE_THRESHOLD = 10;
const CAMERA_DURATION = 0.3;
const REFRESH_COUNT = 30;
const MOVE_SPEED = 20;
const DENSITY_UPDATE_RATE = 50;

export default function Graph<T extends NodeID>({
    nodes,
    links,
    onSelect,
    onUnselect,
    focusNode,
    zoom = 5,
    onZoom,
    onDragStop,
    children,
    center,
    linkScale = 6,
    showLines = true,
    charge = 2,
    linkStyles,
    defaultLinkStyle = DEFAULT_LINK_STYLE,
    LabelComponent,
    labelProps,
    disableControls,
    disableCenter,
    injectStyle,
    style: cssStyle,
    autoCamera,
    onNodeDensity,
    inert,
}: Props<T>) {
    const { t } = useTranslation();
    const [saving, setSaving] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const [redraw, trigger] = useReducer((a) => ++a, 0);
    const [nodeList, setNodeList] = useState<GraphNode<T>[]>([]);
    const [linkList, setLinkList] = useState<InternalGraphLink<T, T>[]>([]);
    const nodeRef = useRef<Map<string, GraphNode<T>>>(new Map<string, GraphNode<T>>());
    const simRef = useRef<d3.Simulation<GraphNode<T>, undefined>>();
    const internalState = useRef<InternalState>(DEFAULT_STATE);
    const [actualZoom, setActualZoom] = useState<ZoomState>({
        zoom: 5,
        offsetX: 0.5,
        offsetY: 0.5,
        cx: 0,
        cy: 0,
        duration: CAMERA_DURATION,
    });
    const extents = useRef<[number, number, number, number]>([0, 0, 0, 0]);
    const mover = useRef<Mover | undefined>();
    const drawCount = useRef(0);
    useEventListen(
        () => {
            if (svgRef.current) {
                setSaving(true);
                svgToPNG(svgRef.current).then((data) => {
                    saveAs(data, 'graph.png');
                    setSaving(false);
                });
            }
        },
        [],
        'save_graph'
    );

    internalState.current.focusNode = focusNode;

    useEffect(() => {
        if (center) {
            setActualZoom((old) => ({
                ...old,
                offsetX: 0.5,
                offsetY: 0.5,
                cx: center[0],
                cy: center[1],
                duration: CAMERA_DURATION,
            }));
        }
    }, [center]);

    useEffect(() => {
        setActualZoom((old) => ({ ...old, zoom, offsetX: 0.5, offsetY: 0.5, duration: CAMERA_DURATION }));
    }, [zoom]);

    useEffect(() => {
        if (svgRef.current && inert !== undefined) {
            svgRef.current.setAttribute('inert', inert ? 'true' : 'false');
        }
    }, [inert]);

    // Make sure settings changes cause a redraw
    useEffect(() => {
        simRef.current = undefined;
        trigger();
    }, [showLines, linkScale, charge]);

    useEffect(() => {
        if (simRef.current) simRef.current.stop();

        // Force a reposition sometimes
        if (drawCount.current > REFRESH_COUNT && internalState.current.focusNode === undefined) {
            drawCount.current = 0;
            nodeRef.current.clear();
        }
        drawCount.current++;

        const newNodeRef = makeNodes<T>(nodes, nodeRef.current, internalState.current.focusNode);
        nodeRef.current = newNodeRef;
        const lnodes = Array.from(nodeRef.current).map((v) => v[1]);

        const llinks = makeLinks<T>(nodeRef.current, links);

        if (!simRef.current) {
            simRef.current = createSimulation<T>(charge, linkScale, disableCenter);
        }

        setNodeList(lnodes);

        let tickCount = 0;

        simRef.current.nodes(lnodes);
        simRef.current.force<d3.ForceLink<GraphNode<T>, InternalGraphLink<T, T>>>('link')?.links(llinks);
        simRef.current
            .on('tick', () => {
                ++tickCount;
                setNodeList([...lnodes]);
                if (autoCamera || onNodeDensity) {
                    const extents = calcExtents(lnodes);
                    if (autoCamera) {
                        setActualZoom(calcAutoCamera(extents));
                    }
                    if (onNodeDensity && tickCount === DENSITY_UPDATE_RATE) {
                        const w = extents.maxX - extents.minX;
                        const h = extents.maxY - extents.minY;
                        const density = lnodes.length / ((w / 100) * (h / 100));
                        onNodeDensity(density);
                    }
                }
            })
            .on('end', () => {});
        simRef.current.alpha(0.2).restart();

        setLinkList(llinks);
    }, [nodes, links, redraw, charge, linkScale, disableCenter, autoCamera, onNodeDensity]);

    // Animate camera motion
    useEffect(() => {
        // Ensure aspect ratio is correct
        if (svgRef.current) {
            const ratio = svgRef.current.clientHeight / svgRef.current.clientWidth;
            const h = (DEFAULT_EXTENTS.maxX - DEFAULT_EXTENTS.minX) * ratio;
            DEFAULT_EXTENTS.maxY = h / 2;
            DEFAULT_EXTENTS.minY = -h / 2;
        }
        const newExtents = calculateViewBox(DEFAULT_EXTENTS, actualZoom);
        extents.current = newExtents;
        gsap.to(svgRef.current, {
            attr: {
                viewBox: `${Math.floor(newExtents[0])} ${Math.floor(newExtents[1])} ${Math.floor(
                    newExtents[2]
                )} ${Math.floor(newExtents[3])}`,
            },
            duration: actualZoom.duration,
            //ease: 'none',
        });
        if (onZoom) onZoom(actualZoom.zoom);
    }, [actualZoom, onZoom]);

    return (
        <>
            <svg
                style={cssStyle}
                xmlns="http://www.w3.org/2000/svg"
                className={style.svg}
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="-500 -500 1000 1000"
                data-testid="graph-svg"
                tabIndex={0}
                onKeyDown={
                    !disableControls && !autoCamera
                        ? (e: KeyboardEvent<SVGSVGElement>) => {
                              if (e.key === '+' || e.key === '=') {
                                  setActualZoom((oldZoom) => ({
                                      ...oldZoom,
                                      zoom: Math.max(0.5, oldZoom.zoom - 0.2 * oldZoom.zoom),
                                  }));
                              } else if (e.key === '-') {
                                  setActualZoom((oldZoom) => ({
                                      ...oldZoom,
                                      zoom: Math.max(0.5, oldZoom.zoom + 0.2 * oldZoom.zoom),
                                  }));
                              } else if (e.key === 'ArrowLeft') {
                                  setActualZoom((oldZoom) => ({
                                      ...oldZoom,
                                      cx: oldZoom.cx - MOVE_SPEED * oldZoom.zoom,
                                  }));
                              } else if (e.key === 'ArrowRight') {
                                  setActualZoom((oldZoom) => ({
                                      ...oldZoom,
                                      cx: oldZoom.cx + MOVE_SPEED * oldZoom.zoom,
                                  }));
                              } else if (e.key === 'ArrowUp') {
                                  setActualZoom((oldZoom) => ({
                                      ...oldZoom,
                                      cy: oldZoom.cy - MOVE_SPEED * oldZoom.zoom,
                                  }));
                              } else if (e.key === 'ArrowDown') {
                                  setActualZoom((oldZoom) => ({
                                      ...oldZoom,
                                      cy: oldZoom.cy + MOVE_SPEED * oldZoom.zoom,
                                  }));
                              }
                          }
                        : undefined
                }
                onClickCapture={
                    !disableControls
                        ? (e: MouseEvent<SVGSVGElement>) => {
                              if (
                                  mover.current &&
                                  Math.max(mover.current.movementX, mover.current.movementY) > MOVE_THRESHOLD
                              ) {
                                  mover.current = undefined;
                                  e.stopPropagation();
                                  return;
                              }
                              if (onUnselect && focusNode && e.target === e.currentTarget) onUnselect();
                              mover.current = undefined;
                          }
                        : undefined
                }
                onPointerMove={
                    !disableControls && !autoCamera
                        ? (e: PointerEvent<SVGSVGElement>) => {
                              const pressed = e.pointerType === 'touch' || e.buttons === 1;
                              if (pressed && svgRef.current) {
                                  if (!mover.current)
                                      mover.current = new Mover(actualZoom, extents.current, svgRef.current);
                                  setActualZoom(mover.current.move(e));
                              }
                              /*setActualZoom((oldZoom) => {
                                  if (svgRef.current) {
                                      return pointerMove(
                                          e,
                                          oldZoom,
                                          extents.current,
                                          svgRef.current,
                                          pointerCache.current,
                                          movement.current
                                      );
                                  }
                                  return oldZoom;
                              });*/
                          }
                        : undefined
                }
                onPointerUp={
                    !disableControls
                        ? (e: PointerEvent<SVGSVGElement>) => {
                              //pointerCache.current.clear();
                              //if (e.pointerType === 'touch') movement.current = [0, 0];
                              if (e.pointerType === 'touch') mover.current = undefined;
                              if (onDragStop) onDragStop();
                          }
                        : undefined
                }
                onWheel={
                    !disableControls && !autoCamera
                        ? (e: WheelEvent<SVGSVGElement>) => {
                              setActualZoom((oldZoom) => {
                                  if (svgRef.current) {
                                      return wheelZoom(e, svgRef.current, extents.current, oldZoom);
                                  }
                                  return oldZoom;
                              });
                          }
                        : undefined
                }
            >
                {injectStyle}
                <g>
                    {showLines && (
                        <Lines
                            linkList={linkList}
                            linkStyles={linkStyles}
                            defaultLinkStyle={defaultLinkStyle}
                        />
                    )}
                    <Nodes
                        nodeList={nodeList}
                        onSelect={
                            onSelect
                                ? (node: GraphNode<T>, element: SVGElement) => {
                                      if (onSelect && svgRef.current) {
                                          if (
                                              mover.current &&
                                              Math.max(mover.current.movementX, mover.current.movementY) >
                                                  MOVE_THRESHOLD
                                          ) {
                                              mover.current = undefined;
                                              return;
                                          }
                                          mover.current = undefined;
                                          onSelect(
                                              node,
                                              linkList.filter(
                                                  (l) => l.source.id === node.id || l.target.id === node.id
                                              ),
                                              element,
                                              svgRef.current
                                          );
                                      }
                                  }
                                : undefined
                        }
                    >
                        {children}
                    </Nodes>
                    {LabelComponent &&
                        nodeList.map((n) => (
                            <LabelComponent
                                {...labelProps}
                                node={n}
                                key={n.id}
                                scale={actualZoom.zoom}
                            />
                        ))}
                </g>
            </svg>
            <ProgressDialog
                title={t('common.titles.saving', { ns: 'common' })}
                open={saving}
            />
            {nodeList.length === 0 && <Spinner />}
            {!disableControls && (
                <ZoomControls
                    onZoomIn={() => {
                        const newZoom = Math.max(0.5, actualZoom.zoom - BUTTON_ZOOM_SPEED * actualZoom.zoom);
                        setActualZoom((oldZoom) => ({ ...oldZoom, zoom: newZoom }));
                    }}
                    onZoomOut={() => {
                        const newZoom = Math.max(0.5, actualZoom.zoom + BUTTON_ZOOM_SPEED * actualZoom.zoom);
                        setActualZoom((oldZoom) => ({ ...oldZoom, zoom: newZoom }));
                    }}
                />
            )}
        </>
    );
}
