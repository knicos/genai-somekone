import { cachedProfiles } from '@genaism/state/state';
import { useRecoilValue } from 'recoil';
import ImageCloud from '../ImageCloud/ImageCloud';
import { useState } from 'react';

interface Props {
    name: string;
    id: string;
}

export default function ProfileNode({ name, id }: Props) {
    const [size, setSize] = useState(100);
    const profile = useRecoilValue(cachedProfiles(id));

    return (
        <>
            <circle
                r={size + 10}
                fill={profile ? 'white' : 'blue'}
            />
            {profile?.engagedContent.length && (
                <ImageCloud
                    content={profile.engagedContent}
                    size={100}
                    padding={3}
                    onSize={setSize}
                />
            )}
            <text
                y={-size - 15}
                textAnchor="middle"
            >
                {name}
            </text>
        </>
    );
}
