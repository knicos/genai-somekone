import style from './style.module.css';
import { useCallback, useState } from 'react';
import { StageState } from './types';
import CategorySelect from './CatagorySelect';
import ImageSelect from './ImageSelect';
import ImageDescribe from './ImageDescribe';
import Confirm from './Confirm';

export function Component() {
    const [stage, setStage] = useState<StageState[]>([{ view: 'category' }]);
    const [stageIndex, setStageIndex] = useState(0);

    const current = stage[stageIndex];

    console.log('Stage', stageIndex);
    console.log('Stages', stage);

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
            {current.view === 'confirm' && <Confirm />}
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
