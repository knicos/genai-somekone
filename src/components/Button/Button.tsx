import MButton from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export const Button = styled(MButton)({
    textTransform: 'none',
});

export const LargeButton = styled(MButton)({
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    borderRadius: '10px',
});
