import { InternalGraphLink, LinkStyle } from './types';
import style from './style.module.css';
import colours from '@genai-fi/base/css/colours.module.css';
import { NodeID } from '@genai-fi/recom';

interface Props<T extends NodeID> {
    linkList: InternalGraphLink<T, T>[];
    linkStyles?: Map<T, LinkStyle<T>>;
    defaultLinkStyle?: LinkStyle<T>;
}

function round2(v?: number) {
    return v ? Math.round(v * 100) / 100 : v;
}

export default function Lines<T extends NodeID>({ linkList, linkStyles, defaultLinkStyle }: Props<T>) {
    return (
        <g>
            {linkList.map((l, ix) => {
                if (l.target.id === ('dummy' as T)) return null;
                const styles = linkStyles?.get(l.source.id) || linkStyles?.get(l.target.id) || defaultLinkStyle;
                return (
                    <line
                        className={
                            typeof styles?.className === 'function'
                                ? styles.className(l)
                                : styles?.className || style.link
                        }
                        key={ix}
                        x1={Math.floor(l.source.x || 0)}
                        y1={Math.floor(l.source.y || 0)}
                        x2={Math.floor(l.target.x || 0)}
                        y2={Math.floor(l.target.y || 0)}
                        opacity={round2(typeof styles?.opacity === 'function' ? styles.opacity(l) : styles?.opacity)}
                        strokeWidth={Math.ceil(
                            (typeof styles?.width === 'function' ? styles.width(l) : styles?.width) || 0
                        )}
                        stroke={
                            typeof styles?.colour === 'function' ? styles.colour(l) : styles?.colour || colours.primary
                        }
                        data-testid={`graph-link-${ix}`}
                    />
                );
            })}
        </g>
    );
}
