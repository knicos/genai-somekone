import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Spinner } from '@knicos/genai-base';

interface Props {
    open: boolean;
    title: string;
}

export default function ProgressDialog({ open, title }: Props) {
    return (
        <Dialog open={open}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Spinner />
            </DialogContent>
        </Dialog>
    );
}
