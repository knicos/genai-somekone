import style from './style.module.css';

interface Props {
    size?: 'small' | 'large';
}

export default function Spinner({ size }: Props) {
    return (
        <div className={size === 'large' ? style.largeSpinner : style.spinner}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
}
