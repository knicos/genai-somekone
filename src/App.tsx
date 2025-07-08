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
import { Provider } from 'jotai';
import './App.css';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import Loading from './common/components/Loading/Loading';
import About from './apps/About/About';
import { theme } from '@genai-fi/base';
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
                lazy={() => import('./apps/Somegram/Somegram')}
            >
                <Route
                    index
                    loader={() => redirect('feed')}
                />
                <Route
                    path="feed"
                    lazy={() => import('./apps/Somegram/subviews/FeedView')}
                />
                <Route
                    path="data"
                    lazy={() => import('./apps/Somegram/subviews/DataView')}
                />
                <Route
                    path="post"
                    lazy={() => import('./apps/Somegram/subviews/PostView')}
                />
                <Route
                    path="image/:contentId"
                    lazy={() => import('./apps/Somegram/subviews/ImageView')}
                />
                <Route
                    path="profile"
                    lazy={() => import('./apps/Somegram/subviews/ProfileView')}
                />
                <Route
                    path="recommendations"
                    lazy={() => import('./apps/Somegram/subviews/RecommendationView')}
                />
                <Route
                    path="share"
                    lazy={() => import('./apps/Somegram/subviews/ShareView')}
                />
                <Route
                    path="public/:userId"
                    lazy={() => import('./apps/Somegram/subviews/PublicView')}
                />
            </Route>
            <Route
                path="print/:code"
                lazy={() => import('./apps/Printing/Printing')}
            >
                <Route
                    index
                    loader={() => redirect('data')}
                />
                <Route
                    path="data"
                    lazy={() => import('./apps/Printing/pages/PrintData')}
                />
                <Route
                    path="profile"
                    lazy={() => import('./apps/Printing/pages/PrintProfile')}
                />
            </Route>
            <Route
                path="profile/:code"
                lazy={() => import('./apps/ProfileViewer/ProfileViewer')}
            >
                <Route
                    index
                    loader={() => redirect('data')}
                />
                <Route
                    path="data"
                    lazy={() => import('./apps/Somegram/subviews/DataView')}
                />
                <Route
                    path="profile"
                    lazy={() => import('./apps/Somegram/subviews/ProfileView')}
                />
                <Route
                    path="recommendations"
                    lazy={() => import('./apps/Somegram/subviews/RecommendationView')}
                />
            </Route>
            <Route
                path="start"
                lazy={() => import('./apps/Start/Start')}
            />
            <Route
                path="library"
                lazy={() => import('./apps/Library/Library')}
            />
            <Route
                path="about"
                element={<About />}
            />
            <Route
                path="flow/:code"
                lazy={() => import('./apps/Flow/Flow')}
            />
            <Route
                path="dashboard"
                lazy={() => import('./apps/Dashboard/Dashboard')}
            >
                <Route
                    index
                    loader={() => redirect('socialgraph')}
                />
                <Route
                    path="socialgraph"
                    lazy={() => import('./apps/Dashboard/subviews/SocialGraph')}
                />
                <Route
                    path="contentgraph"
                    lazy={() => import('./apps/Dashboard/subviews/ContentGraph')}
                />
                <Route
                    path="heatmaps"
                    lazy={() => import('./apps/Dashboard/subviews/HeatmapCompare')}
                />
                <Route
                    path="actionlog"
                    lazy={() => import('./apps/Dashboard/subviews/LogTable')}
                />
                <Route
                    path="topicgraph"
                    lazy={() => import('./apps/Dashboard/subviews/TopicGraph')}
                />
                <Route
                    path="userstats"
                    lazy={() => import('./apps/Dashboard/subviews/UserTable')}
                />
                <Route
                    path="usergrid"
                    lazy={() => import('./apps/Dashboard/subviews/UserGrid')}
                />
                <Route
                    path="workflow"
                    lazy={() => import('./apps/Dashboard/subviews/Workflow')}
                />
                <Route
                    path="contentengage"
                    lazy={() => import('./apps/Dashboard/subviews/ContentEngagements')}
                />
                <Route
                    path="topictable"
                    lazy={() => import('./apps/Dashboard/subviews/TopicTable')}
                />
                <Route
                    path="contentwizard"
                    lazy={() => import('./apps/Dashboard/subviews/ContentWizard')}
                />
                <Route
                    path="browser"
                    lazy={() => import('./apps/Dashboard/subviews/ContentBrowser')}
                />
            </Route>
        </Route>
    )
);

function App() {
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <Provider>
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
                </Provider>
            </ThemeProvider>
        </StyledEngineProvider>
    );
}

export default App;
