import { Slide, SlideProps } from '@mui/material';
import { PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react';
import style from './style.module.css';

function slideDirection(my: number, current: number, previous: number): SlideProps['direction'] {
    let dir: SlideProps['direction'] = 'left';
    if (my === previous) {
        if (previous < current) dir = 'right';
        else dir = 'left';
    } else {
        if (previous < current) dir = 'left';
        else dir = 'right';
    }

    return dir;
}

interface Props extends PropsWithChildren {
    page: number;
    onHeight?: (h: number) => void;
    controls?: ReactNode;
}

export default function SlideShow({ page, children, onHeight, controls }: Props) {
    const prevPage = useRef(-1);
    const [curPage, setCurPage] = useState(-1);
    const container = useRef<HTMLDivElement>(null);
    const controlRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const old = page;
        setCurPage(page);
        return () => {
            prevPage.current = old;
        };
    }, [page]);

    return (
        <div
            ref={container}
            className={style.container}
        >
            {Array.isArray(children)
                ? children.map((child, ix) => (
                      <Slide
                          key={ix}
                          direction={slideDirection(ix, page, prevPage.current)}
                          in={curPage === ix}
                          mountOnEnter
                          unmountOnExit
                          container={container.current}
                          onEnter={(node) => {
                              if (onHeight) onHeight(node.clientHeight + (controlRef.current?.clientHeight || 0));
                          }}
                      >
                          <div className={style.page}>{child}</div>
                      </Slide>
                  ))
                : children}
            {controls && (
                <div
                    className={style.slideControls}
                    ref={controlRef}
                >
                    {controls}
                </div>
            )}
        </div>
    );
}
