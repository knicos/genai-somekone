import { Tooltip } from '@mui/material';
import { PropsWithChildren, useContext } from 'react';
import { IconMenuContext } from './context';

interface Props extends PropsWithChildren {
    tooltip: string;
}

export default function IconMenuItem({ tooltip, children }: Props) {
    const placement = useContext(IconMenuContext);

    return (
        <Tooltip
            title={tooltip}
            arrow
            placement={
                placement === 'left' ? 'right' : placement === 'right' ? 'left' : placement === 'top' ? 'bottom' : 'top'
            }
        >
            <div>{children}</div>
        </Tooltip>
    );
}
