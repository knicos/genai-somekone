import Colourise from '@genaism/util/colours';

const colours = new Colourise();

export function colourLabel(label: string): string {
    return colours.get(label);
}
