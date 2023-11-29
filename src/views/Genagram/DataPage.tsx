import Profile from '@genaism/components/DataProfile/DataProfile';
import { IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useRecoilState } from 'recoil';
import { menuShowData } from '@genaism/state/menuState';
import style from './style.module.css';

interface Props {
    onClose?: () => void;
}

export default function DataPage({ onClose }: Props) {
    const [showData, setShowData] = useRecoilState(menuShowData);

    return (
        <Slide
            direction="left"
            in={showData}
            mountOnEnter
            unmountOnExit
        >
            <section className={style.dataContainer}>
                <div className={style.dataInner}>
                    <header>
                        <h1>Your Data</h1>
                        <IconButton
                            size="large"
                            onClick={() => {
                                setShowData(false);
                                if (onClose) onClose();
                            }}
                        >
                            <CloseIcon fontSize="large" />
                        </IconButton>
                    </header>
                    <Profile />
                </div>
            </section>
        </Slide>
    );
}
