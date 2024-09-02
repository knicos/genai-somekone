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
                    index
                    loader={() => redirect('feed')}
                />
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
                    path="image/:contentId"
                    lazy={() => import('./views/Genagram/subviews/ImageView')}
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
                <Route
                    path="public/:userId"
                    lazy={() => import('./views/Genagram/subviews/PublicView')}
                />
            </Route>
            <Route
                path="print/:code"
                lazy={() => import('./views/Printing/Printing')}
            >
                <Route
                    index
                    loader={() => redirect('data')}
                />
                <Route
                    path="data"
                    lazy={() => import('./views/Printing/pages/PrintData')}
                />
                <Route
                    path="profile"
                    lazy={() => import('./views/Printing/pages/PrintProfile')}
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
            >
                <Route
                    index
                    loader={() => redirect('socialgraph')}
                />
                <Route
                    path="socialgraph"
                    lazy={() => import('./views/Dashboard/subviews/SocialGraph')}
                />
                <Route
                    path="contentgraph"
                    lazy={() => import('./views/Dashboard/subviews/ContentGraph')}
                />
                <Route
                    path="heatmaps"
                    lazy={() => import('./views/Dashboard/subviews/HeatmapCompare')}
                />
                <Route
                    path="actionlog"
                    lazy={() => import('./views/Dashboard/subviews/LogTable')}
                />
                <Route
                    path="topicgraph"
                    lazy={() => import('./views/Dashboard/subviews/TopicGraph')}
                />
                <Route
                    path="userstats"
                    lazy={() => import('./views/Dashboard/subviews/UserTable')}
                />
                <Route
                    path="usergrid"
                    lazy={() => import('./views/Dashboard/subviews/UserGrid')}
                />
                <Route
                    path="contentengage"
                    lazy={() => import('./views/Dashboard/subviews/ContentEngagements')}
                />
                <Route
                    path="topictable"
                    lazy={() => import('./views/Dashboard/subviews/TopicTable')}
                />
                <Route
                    path="contentwizard"
                    lazy={() => import('./views/Dashboard/subviews/ContentWizard')}
                />
            </Route>
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
