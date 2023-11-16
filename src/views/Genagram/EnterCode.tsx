import { TextField } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EnterCode() {
    const navigate = useNavigate();
    const doKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigate(`/feed/${(e.target as HTMLInputElement).value}`);
        }
    }, []);
    return (
        <div>
            <TextField
                label="Enter Code"
                onKeyDown={doKeyDown}
            />
        </div>
    );
}
