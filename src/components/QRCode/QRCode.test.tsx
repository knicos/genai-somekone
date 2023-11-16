import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import QRCode from './QRCode';
import qr from 'qrcode';

vi.mock('qrcode', () => ({
    default: { toCanvas: vi.fn(async () => {}) },
}));

describe('QRCode component', () => {
    it('renders a qrcode', async ({ expect }) => {
        render(<QRCode url="http://testurl.fi" />);

        expect(screen.getByTestId('qr-code-canvas')).toBeVisible();
        expect(qr.toCanvas).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 'http://testurl.fi');
    });
});
