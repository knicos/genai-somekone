export async function bytesToBase64DataUrl(bytes: BlobPart, type = 'image/jpeg'): Promise<string> {
    return await new Promise((resolve, reject) => {
        const reader = Object.assign(new FileReader(), {
            onload: () => resolve(reader.result as string),
            onerror: () => reject(reader.error),
        });
        reader.readAsDataURL(new File([bytes], '', { type }));
    });
}

export async function dataUrlToBytes(dataUrl: string) {
    const res = await fetch(dataUrl);
    return new Uint8Array(await res.arrayBuffer());
}
