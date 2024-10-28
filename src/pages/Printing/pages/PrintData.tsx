import { DataProfilePure } from '@genaism/views/DataProfile/DataProfilePure';
import { storedPrintData } from '@genaism/state/sessionState';
import { useRecoilValue } from 'recoil';
import style from '../style.module.css';

export function Component() {
    const printData = useRecoilValue(storedPrintData);

    return printData && printData.actionLog && printData.weightedImages ? (
        <div className={style.page}>
            <h1>{printData.title}</h1>
            <DataProfilePure
                content={printData.weightedImages}
                log={printData.actionLog}
                fixedSize={100}
                cloudSize={500}
            />
        </div>
    ) : null;
}
