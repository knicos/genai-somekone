import { useEffect, useState } from 'react';
import { pixabaySearch } from './pixabay';
import { pexelsSearch } from './pexels';

export type SearchSource = 'pixabay' | 'pexels';

interface Options {
    source?: SearchSource;
    page?: number;
}

export interface ImageResult {
    id: string;
    url: string;
    author: string;
    tags: string[];
    width: number;
    height: number;
}

export interface ImageSearchResult {
    total: number;
    pages: number;
    results: ImageResult[];
}

const DEFAULT_RESULT: ImageSearchResult = {
    total: 0,
    pages: 0,
    results: [],
};

export default function useImageSearch(q: string, options?: Options): ImageSearchResult {
    const [results, setResults] = useState<ImageSearchResult>(DEFAULT_RESULT);
    const source = options?.source || 'pixabay';
    const page = options?.page || 0;

    useEffect(() => {
        if (source === 'pixabay') {
            pixabaySearch(q, { page, perPage: 20 }).then((r) => {
                setResults({
                    total: r.totalHits,
                    pages: Math.ceil(r.totalHits / 20),
                    results: r.hits.map((h) => ({
                        url: h.webformatURL,
                        author: h.user,
                        tags: h.tags.split(',').map((t) => t.trim()),
                        id: `pixabay-${h.id}`,
                        width: h.webformatWidth,
                        height: h.webformatHeight,
                    })),
                });
            });
        } else if (source === 'pexels') {
            pexelsSearch(q, { page, perPage: 40 }).then((r) => {
                setResults({
                    total: r.total_results,
                    pages: Math.ceil(r.total_results / 40),
                    results: r.photos.map((h) => ({
                        url: h.src.large,
                        author: h.photographer,
                        tags: [],
                        id: `pexels-${h.id}`,
                        width: h.width,
                        height: h.height,
                    })),
                });
            });
        }
    }, [q, source, page]);

    return results;
}
