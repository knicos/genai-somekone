import React from 'react';
import { MutableSnapshot, RecoilRoot } from 'recoil';
import { createTheme, ThemeProvider } from '@mui/material';

const themeOverrides = createTheme({
    transitions: {
        // So we have `transition: none;` everywhere
        create: () => 'none',
    },
    components: {
        // Name of the component ⚛️
        MuiButtonBase: {
            defaultProps: {
                // The props to apply
                disableRipple: true, // No more ripple, on the whole application 💣!
            },
        },
    },
});

interface Props extends React.PropsWithChildren {
    initializeState?: (snap: MutableSnapshot) => void;
}

export default function TestWrapper({ initializeState, children }: Props) {
    return (
        <ThemeProvider theme={themeOverrides}>
            <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>
        </ThemeProvider>
    );
}
