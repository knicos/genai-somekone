import { IconButton, InputAdornment, styled, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { KeyboardEvent, useCallback, useRef } from 'react';
import style from './style.module.css';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconMenuItem, Spacer, IconMenu } from '@genaism/common/components/IconMenu';
import EditIcon from '@mui/icons-material/Edit';

interface Props {
    hasSelected?: boolean;
    onSearch: (q: string) => void;
    onDelete: () => void;
}

const SearchField = styled(TextField)({
    '& .MuiInputBase-root': {
        backgroundColor: 'white',
    },
    margin: '0 2rem',
});

export default function BrowserMenu({ hasSelected, onSearch, onDelete }: Props) {
    const inputRef = useRef<HTMLInputElement>();

    const doChange = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value;
                //setImages([]);
                //setQuery(value);
                onSearch(value);
            }
        },
        [onSearch]
    );

    return (
        <IconMenu
            title="Browser"
            label={<div className={style.menuLogo}>Browser</div>}
            placement="top"
        >
            <SearchField
                hiddenLabel
                size="small"
                variant="outlined"
                onKeyDown={doChange}
                inputRef={inputRef}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />
            <Spacer />
            <IconMenuItem tooltip="Edit image">
                <IconButton
                    disabled={!hasSelected}
                    color="inherit"
                >
                    <EditIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem tooltip="Delete image">
                <IconButton
                    onClick={onDelete}
                    disabled={!hasSelected}
                    color="inherit"
                >
                    <DeleteIcon />
                </IconButton>
            </IconMenuItem>
        </IconMenu>
    );
}
