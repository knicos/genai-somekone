import { Outlet, useParams } from 'react-router-dom';
import style from './style.module.css';
import { PrintingProtocol } from './PrintingProtocol';
import { useEffect } from 'react';

let hasPrinted = false;

function Printer() {
    useEffect(() => {
        if (!hasPrinted) {
            hasPrinted = true;
            // Hack to ensure everything is rendered.
            setTimeout(() => window.print(), 1000);
        }
    }, []);
    return null;
}

export function Component() {
    const { code } = useParams();

    return (
        <PrintingProtocol code={code || ''}>
            <div className={style.container}>
                <Outlet />
            </div>
            <Printer />
        </PrintingProtocol>
    );
}
