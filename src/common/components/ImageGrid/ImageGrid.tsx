import { ContentNodeId } from '@knicos/genai-recom';
import style from './style.module.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { useContent } from '@genaism/hooks/content';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

interface Props {
    images: ContentNodeId[];
    selected?: ContentNodeId | ContentNodeId[];
    onSelect?: (item: ContentNodeId) => void;
    linkPrefix?: string;
    columns?: number;
    multiselect?: number;
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

export default function ImageGrid({ multiselect, images, selected, onSelect, linkPrefix, columns = 3 }: Props) {
    const { t } = useTranslation();

    const selectedSet = useMemo(
        () =>
            selected === undefined
                ? new Set<ContentNodeId>()
                : new Set(Array.isArray(selected) ? selected : [selected]),
        [selected]
    );

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
                        onClick={() => {
                            if (onSelect && (!multiselect || selectedSet.size < multiselect)) {
                                onSelect(img);
                            }
                        }}
                        aria-label={t('recommendations.aria.imageSelect', { ns: 'common', number: ix + 1 })}
                    >
                        <ImageItem image={img} />
                        <SelectButton selected={selectedSet.has(img)} />
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
