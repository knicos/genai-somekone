import { ContentNodeId } from '@knicos/genai-recom';
import style from './style.module.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { useContentService } from '@genaism/hooks/services';

interface Props {
    images: ContentNodeId[];
    selected?: number;
    onSelect?: (ix: number) => void;
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

export default function ImageGrid({ images, selected, onSelect }: Props) {
    const { t } = useTranslation();
    const content = useContentService();

    return (
        <div
            className={style.grid}
            data-testid="recom-image-grid"
        >
            {images.map((img, ix) =>
                onSelect ? (
                    <button
                        key={ix}
                        className={style.gridItem}
                        onClick={() => onSelect && onSelect(ix)}
                        aria-label={t('recommendations.aria.imageSelect', { number: ix + 1 })}
                    >
                        <img
                            src={content.getContentData(img)}
                            style={{ aspectRatio: '1/1', objectFit: 'contain' }}
                            alt={t('recommendations.aria.imageSelect', { number: ix + 1 })}
                        />
                        <SelectButton selected={selected === ix} />
                    </button>
                ) : (
                    <div
                        key={ix}
                        className={style.gridItem}
                        data-testid={`gridimage-${ix}`}
                    >
                        <img
                            src={content.getContentData(img)}
                            style={{ aspectRatio: '1/1', objectFit: 'contain' }}
                            alt=""
                        />
                    </div>
                )
            )}
        </div>
    );
}
