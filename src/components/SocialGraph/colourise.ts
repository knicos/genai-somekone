const COLOURS = [
    '#2e6df5',
    '#19b1a8',
    '#fad630',
    '#fd9d32',
    '#e04f66',
    '#a77bca',
    '#c2a251',
    '#97999b',
    '#8bbee8',
    '#a2e4b8',
    '#fecb8b',
    '#ff9499',
    '#002F5F',
    '#114E40',
    '#A3851F',
    '#5E2750',
    '#764242',
    '#8F7661',
];

const colours = new Map<string, string>();

export function colourLabel(label: string): string {
    if (!colours.has(label)) {
        colours.set(label, COLOURS[colours.size % COLOURS.length]);
    }
    return colours.get(label) || 'black';
}
