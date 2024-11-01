import { UserNodeId, WeightedLabel, WeightedNode } from '@knicos/genai-recom';
import UserItem from './UserItem';
import style from './style.module.css';
import { colourLabel } from '@genaism/visualisations/SocialGraph/colourise';
import { useProfilerService } from '@genaism/hooks/services';
import { useEffect, useState } from 'react';
import { Button } from '@knicos/genai-base';
import { useTranslation } from 'react-i18next';
import { useSimilarityData } from '@genaism/hooks/similarity';

function buildList(
    id: UserNodeId,
    all: UserNodeId[],
    similar: Map<UserNodeId, WeightedNode<UserNodeId>[]>,
    topics?: Map<UserNodeId, WeightedLabel>
) {
    const result: UserNodeId[] = [];
    const seen = new Set<UserNodeId>();
    const s = similar.get(id);
    if (s) {
        s.forEach((u) => {
            result.push(u.id);
            seen.add(u.id);
        });
    }
    const sorted = [...all];
    sorted.sort((a, b) => (topics?.get(a)?.label || 'zz').localeCompare(topics?.get(b)?.label || 'zz'));

    sorted.forEach((u) => {
        if (!seen.has(u)) {
            result.push(u);
        }
    });

    return result;
}

interface Props {
    onSelect: (id: UserNodeId[]) => void;
    multiple?: boolean | number;
    preSelected?: UserNodeId[];
}

export default function UserListing({ onSelect, multiple, preSelected }: Props) {
    const { t } = useTranslation();
    const similar = useSimilarityData();
    const users = similar.users;
    const profiler = useProfilerService();
    const [selected, setSelected] = useState(new Set<UserNodeId>());

    const sorted = buildList(profiler.getCurrentUser(), users, similar.similar, similar.clusters);

    useEffect(() => {
        if (preSelected) {
            setSelected(new Set(preSelected));
        }
    }, [preSelected]);

    return (
        <div className={style.userSection}>
            <ul>
                {sorted.map((user) => (
                    <UserItem
                        key={user}
                        id={user}
                        multiple={!!multiple}
                        onSelect={() => {
                            if (multiple === true || (multiple && multiple > 1)) {
                                setSelected((old) => {
                                    const newSet = new Set(old);
                                    if (newSet.has(user)) {
                                        newSet.delete(user);
                                    } else {
                                        if (multiple === true || multiple > newSet.size) {
                                            newSet.add(user);
                                        }
                                    }
                                    return newSet;
                                });
                            } else {
                                onSelect([user]);
                            }
                        }}
                        selected={selected?.has(user)}
                        colour={colourLabel(similar.clusters.get(user)?.label || 'nocluster')}
                    />
                ))}
            </ul>
            {(multiple === true || (multiple && multiple > 1)) && (
                <Button
                    disabled={selected.size === 0}
                    onClick={() => onSelect(Array.from(selected))}
                    variant="contained"
                    color="primary"
                    data-testid="user-select-button"
                >
                    {t('dashboard.actions.select')}
                </Button>
            )}
        </div>
    );
}
