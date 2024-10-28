import { storedPrintData } from '@genaism/state/sessionState';
import { useRecoilValue } from 'recoil';
import style from '../style.module.css';
import { UserProfilePure } from '@genaism/views/UserProfile/UserProfilePure';

export function Component() {
    const printData = useRecoilValue(storedPrintData);

    return printData &&
        printData.wordCloud &&
        printData.summary &&
        printData.engagement !== undefined &&
        printData.topics ? (
        <div className={style.page}>
            <h1>{printData.title}</h1>
            <UserProfilePure
                topics={printData.topics}
                engagement={printData.engagement}
                summary={printData.summary}
                wordCloud={printData.wordCloud}
                wordCloudSize={800}
                imageCloudSize={800}
            />
        </div>
    ) : null;
}
