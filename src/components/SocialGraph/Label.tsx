import LabelContent, { Props as ContentProps } from './LabelContent';

interface Props extends ContentProps {
    x: number;
    y: number;
}

export default function Label({ x, y, ...props }: Props) {
    return (
        <g transform={`translate(${Math.floor(x)}, ${Math.floor(y)})`}>
            <LabelContent {...props} />
        </g>
    );
}
