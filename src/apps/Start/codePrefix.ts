import { AppType } from '../Dashboard/state/settingsState';

export function codeToApp(code: string): AppType {
    if (code.startsWith('2')) return 'profile';
    if (code.startsWith('1')) return 'flow';
    return 'feed';
}

export function appToCode(app: AppType, code: string): string {
    switch (app) {
        case 'feed':
            return `0${code}`;
        case 'flow':
            return `1${code}`;
        case 'profile':
            return `2${code}`;
    }
}
