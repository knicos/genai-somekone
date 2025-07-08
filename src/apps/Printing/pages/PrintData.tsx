import { DataProfilePure } from '@genaism/common/views/DataProfile/DataProfilePure';
import { useAtomValue } from 'jotai';
import style from '../style.module.css';
import { storedPrintData } from '../state/printState';

export function Component() {
    const printData = useAtomValue(storedPrintData);

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
