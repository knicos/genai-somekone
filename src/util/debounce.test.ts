import { describe, it } from 'vitest';
import { debounce, debounce_leading } from './debounce';

function wait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

describe('debounce_learing()', () => {
    it('triggers immediately', async ({ expect }) => {
        let test = 0;
        const [f] = debounce_leading(() => {
            test = 1;
        }, 1000);

        f();
        expect(test).toBe(1);
    });

    it('triggers eventually', async ({ expect }) => {
        let test = 0;
        const [f] = debounce_leading(() => {
            ++test;
        }, 100);

        f();
        f();
        expect(test).toBe(1);
        await wait(200);
        expect(test).toBe(2);
    });

    it('ignores too many triggers', async ({ expect }) => {
        let test = 0;
        const [f] = debounce_leading(() => {
            ++test;
        }, 100);

        f();
        f();
        f();
        f();
        expect(test).toBe(1);
        await wait(200);
        expect(test).toBe(2);
    });

    it('cancels the call', async ({ expect }) => {
        let test = 0;
        const [f, c] = debounce_leading(() => {
            ++test;
        }, 100);

        f();
        f();
        c();
        expect(test).toBe(1);
        await wait(200);
        expect(test).toBe(1);
    });

    it('uses the most recent arguments', async ({ expect }) => {
        let test = 0;
        const [f] = debounce_leading((v: number) => {
            test = v;
        }, 100);

        f(10);
        f(20);
        f(30);
        expect(test).toBe(10);
        await wait(200);
        expect(test).toBe(30);
    });
});

describe('debounce()', () => {
    it('does not trigger immediately', async ({ expect }) => {
        let test = 0;
        const [f, c] = debounce(() => {
            test = 1;
        }, 1000);

        f();
        expect(test).toBe(0);
        c();
    });

    it('triggers eventually', async ({ expect }) => {
        let test = 0;
        const [f] = debounce(() => {
            ++test;
        }, 100);

        f();
        f();
        expect(test).toBe(0);
        await wait(200);
        expect(test).toBe(1);
    });

    it('cancels the call', async ({ expect }) => {
        let test = 0;
        const [f, c] = debounce(() => {
            ++test;
        }, 100);

        f();
        c();
        expect(test).toBe(0);
        await wait(200);
        expect(test).toBe(0);
    });

    it('uses the most recent arguments', async ({ expect }) => {
        let test = 0;
        const [f] = debounce((v: number) => {
            test = v;
        }, 100);

        f(10);
        f(20);
        expect(test).toBe(0);
        await wait(200);
        expect(test).toBe(20);
    });
});
