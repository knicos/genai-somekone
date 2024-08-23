import DataProfileRaw from '@genaism/components/DataProfile/DataProfilePure';
import { storedPrintData } from '@genaism/state/sessionState';
import { useRecoilValue } from 'recoil';
import style from '../style.module.css';

export function Component() {
    const printData = useRecoilValue(storedPrintData);

    return printData && printData.actionLog && printData.weightedImages ? (
        <div className={style.page}>
            <h1>{printData.title}</h1>
            <DataProfileRaw
                content={printData.weightedImages}
                log={printData.actionLog}
                fixedSize={50}
            />
        </div>
    ) : null;
}
