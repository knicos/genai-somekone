import ImageCloud from '../ImageCloud/ImageCloud';
import { useState } from 'react';
import { useUserProfile } from '@genaism/services/users/users';

interface Props {
    id: string;
}

export default function ProfileNode({ id }: Props) {
    const [size, setSize] = useState(100);

    const profile = useUserProfile(id);

    return (
        <>
            <circle
                r={size + 10}
                fill="white"
                opacity="0.5"
            />
            {profile.engagedContent.length && (
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
                {profile.name}
            </text>
        </>
    );
}
