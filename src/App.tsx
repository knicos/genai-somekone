import React from 'react';
import {
    RouterProvider,
    Route,
    createBrowserRouter,
    createRoutesFromElements,
    useRouteError,
    Navigate,
    redirect,
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import './App.css';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import Loading from './components/Loading/Loading';
import About from './views/About/About';
import { theme } from '@knicos/genai-base';
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
                path="app/:code"
                lazy={() => import('./views/Genagram/Genagram')}
            >
                <Route
                    path="feed"
                    lazy={() => import('./views/Genagram/subviews/FeedView')}
                />
                <Route
                    path="data"
                    lazy={() => import('./views/Genagram/subviews/DataView')}
                />
                <Route
                    path="post"
                    lazy={() => import('./views/Genagram/subviews/PostView')}
                />
                <Route
                    path="profile"
                    lazy={() => import('./views/Genagram/subviews/ProfileView')}
                />
                <Route
                    path="recommendations"
                    lazy={() => import('./views/Genagram/subviews/RecommendationView')}
                />
                <Route
                    path="share"
                    lazy={() => import('./views/Genagram/subviews/ShareView')}
                />
            </Route>
            <Route
                path="profile/:code"
                lazy={() => import('./views/ProfileViewer/ProfileViewer')}
            >
                <Route
                    index
                    loader={() => redirect('data')}
                />
                <Route
                    path="data"
                    lazy={() => import('./views/Genagram/subviews/DataView')}
                />
                <Route
                    path="profile"
                    lazy={() => import('./views/Genagram/subviews/ProfileView')}
                />
                <Route
                    path="recommendations"
                    lazy={() => import('./views/Genagram/subviews/RecommendationView')}
                />
            </Route>
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
                        </React.Suspense>
                    </ServiceProvider>
                </RecoilRoot>
            </ThemeProvider>
        </StyledEngineProvider>
    );
}

export default App;
