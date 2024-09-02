import { useChangeNodeType } from '@genaism/hooks/graph';
import style from './style.module.css';
import { ContentNodeId, ContentService } from '@knicos/genai-recom';
import { useMemo } from 'react';
import { useContentService } from '@genaism/hooks/services';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface Row {
    id: string;
    label: string;
    weight: number;
}

const columns: GridColDef<Row>[] = [
    {
        field: 'label',
        headerName: 'Label',
        width: 200,
    },
    { field: 'weight', headerName: 'Count', width: 80 },
];

function analyseTags(service: ContentService, content: ContentNodeId[]) {
    const tags = new Map<string, number>();
    content.forEach((c) => {
        const meta = service.getContentMetadata(c);
        if (meta) {
            meta.labels.forEach((l) => {
                const v = tags.get(l.label) || 0;
                tags.set(l.label, v + 1);
            });
        }
    });

    const arr = Array.from(tags).map((v) => ({ id: v[0], label: v[0], weight: v[1] }));
    arr.sort((a, b) => b.weight - a.weight);
    return arr;
}

export default function ContentSummary() {
    const content = useChangeNodeType('content');
    const contentSvc = useContentService();

    const tags = useMemo(() => {
        return analyseTags(contentSvc, content);
    }, [contentSvc, content]);

    return (
        <section className={style.wizard}>
            <div>Count: {content.length}</div>
            <DataGrid
                rows={tags}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                    },
                }}
            />
        </section>
    );
}
