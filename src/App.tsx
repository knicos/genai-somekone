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
import About from './pages/About/About';
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
                lazy={() => import('./pages/Genagram/Genagram')}
            >
                <Route
                    index
                    loader={() => redirect('feed')}
                />
                <Route
                    path="feed"
                    lazy={() => import('./pages/Genagram/subviews/FeedView')}
                />
                <Route
                    path="data"
                    lazy={() => import('./pages/Genagram/subviews/DataView')}
                />
                <Route
                    path="post"
                    lazy={() => import('./pages/Genagram/subviews/PostView')}
                />
                <Route
                    path="image/:contentId"
                    lazy={() => import('./pages/Genagram/subviews/ImageView')}
                />
                <Route
                    path="profile"
                    lazy={() => import('./pages/Genagram/subviews/ProfileView')}
                />
                <Route
                    path="recommendations"
                    lazy={() => import('./pages/Genagram/subviews/RecommendationView')}
                />
                <Route
                    path="share"
                    lazy={() => import('./pages/Genagram/subviews/ShareView')}
                />
                <Route
                    path="public/:userId"
                    lazy={() => import('./pages/Genagram/subviews/PublicView')}
                />
            </Route>
            <Route
                path="print/:code"
                lazy={() => import('./pages/Printing/Printing')}
            >
                <Route
                    index
                    loader={() => redirect('data')}
                />
                <Route
                    path="data"
                    lazy={() => import('./pages/Printing/pages/PrintData')}
                />
                <Route
                    path="profile"
                    lazy={() => import('./pages/Printing/pages/PrintProfile')}
                />
            </Route>
            <Route
                path="profile/:code"
                lazy={() => import('./pages/ProfileViewer/ProfileViewer')}
            >
                <Route
                    index
                    loader={() => redirect('data')}
                />
                <Route
                    path="data"
                    lazy={() => import('./pages/Genagram/subviews/DataView')}
                />
                <Route
                    path="profile"
                    lazy={() => import('./pages/Genagram/subviews/ProfileView')}
                />
                <Route
                    path="recommendations"
                    lazy={() => import('./pages/Genagram/subviews/RecommendationView')}
                />
            </Route>
            <Route
                path="start"
                lazy={() => import('./pages/Start/Start')}
            />
            <Route
                path="library"
                lazy={() => import('./pages/Library/Library')}
            />
            <Route
                path="about"
                element={<About />}
            />
            <Route
                path="dashboard"
                lazy={() => import('./pages/Dashboard/Dashboard')}
            >
                <Route
                    index
                    loader={() => redirect('socialgraph')}
                />
                <Route
                    path="socialgraph"
                    lazy={() => import('./pages/Dashboard/subviews/SocialGraph')}
                />
                <Route
                    path="contentgraph"
                    lazy={() => import('./pages/Dashboard/subviews/ContentGraph')}
                />
                <Route
                    path="heatmaps"
                    lazy={() => import('./pages/Dashboard/subviews/HeatmapCompare')}
                />
                <Route
                    path="actionlog"
                    lazy={() => import('./pages/Dashboard/subviews/LogTable')}
                />
                <Route
                    path="topicgraph"
                    lazy={() => import('./pages/Dashboard/subviews/TopicGraph')}
                />
                <Route
                    path="userstats"
                    lazy={() => import('./pages/Dashboard/subviews/UserTable')}
                />
                <Route
                    path="usergrid"
                    lazy={() => import('./pages/Dashboard/subviews/UserGrid')}
                />
                <Route
                    path="contentengage"
                    lazy={() => import('./pages/Dashboard/subviews/ContentEngagements')}
                />
                <Route
                    path="topictable"
                    lazy={() => import('./pages/Dashboard/subviews/TopicTable')}
                />
                <Route
                    path="contentwizard"
                    lazy={() => import('./pages/Dashboard/subviews/ContentWizard')}
                />
                <Route
                    path="browser"
                    lazy={() => import('./pages/Dashboard/subviews/ContentBrowser')}
                />
            </Route>
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
