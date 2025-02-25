import { useServices } from '@genaism/hooks/services';
import { LogActivity, UserNodeId } from '@knicos/genai-recom';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import style from './style.module.css';
import TableToolbar from './TableToolbar';

interface Row {
    id: string;
    owner: UserNodeId;
    name: string;
    timestamp: number;
    image?: string;
    value?: number;
    user?: UserNodeId;
    activity: LogActivity;
    text?: string;
}

function durationToString(dur: number) {
    const sec = dur / 1000;
    if (sec > 60 * 60) {
        const hour = sec / (60 * 60);
        return `${hour.toFixed(1)}h`;
    } else if (sec > 60) {
        const min = sec / 60;
        return `${min.toFixed(1)}m`;
    } else {
        return `${sec.toFixed(1)}s`;
    }
}

const columns: GridColDef<Row>[] = [
    {
        field: 'timestamp',
        headerName: 'Timestamp',
        width: 200,
        renderCell: (params) => new Date(params.value).toLocaleString(),
    },
    { field: 'activity', headerName: 'Action', width: 130 },
    {
        field: 'image',
        headerName: 'Image',
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
    { field: 'name', headerName: 'Owner', width: 200 },
    { field: 'owner', headerName: 'Owner ID', width: 200 },
    {
        field: 'value',
        headerName: 'Value',
        width: 100,
        renderCell: (params) => {
            if (params.value === undefined) return null;
            if (
                params.row.activity === 'dwell' ||
                params.row.activity === 'end' ||
                params.row.activity === 'inactive'
            ) {
                return durationToString(params.value);
            } else {
                return `${params.value.toFixed(1)}`;
            }
        },
    },
    { field: 'text', headerName: 'Text', width: 200 },
];

export default function LogTable() {
    const { actionLog, graph, profiler } = useServices();

    const users = graph.getNodesByType('user');
    const logs: Row[][] = users.map((u) => {
        const al = actionLog.getActionLog(u);
        return al.map((l) => ({
            id: `${u}:${l.activity}:${l.timestamp}`,
            timestamp: l.timestamp,
            activity: l.activity,
            image: l.id ? profiler.content.getContentData(l.id) : undefined,
            value: l.value,
            user: l.user,
            owner: u,
            name: profiler.getUserName(u),
            text: l.content,
        }));
    });

    const log: Row[] = [];
    logs.forEach((l) => {
        log.push(...l);
    });
    log.sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className={style.container}>
            <div
                className={style.tableContainer}
                data-testid="log-table"
            >
                <DataGrid
                    localeText={{}}
                    slots={{ toolbar: TableToolbar }}
                    rows={log}
                    columns={columns}
                    initialState={{
                        columns: {
                            columnVisibilityModel: {
                                owner: false,
                                text: false,
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
}
