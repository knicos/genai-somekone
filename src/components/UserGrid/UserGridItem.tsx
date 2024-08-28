import { useUserProfile } from '@genaism/hooks/profiler';
import { UserNodeId } from '@knicos/genai-recom';
import style from './style.module.css';
import { useContentData } from '@genaism/hooks/content';
import { useRecoilState, useRecoilValue } from 'recoil';
import { menuSelectedUser } from '@genaism/state/menuState';
import { MouseEvent, useCallback, useRef, useState } from 'react';
import { settingNodeMode } from '@genaism/state/settingsState';
import ImageCloud from '../ImageCloud/ImageCloud';
import { useContentService } from '@genaism/hooks/services';
import WordCloud from '../WordCloud/WordCloud';

interface Props {
    id: UserNodeId;
    colour: string;
}

const CLOUD_SCALE = 1;

export default function UserGridItem({ id, colour }: Props) {
    const profile = useUserProfile(id);
    const image = useContentData(profile.image);
    const [selectedUser, setSelectedUser] = useRecoilState(menuSelectedUser);
    const nodeMode = useRecoilValue(settingNodeMode);
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
                {nodeMode === 'image' && profile.affinities.contents.contents.length > 0 && (
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
                                image: content.getContentData(c.id) || '',
                            }))}
                            size={300}
                            onSize={doResize}
                            count={10}
                        />
                    </svg>
                )}
                {nodeMode === 'word' && profile.affinities.topics.topics.length > 0 && (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        ref={svgRef}
                        data-testid={`wordcloud-${id}`}
                        viewBox={`${-(wcSize * CLOUD_SCALE)} ${-wcSize} ${wcSize * CLOUD_SCALE * 2} ${wcSize * 2}`}
                    >
                        <style>{'rect {opacity: 0.9; fill: #5f7377;} text { fill: white;}'}</style>
                        <WordCloud
                            content={profile.affinities.topics.topics}
                            size={300}
                            className={style.word}
                            onSize={doResize}
                        />
                    </svg>
                )}
            </div>
            <div
                className={selectedUser === id ? style.selectedUserNameContainer : style.userNameContainer}
                style={selectedUser === id ? undefined : { background: colour }}
            >
                {profile.name}
            </div>
        </button>
    );
}
