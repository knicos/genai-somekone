import { ContentNodeId } from '@knicos/genai-recom';
import style from './style.module.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { useContent } from '@genaism/hooks/content';
import { Link } from 'react-router-dom';

interface Props {
    images: ContentNodeId[];
    selected?: number;
    onSelect?: (ix: number) => void;
    linkPrefix?: string;
    columns?: number;
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

function ImageItem({ image }: { image: ContentNodeId }) {
    const [, data] = useContent(image);
    return data ? (
        <img
            src={data}
            style={{ aspectRatio: '1/1', objectFit: 'contain' }}
            alt=""
        />
    ) : (
        <div className={style.blankImage} />
    );
}

export default function ImageGrid({ images, selected, onSelect, linkPrefix, columns = 3 }: Props) {
    const { t } = useTranslation();

    return (
        <div
            className={style.grid}
            data-testid="recom-image-grid"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
            {images.map((img, ix) =>
                onSelect ? (
                    <button
                        key={ix}
                        className={style.gridItem}
                        onClick={() => onSelect && onSelect(ix)}
                        aria-label={t('recommendations.aria.imageSelect', { number: ix + 1 })}
                    >
                        <ImageItem image={img} />
                        <SelectButton selected={selected === ix} />
                    </button>
                ) : linkPrefix ? (
                    <Link
                        key={ix}
                        to={`${linkPrefix}${img}`}
                    >
                        <div
                            className={style.gridItem}
                            data-testid={`gridimage-${ix}`}
                        >
                            <ImageItem image={img} />
                        </div>
                    </Link>
                ) : (
                    <div
                        key={ix}
                        className={style.gridItem}
                        data-testid={`gridimage-${ix}`}
                    >
                        <ImageItem image={img} />
                    </div>
                )
            )}
        </div>
    );
}
