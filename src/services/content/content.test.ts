import { describe, it, beforeEach } from 'vitest';
import { addContent, getContentData, hasContent, resetContent } from './content';
import { getEdgesOfType, resetGraph } from '@genaism/services/graph/graph';

describe('content.addContent', () => {
    beforeEach(() => resetGraph());

    it('adds new content', async ({ expect }) => {
        addContent('someurl', {
            labels: [],
            id: 'xyz',
            author: 'TestAuthor',
        });

        expect(hasContent('content:xyz')).toBe(true);
    });

    it('adds new content with labels', async ({ expect }) => {
        addContent('someurl', {
            labels: [{ label: 'testlabel', weight: 1.0 }],
            id: 'xyz',
            author: 'TestAuthor',
        });

        expect(hasContent('content:xyz')).toBe(true);
        expect(getEdgesOfType('topic', 'content:xyz')).toHaveLength(1);
    });
});

describe('content.getContentData', () => {
    beforeEach(() => resetContent());

    it('can get existing content data', async ({ expect }) => {
        addContent('someurl', {
            labels: [],
            id: 'xyz',
            author: 'TestAuthor',
        });

        expect(getContentData('content:xyz')).toBe('someurl');
    });

    it('returns undefined if there is no data', async ({ expect }) => {
        expect(getContentData('content:xyz')).toBeUndefined();
    });
});
