interface PixabaySearchOptions {
    perPage?: number;
    page?: number;
    order?: 'latest' | 'popular';
}

interface PixabayResult {
    collections: number;
    downloads: number;
    id: number;
    imageHeight: number;
    imageWidth: number;
    imageSize: number;
    largeImageURL: string;
    likes: number;
    pageURL: string;
    previewHeight: number;
    previewURL: string;
    previewWidth: number;
    tags: string;
    type: string;
    user: string;
    userImageURL: string;
    user_id: number;
    views: number;
    webformatURL: string;
    webformatWidth: number;
    webformatHeight: number;
}

interface PixabayResponse {
    total: number;
    totalHits: number;
    hits: PixabayResult[];
}

export async function pixabaySearch(query: string, options?: PixabaySearchOptions): Promise<PixabayResponse> {
    const response = await fetch(
        'https://pixabay.com/api/?' +
            new URLSearchParams({
                key: import.meta.env.VITE_PIXABAY_KEY,
                q: query,
                image_type: 'photo',
                /*orientation: 'horizontal',*/
                safesearch: 'true',
                order: options?.order || 'latest',
                per_page: `${options?.perPage || 20}`,
                page: `${options?.page || 1}`,
            })
    );
    return await response.json();
}
