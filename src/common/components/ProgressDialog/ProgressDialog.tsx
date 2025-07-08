import { Dialog, DialogContent, DialogTitle, LinearProgress } from '@mui/material';
import { Spinner } from '@genai-fi/base';

interface Props {
    open: boolean;
    title: string;
    progress?: number;
}

export default function ProgressDialog({ open, title, progress }: Props) {
    return (
        <Dialog
            open={open}
            maxWidth="xs"
            fullWidth={progress !== undefined}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Spinner />
                {progress !== undefined && (
                    <LinearProgress
                        sx={{ width: '100%' }}
                        variant="determinate"
                        value={Math.round(progress * 100)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
