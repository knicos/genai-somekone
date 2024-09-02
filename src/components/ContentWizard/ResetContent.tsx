import { useContentService } from '@genaism/hooks/services';
import { LargeButton } from '@knicos/genai-base';
import style from './style.module.css';

export default function ResetContent() {
    const contentSvc = useContentService();
    return (
        <section className={style.wizard}>
            <LargeButton
                variant="contained"
                onClick={() => contentSvc.reset()}
            >
                Reset Content
            </LargeButton>
        </section>
    );
}
