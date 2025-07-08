import { Spinner } from '@genai-fi/base';
import ScorePie from '@genaism/common/components/RecommendationsTable/ScorePie';
import style from './style.module.css';
import sColors from '@genai-fi/base/css/colours.module.css';

interface Props {
    progress?: number;
}

export default function SimulatorStatus({ progress }: Props) {
    return (
        <div className={style.progress}>
            {progress !== undefined && (
                <ScorePie
                    value={progress}
                    maxValue={1}
                    showValue
                    color={sColors.secondary}
                />
            )}
            {progress === undefined && <Spinner />}
        </div>
    );
}
