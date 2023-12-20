import style from './style.module.css';
import { useState } from 'react';
import { StageState } from './types';
import CategorySelect from './CatagorySelect';
import ImageSelect from './ImageSelect';
import ImageDescribe from './ImageDescribe';
import ImageStyle from './ImageStyle';
import ImageColour from './ImageColour';
import ImageConfirm from './ImageConfirm';
import { LargeButton } from '@genaism/components/Button/Button';
import CategoryRefine from './CategoryRefine';

export function Component() {
    const [stage, setStage] = useState<StageState[]>([{ view: 'category' }]);
    const [stageIndex, setStageIndex] = useState(0);

    const current = stage[stageIndex];

    const replaceNext = (s: StageState[]) => {
        setStage((old) => [...old.slice(0, stageIndex + 1), ...s]);
    };

    return (
        <div className={style.page}>
            <main className={style.contentSection}>
                {current.view === 'category' && <CategorySelect onAddNext={replaceNext} />}
                {current.view === 'refine' && <CategoryRefine />}
                {current.view === 'images' && (
                    <ImageSelect
                        topic={current.topicId || 'topic:none'}
                        onAddNext={replaceNext}
                    />
                )}
                {current.view === 'describe' && <ImageDescribe />}
                {current.view === 'style' && <ImageStyle content={current.contentId || 'content:none'} />}
                {current.view === 'colour' && <ImageColour />}
                {current.view === 'confirm' && <ImageConfirm />}
            </main>
            <nav>
                <LargeButton
                    variant="contained"
                    color="secondary"
                    disabled={stageIndex === 0}
                    onClick={() => setStageIndex((old) => --old)}
                >
                    Previous
                </LargeButton>
                <LargeButton
                    variant="contained"
                    color="secondary"
                    disabled={stageIndex === stage.length - 1}
                    onClick={() => setStageIndex((old) => ++old)}
                >
                    Next
                </LargeButton>
            </nav>
        </div>
    );
}
