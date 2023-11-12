import style from './style.module.css';
import { useSearchParams } from 'react-router-dom';
import Feed from '../../components/Feed/Feed';

export function Component() {
    const [params] = useSearchParams();

    return (
        <div className={style.page}>
            <Feed content={params.get('content') || undefined} />
        </div>
    );
}
