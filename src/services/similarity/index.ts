import { getProfilerService } from '@knicos/genai-recom';
import SimilarityService from './similarityService';
export { SimilarityService };

let service: SimilarityService;

export function getSimilarityService(): SimilarityService {
    if (!service) {
        service = new SimilarityService(getProfilerService());
    }
    return service;
}
