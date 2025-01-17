import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import UserListing from './UserListing';
import { UserNodeId } from '@knicos/genai-recom';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    open: boolean;
    onClose: () => void;
    onSelect: (user: UserNodeId[]) => void;
    preSelected?: UserNodeId[];
    multiple?: boolean | number;
}

export default function UserDialog({ open, onClose, onSelect, preSelected, multiple }: Props) {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            scroll="paper"
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>
                {!multiple ? t('dashboard.titles.userSelect') : t('dashboard.titles.usersSelect')}
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent sx={{ display: 'flex', padding: 0, maxHeight: '600px' }}>
                <UserListing
                    onSelect={(id: UserNodeId[]) => {
                        onSelect(id);
                        onClose();
                    }}
                    multiple={multiple}
                    preSelected={preSelected}
                />
            </DialogContent>
        </Dialog>
    );
}
