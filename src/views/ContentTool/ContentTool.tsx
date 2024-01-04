import style from './style.module.css';
import { useCallback, useEffect, useState } from 'react';
import { StageState } from './types';
import CategorySelect from './CatagorySelect';
import ImageSelect from './ImageSelect';
import ImageDescribe from './ImageDescribe';
import Confirm from './Confirm';
import { useRecoilValue } from 'recoil';
import { unsavedChanges } from '@genaism/state/interaction';

export function Component() {
    const [stage, setStage] = useState<StageState[]>([{ view: 'category' }]);
    const [stageIndex, setStageIndex] = useState(0);
    const unsaved = useRecoilValue(unsavedChanges);

    useEffect(() => {
        if (unsaved) {
            const handler = (e: Event) => {
                e.returnValue = true;
                return '';
            };
            window.addEventListener('beforeunload', handler);
            return () => {
                window.removeEventListener('beforeunload', handler);
            };
        }
    }, [unsaved]);

    const current = stage[stageIndex];

    const replaceNext = useCallback(
        (s: StageState[]) => {
            setStage((old) => [...old.slice(0, stageIndex + 1), ...s]);
        },
        [stageIndex]
    );

    return (
        <div className={style.page}>
            {current.view === 'category' && (
                <CategorySelect
                    onAddNext={replaceNext}
                    onNext={() => setStageIndex((old) => ++old)}
                />
            )}
            {current.view === 'confirm' && (
                <Confirm
                    onNext={() => {
                        replaceNext([{ view: 'category' }]);
                        setStageIndex((old) => ++old);
                    }}
                />
            )}
            {current.view === 'images' && (
                <ImageSelect
                    topic={current.topicId || 'topic:none'}
                    onAddNext={replaceNext}
                    onNext={() => setStageIndex((old) => ++old)}
                />
            )}
            {current.view === 'describe' && (
                <ImageDescribe
                    onNext={() => setStageIndex((old) => ++old)}
                    content={current.contentId || 'content:none'}
                />
            )}
        </div>
    );
}
