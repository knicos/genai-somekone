import { Widget } from '@genaism/common/components/WorkflowLayout';
import { Spinner } from '@genai-fi/base';
import style from './style.module.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

interface Props {
    spin: boolean;
}

export default function Blackbox({ spin }: Props) {
    return (
        <Widget dataWidget="blackbox">
            <div className={style.bbcontainer}>
                <Spinner disabled={!spin} />
                <div className={style.bbtick}>
                    {!spin && (
                        <CheckCircleIcon
                            color="primary"
                            fontSize="large"
                        />
                    )}
                    {spin && (
                        <PendingIcon
                            color="disabled"
                            fontSize="large"
                        />
                    )}
                </div>
            </div>
        </Widget>
    );
}
