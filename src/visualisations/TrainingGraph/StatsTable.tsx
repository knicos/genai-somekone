import style from './style.module.css';

interface Props {
    stats: Record<string, string>;
}

export default function StatsTable({ stats }: Props) {
    const keys = Object.keys(stats);

    return (
        <table className={style.statsTable}>
            <tbody>
                {keys.map((k) => (
                    <tr key={k}>
                        <td className={style.heading}>{k}</td>
                        <td> {stats[k]}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
