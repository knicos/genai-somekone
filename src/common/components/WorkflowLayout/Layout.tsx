import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { extractNodesFromElements, generateLines, IConnection } from './lines';
import SvgLayer, { ILine } from './SvgLayer';
import style from './style.module.css';

interface Props extends PropsWithChildren {
    connections: IConnection[];
}

export default function WorkflowLayout({ children, connections }: Props) {
    const [lines, setLines] = useState<ILine[]>([]);
    const wkspaceRef = useRef<HTMLDivElement>(null);
    const observer = useRef<ResizeObserver>(undefined);

    useEffect(() => {
        if (wkspaceRef.current) {
            observer.current = new ResizeObserver(() => {
                if (wkspaceRef.current) {
                    const nodes = extractNodesFromElements(wkspaceRef.current as HTMLElement);
                    setLines(generateLines(nodes, connections));
                }
            });
            observer.current.observe(wkspaceRef.current);
            const children = wkspaceRef.current.children;
            if (children) {
                for (let i = 0; i < children.length; ++i) {
                    const child = children[i];
                    observer.current.observe(child);
                }
            }
            return () => {
                observer.current?.disconnect();
            };
        }
    }, [connections]);

    return (
        <div className={style.workspace}>
            <div
                className={style.container}
                ref={wkspaceRef}
                style={{
                    gridTemplateColumns: `repeat(${Array.isArray(children) ? children.filter((c) => !!c).length : 1}, max-content)`,
                }}
            >
                <SvgLayer lines={lines} />
                {children}
            </div>
        </div>
    );
}
