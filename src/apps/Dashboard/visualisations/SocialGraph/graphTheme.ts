export interface SocialGraphTheme {
    background?: string;
    transparentLinks?: boolean;
    linkColour?: string;
    labelColour?: string;
}

export type SocialGraphThemes = 'default' | 'highContrast';

const theme: Record<SocialGraphThemes, SocialGraphTheme> = {
    default: {
        transparentLinks: true,
        linkColour: '#5f7377',
    },
    highContrast: {
        background: 'white',
        transparentLinks: false,
        linkColour: '#aaa',
        labelColour: '#5f7377',
    },
};

export default theme;
