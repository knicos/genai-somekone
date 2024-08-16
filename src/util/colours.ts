export function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

export function isLight(colour: string): boolean {
    const col = hexToRgb(colour);
    if (!col) return true;
    const Y = 0.2126 * col.r + 0.7152 * col.g + 0.0722 * col.b;
    return Y >= 128;
}

const COLOURS = [
    '#2e6df5',
    '#fd9d32',
    '#19b1a8',
    '#fad630',
    '#e04f66',
    '#a77bca',
    '#a2e4b8',
    '#c2a251',
    '#97999b',
    '#8bbee8',
    '#fecb8b',
    '#ff9499',
    '#002F5F',
    '#114E40',
    '#A3851F',
    '#5E2750',
    '#764242',
    '#8F7661',
];

export default class Colourise {
    private colours = new Map<string, string>();

    public get(label: string): string {
        if (!this.colours.has(label)) {
            this.colours.set(label, COLOURS[this.colours.size % COLOURS.length]);
        }
        return this.colours.get(label) || 'black';
    }
}
