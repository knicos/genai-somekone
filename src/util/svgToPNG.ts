async function getImageDataURL(url: string): Promise<string> {
    const response = fetch(url);
    const blob = await (await response).blob();
    return await new Promise((resolve, reject) => {
        const reader = Object.assign(new FileReader(), {
            onload: () => resolve(reader.result as string),
            onerror: () => reject(reader.error),
        });
        reader.readAsDataURL(blob);
    });
}

async function createCanvas(url: string, width: number, height: number) {
    return new Promise<HTMLCanvasElement>((resolve, reject) => {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = width;
        newCanvas.height = height;
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            const ctx = newCanvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(image, 0, 0, width, height);
            }
            resolve(newCanvas);
        };
        image.onerror = (e) => {
            console.error('Image load error', e, url);
            reject();
        };
        image.onabort = reject;
        image.src = url;
    });
}

export async function svgToPNG(svg: SVGSVGElement, scale = 1, margin = 0.01): Promise<string> {
    const bbox = svg.getBBox({
        stroke: true,
    });

    const marginX = bbox.width * margin;
    const marginY = bbox.height * margin;

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width', `${bbox.width * scale}`);
    clone.setAttribute('height', `${bbox.height * scale}`);
    clone.setAttribute(
        'viewBox',
        `${bbox.x - marginX} ${bbox.y - marginY} ${bbox.width + 2 * marginX} ${bbox.height + 2 * marginY}`
    );
    const images = clone.getElementsByTagName('image');
    for (let i = 0; i < images.length; ++i) {
        images[i].setAttribute('href', await getImageDataURL(images[i].href.baseVal));
    }

    //Get the font
    const fontData = await getImageDataURL('https://store.gen-ai.fi/fonts/Andika-Regular.ttf');
    const style = document.createElement('style');
    style.innerHTML = `@font-face {
    font-family: 'Andika';
    src: URL('${fontData}') format('truetype');
    font-weight: 400;
    font-style: normal;
} g { font-family: Andika; }`;
    if (clone.firstElementChild) {
        clone.insertBefore(style, clone.firstElementChild);
    }

    //const dataURL = `data:image/svg+xml;base64,${btoa(clone.outerHTML)}`;
    const objURL = URL.createObjectURL(new Blob([clone.outerHTML], { type: 'image/svg+xml' }));

    const canvas = await createCanvas(objURL, bbox.width * scale, bbox.height * scale);
    //URL.revokeObjectURL(objURL);
    return canvas.toDataURL('image/png');
}
