import { describe, it, beforeEach } from 'vitest';
import { addContent, getContentData, hasContent, resetContent } from './content';
import { resetGraph } from '../graph/graph';

describe('content.addContent', () => {
    beforeEach(() => resetGraph());

    it('adds new content', async ({ expect }) => {
        addContent('someurl', {
            labels: [],
            id: 'xyz',
            author: 'TestAuthor',
        });

        expect(hasContent('xyz')).toBe(true);
    });

    /*it('throws if the content already exists', async ({ expect }) => {
        addContent('someurl', { labels: [], id: 'xyz' });
        expect(() => addContent('someurl', { labels: [], id: 'xyz' })).toThrowError('id_exists');
    });*/
});

describe('content.getContentData', () => {
    beforeEach(() => resetContent());

    it('can get existing content data', async ({ expect }) => {
        addContent('someurl', {
            labels: [],
            id: 'xyz',
            author: 'TestAuthor',
        });

        expect(getContentData('xyz')).toBe('someurl');
    });

    it('returns undefined if there is no data', async ({ expect }) => {
        expect(getContentData('xyz')).toBeUndefined();
    });
});
