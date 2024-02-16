const LOREM =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Massa ultricies mi quis hendrerit. Aliquam ut porttitor leo a diam sollicitudin tempor. Condimentum mattis pellentesque id nibh tortor id. Viverra accumsan in nisl nisi scelerisque. Venenatis tellus in metus vulputate eu. Arcu vitae elementum curabitur vitae nunc sed. Et molestie ac feugiat sed lectus. Interdum velit euismod in pellentesque massa placerat. Est placerat in egestas erat imperdiet sed. Commodo odio aenean sed adipiscing diam donec adipiscing. Eget aliquet nibh praesent tristique magna sit amet. Curabitur vitae nunc sed velit dignissim sodales ut eu. Odio morbi quis commodo odio. Magna sit amet purus gravida quis blandit turpis cursus. Nibh cras pulvinar mattis nunc sed blandit libero volutpat sed. Neque sodales ut etiam sit amet. Enim nec dui nunc mattis enim. Sit amet nisl purus in mollis. In hendrerit gravida rutrum quisque non tellus orci ac auctor.';

export function anonString(text: string): string {
    return LOREM.slice(0, text.length);
}

const ALLOWED = 'abcdefghijklmnopqrstuvwxyz';

export function anonUsername() {
    const array = new Uint32Array(5);
    crypto.getRandomValues(array);
    const strarray = Array.from(array).map((v) => ALLOWED.charAt(v % ALLOWED.length));
    return strarray.join('');
}
