import { TextField } from '@mui/material';
import { useCallback } from 'react';

interface Props {
    onUsername: (name: string) => void;
}

export default function EnterUsername({ onUsername }: Props) {
    const doKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onUsername((e.target as HTMLInputElement).value);
        }
    }, []);
    return (
        <div>
            <TextField
                label="Enter Username"
                onKeyDown={doKeyDown}
            />
        </div>
    );
}
