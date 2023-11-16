import React from 'react';
import {
    RouterProvider,
    Route,
    createBrowserRouter,
    createRoutesFromElements,
    useRouteError,
    Navigate,
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './style/theme';

interface RouterError {
    status: number;
}

function ErrorComponent() {
    const error = useRouteError();

    if ((error as RouterError).status === 404) {
        return (
            <section className="errorView">
                <h1>Page not found</h1>
            </section>
        );
    }

    return (
        <section className="errorView">
            <h1>Something went wrong</h1>
            <p>
                Please report this issue to{' '}
                <a
                    href="https://github.com/knicos/genai-tm/issues"
                    target="_blank"
                    rel="noreferrer"
                >
                    our project on github
                </a>{' '}
                if you have time, including the information below. Refresh the page to try again.
            </p>
            <p className="code">{JSON.stringify(error)}</p>
        </section>
    );
}

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route
            path="/"
            ErrorBoundary={ErrorComponent}
        >
            <Route
                index
                element={
                    <Navigate
                        replace
                        to="/feed"
                    />
                }
            />
            <Route
                path="feed/:code"
                lazy={() => import('./views/Genagram/Genagram')}
            />
            <Route
                path="feed"
                lazy={() => import('./views/Genagram/Genagram')}
            />
            <Route
                path="dashboard"
                lazy={() => import('./views/Dashboard/Dashboard')}
            />
            <Route
                path="create"
                lazy={() => import('./views/Create/Create')}
            />
        </Route>
    )
);

function App() {
    return (
        <ThemeProvider theme={theme}>
            <React.Suspense fallback={<div></div>}>
                <RecoilRoot>
                    <RouterProvider router={router} />
                </RecoilRoot>
            </React.Suspense>
        </ThemeProvider>
    );
}

export default App;
