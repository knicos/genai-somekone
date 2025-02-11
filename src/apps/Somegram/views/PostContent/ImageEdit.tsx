import { useContentService } from '@genaism/hooks/services';
import { ContentService, Embedding } from '@knicos/genai-recom';
import { Chip, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import style from './style.module.css';
import { LargeButton, Spinner } from '@knicos/genai-base';
import { v4 as uuidv4 } from 'uuid';
import { useUserProfile } from '@genaism/hooks/profiler';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

interface Props {
    image: string;
    onDone: () => void;
    onCancel: () => void;
}

interface LabelChoice {
    label: string;
    score: number;
    weight: number;
}

async function getSimilarContent(contentSvc: ContentService, embedding: Embedding) {
    if (!contentSvc.hasEncoder()) {
        await contentSvc.createEncoderModel({ noSave: true });
    }
    return contentSvc.getSimilarContent(embedding, 20);
}

export default function ImageEdit({ image, onDone, onCancel }: Props) {
    const { t } = useTranslation();
    const contentSvc = useContentService();
    const [labels, setLabels] = useState<LabelChoice[]>();
    const [labelCount, setLabelCount] = useState(5);
    const [embedding, setEmbedding] = useState<Embedding | undefined>();
    const profile = useUserProfile();

    useEffect(() => {
        contentSvc
            .createIsolatedEmbedding(image, [])
            .then((e) => {
                setEmbedding(e);
                getSimilarContent(contentSvc, e).then((sim) => {
                    const labelMap = new Map<string, { weight: number; score: number }>();
                    sim.forEach((s) => {
                        const meta = contentSvc.getContentMetadata(s.id);
                        if (meta) {
                            meta.labels.forEach((l) => {
                                const current = labelMap.get(l.label) || { score: 0, weight: 0 };
                                labelMap.set(l.label, { score: current.score + s.weight, weight: l.weight });
                            });
                        }
                    });
                    const bestLabels = Array.from(labelMap);
                    bestLabels.sort((a, b) => b[1].score - a[1].score);
                    setLabels(bestLabels.map((b) => ({ label: b[0], score: b[1].score, weight: b[1].weight })));
                });
            })
            .catch(() => {
                setLabels([]);
            });
    }, [image, contentSvc]);

    return (
        <>
            <div className={style.imageContainer}>
                <img
                    src={image}
                    width="100%"
                    alt=""
                />
                <div className={style.topRightButtons}>
                    <IconButton
                        color="inherit"
                        onClick={onCancel}
                    >
                        <CloseIcon fontSize="large" />
                    </IconButton>
                </div>
            </div>
            {labels && (
                <div className={style.labelChips}>
                    {labels.slice(0, labelCount).map((label, ix) => (
                        <Chip
                            variant="outlined"
                            key={ix}
                            label={`#${label.label}`}
                            onDelete={() => {
                                setLabels((old) => (old || []).filter((l) => l.label !== label.label));
                                setLabelCount((old) => old - 1);
                            }}
                        />
                    ))}
                    <Chip
                        variant="filled"
                        color="primary"
                        label={t('profile.actions.more')}
                        icon={<AddIcon />}
                        onClick={() => setLabelCount((old) => old + 5)}
                    />
                </div>
            )}
            {!labels && (
                <div className={style.spinnerContainer}>
                    <Spinner />
                </div>
            )}
            <div className={style.postButtonContainer}>
                <LargeButton
                    disabled={!labels}
                    startIcon={<DoneIcon fontSize="large" />}
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                        contentSvc.postContent(image, {
                            id: uuidv4(),
                            author: profile.name,
                            authorId: profile.id,
                            embedding,
                            labels:
                                labels?.slice(0, labelCount).map((l) => ({ label: l.label, weight: l.weight })) || [],
                        });
                        onDone();
                    }}
                >
                    {t('profile.actions.post')}
                </LargeButton>
            </div>
        </>
    );
}
