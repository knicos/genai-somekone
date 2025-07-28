import { useServices } from '@genaism/hooks/services';
import { ContentNodeId, UserNodeId } from '@genai-fi/recom';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import style from './style.module.css';
import { useMemo } from 'react';
import TableToolbar from './TableToolbar';

interface Row {
    id: string;
    image?: string;
    contentId: ContentNodeId;
    engagement: number;
    maxEngagement: number;
    [key: UserNodeId]: number;
}

export default function ContentEngagements() {
    const { profiler } = useServices();

    const users = profiler.graph.getNodesByType('user');
    const content = profiler.graph.getNodesByType('content');

    const columns: GridColDef<Row>[] = useMemo(() => {
        const sortedUsers = [...users];
        sortedUsers.sort(
            (a, b) => (profiler.getUserData(b)?.engagement || 0) - (profiler.getUserData(a)?.engagement || 0)
        );
        return [
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
            { field: 'contentId', headerName: 'ID', width: 200 },
            {
                field: 'engagement',
                headerName: 'Engagement',
                width: 80,
                renderCell: (params) => params.value.toFixed(1),
            },
            ...sortedUsers.map((user) => ({
                field: user,
                headerName: profiler.getUserName(user),
                width: 80,
                renderCell: (params: GridRenderCellParams) => (
                    <span
                        style={{
                            padding: '0.3rem',
                            backgroundColor: `hsl(240, 80%, ${
                                20 - Math.min(20, Math.floor((params.value / params.row.maxEngagement) * 20)) + 80
                            }%)`,
                        }}
                    >
                        {params.value.toFixed(1)}
                    </span>
                ),
            })),
        ];
    }, [profiler, users]);

    const rows: Row[] = content.map((c) => {
        const stats = profiler.content.getContentStats(c);

        const result: Row = {
            id: c,
            contentId: c,
            image: profiler.content.getContentData(c),
            engagement: stats?.engagement || 0,
            maxEngagement: 0,
        };

        users.forEach((user) => {
            const e = profiler.graph.getEdgeWeights('engaged', user, c)[0] || 0;
            result[user] = e;
            result.maxEngagement = Math.max(result.maxEngagement, e);
        });

        return result;
    });

    return (
        <div className={style.container}>
            <div
                className={style.tableContainer}
                data-testid="content-engagements"
            >
                <DataGrid
                    slots={{ toolbar: TableToolbar }}
                    showToolbar
                    rows={rows}
                    columns={columns}
                    initialState={{
                        columns: {
                            columnVisibilityModel: {
                                contentId: false,
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
