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
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import Loading from './components/Loading/Loading';
import About from './views/About/About';
import { Privacy, theme } from '@knicos/genai-base';
import gitInfo from './generatedGitInfo.json';
import { defaultServices, ServiceProvider } from './hooks/services';

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

    const json = JSON.stringify(error);
    const str = json === '{}' && 'toString' in (error as Error) ? (error as Error).toString() : 'Unknown';

    return (
        <section className="errorView">
            <h1>Something went wrong</h1>
            <p>
                Please report this issue to{' '}
                <a
                    href="https://github.com/knicos/genai-somekone/issues"
                    target="_blank"
                    rel="noreferrer"
                >
                    our project on github
                </a>{' '}
                if you have time, including the information below. Refresh the page to try again.
            </p>
            <p className="code">{str}</p>
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
                        to="/start"
                    />
                }
            />
            <Route
                path="feed/:code"
                lazy={() => import('./views/Genagram/Genagram')}
            />
            <Route
                path="profile/:code"
                lazy={() => import('./views/ProfileViewer/ProfileViewer')}
            />
            <Route
                path="start"
                lazy={() => import('./views/Start/Start')}
            />
            <Route
                path="about"
                element={<About />}
            />
            <Route
                path="dashboard"
                lazy={() => import('./views/Dashboard/Dashboard')}
            />
            <Route
                path="guided/:guide"
                lazy={() => import('./views/Guided/Guided')}
            />
            <Route
                path="content"
                lazy={() => import('./views/ContentTool/ContentTool')}
            />
        </Route>
    )
);

function App() {
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <RecoilRoot>
                    <ServiceProvider value={defaultServices}>
                        <React.Suspense
                            fallback={
                                <Loading
                                    loading={true}
                                    message="..."
                                />
                            }
                        >
                            <RouterProvider router={router} />
                            <Privacy
                                appName="somekone"
                                tag={gitInfo.gitTag || 'notag'}
                            />
                        </React.Suspense>
                    </ServiceProvider>
                </RecoilRoot>
            </ThemeProvider>
        </StyledEngineProvider>
    );
}

export default App;
