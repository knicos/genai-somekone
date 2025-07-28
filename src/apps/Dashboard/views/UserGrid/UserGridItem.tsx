import { useUserProfile } from '@genaism/hooks/profiler';
import { UserNodeId } from '@genai-fi/recom';
import style from './style.module.css';
import { useContentData } from '@genaism/hooks/content';
import { useAtom, useAtomValue } from 'jotai';
import { menuSelectedUser } from '@genaism/apps/Dashboard/state/menuState';
import { MouseEvent, useCallback, useRef, useState } from 'react';
import { settingNodeMode } from '@genaism/apps/Dashboard/state/settingsState';
import ImageCloud from '@genaism/common/visualisations/ImageCloud/ImageCloud';
import { useContentService } from '@genaism/hooks/services';
import WordCloud from '@genaism/common/visualisations/WordCloud/WordCloud';

interface Props {
    id: UserNodeId;
    colour: string;
}

const CLOUD_SCALE = 1;

export default function UserGridItem({ id, colour }: Props) {
    const profile = useUserProfile(id);
    const image = useContentData(profile.image);
    const [selectedUser, setSelectedUser] = useAtom(menuSelectedUser);
    const nodeMode = useAtomValue(settingNodeMode);
    const content = useContentService();
    const svgRef = useRef<SVGSVGElement>(null);
    const [wcSize, setWCSize] = useState(300);
    const doResize = useCallback((size: number) => {
        setWCSize(size);
    }, []);

    return (
        <button
            tabIndex={0}
            data-testid={`user-grid-item-${id}`}
            aria-pressed={selectedUser === id}
            className={style.gridItem}
            onClick={(e: MouseEvent) => {
                setSelectedUser((old) => (old === id ? undefined : id));
                e.stopPropagation();
            }}
        >
            <div className={style.userImageContainer}>
                {nodeMode === 'profileImage' && image && (
                    <img
                        src={image}
                        alt=""
                        data-testid={`profile-image-${id}`}
                    />
                )}
                {nodeMode === 'profileImage' && !image && <div className={style.placeholder} />}
                {nodeMode === 'image' && (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox={`${-(wcSize * CLOUD_SCALE)} ${-wcSize} ${wcSize * CLOUD_SCALE * 2} ${wcSize * 2}`}
                        ref={svgRef}
                        data-testid={`imagecloud-${id}`}
                    >
                        <ImageCloud
                            content={profile.affinities.contents.contents.map((c) => ({
                                weight: c.weight,
                                image: content.getContentData(c.id, true) || '',
                            }))}
                            size={300}
                            onSize={doResize}
                            count={10}
                        />
                    </svg>
                )}
                {nodeMode === 'word' && (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        ref={svgRef}
                        data-testid={`wordcloud-${id}`}
                        viewBox={`${-(wcSize * CLOUD_SCALE)} ${-wcSize} ${wcSize * CLOUD_SCALE * 2} ${wcSize * 2}`}
                    >
                        <WordCloud
                            content={profile.affinities.topics.topics}
                            size={300}
                            className={style.word}
                            onSize={doResize}
                        />
                    </svg>
                )}
            </div>
            <div className={selectedUser === id ? style.selectedUserNameContainer : style.userNameContainer}>
                <div
                    className={style.colourBox}
                    style={{ background: colour }}
                />
                {profile.name}
            </div>
        </button>
    );
}
