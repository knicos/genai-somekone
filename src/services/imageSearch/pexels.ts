interface PixabaySearchOptions {
    perPage?: number;
    page?: number;
    order?: 'latest' | 'popular';
}

interface PexelsImageSources {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
}

interface PexelsResult {
    id: number;
    width: number;
    height: number;
    url: string;
    photographer: string;
    src: PexelsImageSources;
    alt: string;
}

interface PixabayResponse {
    photos: PexelsResult[];
    page: number;
    total_results: number;
}

export async function pexelsSearch(query: string, options?: PixabaySearchOptions): Promise<PixabayResponse> {
    const response = await (query
        ? fetch(
              'https://api.pexels.com/v1/search?' +
                  new URLSearchParams({
                      query,
                      per_page: `${options?.perPage || 20}`,
                      page: `${options?.page || 1}`,
                  }),
              {
                  headers: new Headers({
                      Authorization: import.meta.env.VITE_PEXELS_KEY,
                  }),
              }
          )
        : fetch(
              'https://api.pexels.com/v1/curated?' +
                  new URLSearchParams({
                      per_page: `${options?.perPage || 20}`,
                      page: `${options?.page || 1}`,
                  }),
              {
                  headers: new Headers({
                      Authorization: import.meta.env.VITE_PEXELS_KEY,
                  }),
              }
          ));
    return await response.json();
}
