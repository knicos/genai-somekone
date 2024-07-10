import { NodeID } from '@genaism/services/graph/graphTypes';
import { InternalGraphLink, LinkStyle } from './types';
import style from './style.module.css';
import colours from '@knicos/genai-base/dist/colours.module.css';

interface Props<T extends NodeID> {
    linkList: InternalGraphLink<T, T>[];
    linkStyles?: Map<T, LinkStyle<T>>;
    defaultLinkStyle?: LinkStyle<T>;
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
                        x1={l.source.x}
                        y1={l.source.y}
                        x2={l.target.x}
                        y2={l.target.y}
                        opacity={typeof styles?.opacity === 'function' ? styles.opacity(l) : styles?.opacity}
                        strokeWidth={typeof styles?.width === 'function' ? styles.width(l) : styles?.width}
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
