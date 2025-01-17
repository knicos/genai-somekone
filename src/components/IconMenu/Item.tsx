import { Tooltip } from '@mui/material';
import { PropsWithChildren, useContext } from 'react';
import { IconMenuContext } from './context';
import style from './style.module.css';

interface Props extends PropsWithChildren {
    tooltip: string;
    hideTip?: boolean;
    selected?: boolean;
    fullWidth?: boolean;
}

export default function IconMenuItem({ fullWidth, tooltip, children, hideTip, selected }: Props) {
    const placement = useContext(IconMenuContext);

    return hideTip ? (
        <div
            style={{ width: fullWidth ? '100%' : undefined }}
            className={selected ? style.selectedItem : undefined}
        >
            {children}
        </div>
    ) : (
        <Tooltip
            title={tooltip}
            arrow
            placement={
                placement === 'left' ? 'right' : placement === 'right' ? 'left' : placement === 'top' ? 'bottom' : 'top'
            }
        >
            <div
                style={{ width: fullWidth ? '100%' : undefined }}
                className={selected ? style.selectedItem : undefined}
            >
                {children}
            </div>
        </Tooltip>
    );
}
