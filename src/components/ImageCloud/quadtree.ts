export interface QTDataItem {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}

interface QTLeaf extends QTDataItem {
    items: QTDataItem[];
}

type QTChild = QTLeaf | QTNode | null;

interface QTNode extends QTDataItem {
    depth: number;
    children: [QTChild, QTChild, QTChild, QTChild];
}

export function createQuadTree(x: number, y: number, width: number, height: number, maxDepth: number): QTNode {
    return {
        depth: maxDepth,
        x0: x - width / 2,
        x1: x + width / 2,
        y0: y - height / 2,
        y1: y + height / 2,
        children: [null, null, null, null],
    };
}

function subdivideNode(node: QTNode) {
    const w2 = (node.x1 - node.x0) / 2;
    const h2 = (node.y1 - node.y0) / 2;

    if (node.children[0] !== null) return;

    if (node.depth === 1) {
        node.children = [
            { x0: node.x0, x1: node.x0 + w2, y0: node.y0, y1: node.y0 + h2, items: [] },
            { x0: node.x0 + w2, x1: node.x1, y0: node.y0, y1: node.y0 + h2, items: [] },
            { x0: node.x0, x1: node.x0 + w2, y0: node.y0 + h2, y1: node.y1, items: [] },
            { x0: node.x0 + w2, x1: node.x1, y0: node.y0 + h2, y1: node.y1, items: [] },
        ];
    } else {
        node.children = [
            {
                x0: node.x0,
                x1: node.x0 + w2,
                y0: node.y0,
                y1: node.y0 + h2,
                depth: node.depth - 1,
                children: [null, null, null, null],
            },
            {
                x0: node.x0 + w2,
                x1: node.x1,
                y0: node.y0,
                y1: node.y0 + h2,
                depth: node.depth - 1,
                children: [null, null, null, null],
            },
            {
                x0: node.x0,
                x1: node.x0 + w2,
                y0: node.y0 + h2,
                y1: node.y1,
                depth: node.depth - 1,
                children: [null, null, null, null],
            },
            {
                x0: node.x0 + w2,
                x1: node.x1,
                y0: node.y0 + h2,
                y1: node.y1,
                depth: node.depth - 1,
                children: [null, null, null, null],
            },
        ];
    }
}

function collidesNode(node: QTDataItem, data: QTDataItem): boolean {
    const ix0 = data.x0;
    const ix1 = data.x1;
    const iy0 = data.y0;
    const iy1 = data.y1;
    const dx0 = node.x0;
    const dx1 = node.x1;
    const dy0 = node.y0;
    const dy1 = node.y1;

    if (ix1 < dx0) return false;
    if (dx1 < ix0) return false;
    if (iy1 < dy0) return false;
    if (dy1 < iy0) return false;
    return true;

    /*if (ix0 >= dx0 && ix0 <= dx1 && iy0 >= dy0 && iy0 <= dy1) return true;
    if (ix0 >= dx0 && ix0 <= dx1 && iy1 >= dy0 && iy1 <= dy1) return true;
    if (ix1 >= dx0 && ix1 <= dx1 && iy0 >= dy0 && iy0 <= dy1) return true;
    if (ix1 >= dx0 && ix1 <= dx1 && iy1 >= dy0 && iy1 <= dy1) return true;
    return false;*/
}

export function addQuadTree(root: QTNode | QTLeaf, data: QTDataItem) {
    // Is in this node?
    if (!collidesNode(root, data)) return;

    if ('items' in root) {
        root.items.push(data);
    } else {
        subdivideNode(root);
        if (root.children[0]) addQuadTree(root.children[0], data);
        if (root.children[1]) addQuadTree(root.children[1], data);
        if (root.children[2]) addQuadTree(root.children[2], data);
        if (root.children[3]) addQuadTree(root.children[3], data);
    }
}

export function testQuadTree(root: QTNode | QTLeaf, data: QTDataItem): boolean {
    if (!collidesNode(root, data)) return false;

    if ('items' in root) {
        // Test each item.
        for (const item of root.items) {
            if (collidesNode(data, item)) return true;
        }
        return false;
    } else {
        if (root.children[0] && testQuadTree(root.children[0], data)) return true;
        if (root.children[1] && testQuadTree(root.children[1], data)) return true;
        if (root.children[2] && testQuadTree(root.children[2], data)) return true;
        if (root.children[3] && testQuadTree(root.children[3], data)) return true;
        return false;
    }
}
