import { heatmapGrid } from '@genaism/services/map/grid';
import { ContentNodeId, ContentService, WeightedNode } from '@knicos/genai-recom';
import EE from 'eventemitter3';

interface MapServiceConfig {
    dataSetSize: number;
    dim?: number;
    refreshCount?: number;
}

export default class MapService extends EE<'grid'> {
    private readonly contentSvc: ContentService;
    private data = new Map<string, WeightedNode<ContentNodeId>[]>();
    private count = 0;
    private readonly resetCount: number;
    private readonly dataSetSize: number;
    public readonly dim: number;
    public grid: (ContentNodeId | null)[][] = [];

    constructor(content: ContentService, config: MapServiceConfig) {
        super();
        this.contentSvc = content;
        this.dataSetSize = config.dataSetSize;
        this.dim = config.dim ?? Math.floor(Math.sqrt(content.getAllContent().length));
        this.resetCount = config.refreshCount ?? 10;
    }

    public addData(key: string, data: WeightedNode<ContentNodeId>[]) {
        this.data.set(key, data);
        if (this.data.size >= this.dataSetSize) {
            this.count--;
            if (this.count <= 0) {
                this.generateGrid();
            }
        }
    }

    private generateGrid() {
        this.count = this.resetCount * this.dataSetSize;

        const merged = this.mergeAndSort();

        this.grid = heatmapGrid(
            this.contentSvc,
            merged.map((m) => m.id),
            this.dim
        );
        this.emit('grid', this.grid);
    }

    private mergeAndSort() {
        const mergeMap = new Map<ContentNodeId, WeightedNode<ContentNodeId>>();
        this.data.forEach((d) => {
            d.forEach((v) => {
                const cur = mergeMap.get(v.id) || v;
                mergeMap.set(v.id, v.weight > cur.weight ? v : cur);
            });
        });
        const merged = Array.from(mergeMap.values());
        merged.sort((a, b) => b.weight - a.weight);
        return merged;
    }
}
