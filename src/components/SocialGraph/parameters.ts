const MIN_PIXELS_PER_NODE = 100;
const MAX_PIXELS_PER_NODE = 300;

const MIN_LINK_DIST = 50;
const MAX_LINK_DIST = 600;
const MIN_NODE_CHARGE = 1;
const MAX_NODE_CHARGE = 4;
// const MIN_SIM_PERCENT = 0.005;
// const MAX_SIM_PERCENT = 0.01;

function interp(v: number, min: number, max: number) {
    return v * (max - min) + min;
}

export function calculateParameters(scale: number, resolution: number, nodeCount: number) {
    const pixelsPerNode = Math.sqrt(resolution / nodeCount);
    const screenScale = Math.min(
        1,
        Math.max(0, pixelsPerNode - MIN_PIXELS_PER_NODE) / (MAX_PIXELS_PER_NODE - MIN_PIXELS_PER_NODE)
    );
    const finalScale = scale * screenScale;

    const linkDistance = interp(finalScale, MIN_LINK_DIST, MAX_LINK_DIST);
    const nodeCharge = interp(finalScale, MIN_NODE_CHARGE, MAX_NODE_CHARGE);
    const similarPercent = 0.01; // interp(finalScale, MIN_SIM_PERCENT, MAX_SIM_PERCENT);
    return { linkDistance, nodeCharge, similarPercent, density: screenScale };
}
