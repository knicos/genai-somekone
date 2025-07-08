import { useServices } from '@genaism/hooks/services';
import { UserNodeId } from '@knicos/genai-recom';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import style from './style.module.css';
import TableToolbar from './TableToolbar';

interface Row {
    id: string;
    userId: UserNodeId;
    image?: string;
    name: string;
    follows: number;
    followed: number;
    liked: number;
    engagement: number;
    dwellTime: number;
    topic: string;
    viewedImages: number;
    comments: number;
    shares: number;
}

const columns: GridColDef<Row>[] = [
    {
        field: 'image',
        headerName: 'Picture',
        width: 80,
        renderCell: (params) =>
            params.value ? (
                <img
                    src={params.value}
                    width={48}
                    height={48}
                />
            ) : null,
    },
    { field: 'name', headerName: 'User', width: 200 },
    { field: 'userId', headerName: 'ID', width: 200 },
    { field: 'engagement', headerName: 'Engagement', width: 80, renderCell: (params) => params.value.toFixed(1) },
    { field: 'topic', headerName: 'Main Topic', width: 150 },
    { field: 'follows', headerName: 'Followers', width: 80 },
    { field: 'followed', headerName: 'Followed', width: 80 },
    { field: 'liked', headerName: 'Liked', width: 80 },
    { field: 'viewedImages', headerName: 'Viewed', width: 80 },
    { field: 'comments', headerName: 'Comments', width: 80 },
    { field: 'shares', headerName: 'Shares', width: 80 },
    {
        field: 'dwellTime',
        headerName: 'View Time',
        width: 80,
        renderCell: (params) => `${(params.value / 1000).toFixed(1)}s`,
    },
];

export default function UserTable() {
    const { profiler, actionLog } = useServices();

    const users = profiler.graph.getNodesByType('user');
    const rows: Row[] = users.map((user) => {
        const userData = profiler.getUserData(user);
        const log = actionLog.getActionLog(user);
        return {
            id: user,
            userId: user,
            image: userData?.image ? profiler.content.getContentData(userData.image) : undefined,
            name: userData?.name || 'No name',
            follows: userData?.followerCount || 0,
            followed: userData?.followsCount || 0,
            engagement: userData?.engagement || 0,
            dwellTime: log.filter((l) => l.activity === 'dwell').reduce((s, d) => s + (d.value || 0), 0),
            topic: userData?.affinities.topics.topics[0]?.label || 'None',
            viewedImages: log.filter((l) => l.activity === 'seen').length,
            liked: log.filter((l) => l.activity === 'like').length,
            comments: log.filter((l) => l.activity === 'comment').length,
            shares: log.filter((l) => l.activity === 'share_public').length,
        };
    });

    return (
        <div className={style.container}>
            <div
                className={style.tableContainer}
                data-testid="user-table"
            >
                <DataGrid
                    slots={{ toolbar: TableToolbar }}
                    showToolbar
                    rows={rows}
                    columns={columns}
                    initialState={{
                        columns: {
                            columnVisibilityModel: {
                                userId: false,
                                follows: false,
                            },
                        },
                        sorting: {
                            sortModel: [
                                {
                                    field: 'engagement',
                                    sort: 'desc',
                                },
                            ],
                        },
                    }}
                />
            </div>
        </div>
    );
}
