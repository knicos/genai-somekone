import { useServices } from '@genaism/hooks/services';
import { UserNodeId } from '@knicos/genai-recom';
import style from './style.module.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Props {
    id: UserNodeId;
    onSelect: () => void;
    colour?: string;
    selected?: boolean;
    multiple?: boolean;
}

interface SelectProps {
    selected?: boolean;
}

function SelectButton({ selected }: SelectProps) {
    return (
        <div className={selected ? style.selectedButton : style.selectButton}>
            {selected && <CheckCircleIcon color="inherit" />}
        </div>
    );
}

export default function UserItem({ id, onSelect, colour, selected, multiple }: Props) {
    const { content, profiler } = useServices();

    const data = profiler.getUserData(id);

    return (
        <li>
            <button
                onClick={onSelect}
                aria-label={data?.name || 'Missing name'}
            >
                {data?.image ? (
                    <img
                        src={content.getContentData(data.image)}
                        alt=""
                        width={50}
                        height={50}
                        style={{ borderColor: colour || '#444' }}
                    />
                ) : (
                    <div className={style.placeholderImage} />
                )}
                {data?.name}
                <div style={{ flexGrow: 1 }} />
                {multiple && <SelectButton selected={selected} />}
            </button>
        </li>
    );
}
