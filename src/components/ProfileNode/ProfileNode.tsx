import { cachedProfiles } from '@genaism/state/state';
import { useRecoilValue } from 'recoil';

interface Props {
    name: string;
    id: string;
}

export default function ProfileNode({ name, id }: Props) {
    const profile = useRecoilValue(cachedProfiles(id));

    return (
        <>
            <circle
                r={100}
                fill={profile ? 'white' : 'blue'}
            />
            <text textAnchor="middle">{name}</text>
        </>
    );
}
