export type LabelLocale = Record<string, Record<string, string>>;

export default class LocaliserService {
    private labels: LabelLocale = {};

    public addLabelLocales(locale: LabelLocale) {
        const keys = Object.keys(locale);
        keys.forEach((key) => {
            this.labels[key] = { ...this.labels[key], ...locale[key] };
        });
    }

    public getLocalisedLabel(label: string, locale = 'en'): string {
        const loc = this.labels[locale];
        if (loc) {
            const l = loc[label];
            if (l) return l;
        }
        return label;
    }
}

export const localiser = new LocaliserService();
