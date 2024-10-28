import style from './style.module.css';
import { useCallback, useEffect, useState } from 'react';
import WebcamView from './WebcamView';
import ImageEdit from './ImageEdit';
import { useNavigate } from 'react-router';
import { useSetRecoilState } from 'recoil';
import { uiDarkMode } from '@genaism/state/uiState';
//import { useUserProfile } from '@genaism/hooks/profiler';

export default function PostContent() {
    const navigate = useNavigate();
    const setDarkMode = useSetRecoilState(uiDarkMode);

    //const profile = useUserProfile(id);

    const [image, setImage] = useState<string | undefined>();

    useEffect(() => {
        if (!image) setDarkMode(true);
        else setDarkMode(false);
        return () => setDarkMode(false);
    }, [setDarkMode, image]);

    const doDone = useCallback(() => {
        navigate(-1);
    }, [navigate]);
    const doCancel = useCallback(() => {
        setImage(undefined);
    }, []);

    return (
        <div className={style.outerContainer}>
            <div
                className={image ? style.container : style.darkContainer}
                tabIndex={0}
            >
                {image && (
                    <ImageEdit
                        image={image}
                        onDone={doDone}
                        onCancel={doCancel}
                    />
                )}
                {!image && <WebcamView onImage={setImage} />}
            </div>
        </div>
    );
}
