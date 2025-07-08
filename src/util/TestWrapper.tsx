import React from 'react';
import { createStore, Provider } from 'jotai';
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
    initializeState?: ReturnType<typeof createStore>;
}

export default function TestWrapper({ initializeState, children }: Props) {
    return (
        <ThemeProvider theme={themeOverrides}>
            <Provider store={initializeState}>{children}</Provider>
        </ThemeProvider>
    );
}
