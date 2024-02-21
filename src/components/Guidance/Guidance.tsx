import { getGuidance } from '@genaism/services/guidance/guidance';
import { IconButton, MenuItem, MenuList } from '@mui/material';
import style from './style.module.css';
import { useEffect, useState } from 'react';
import { useSettingDeserialise } from '@genaism/hooks/settings';
import { Settings } from '@mui/icons-material';
import { useSetRecoilState } from 'recoil';
import { menuShowSettings } from '@genaism/state/menuState';
import ActionButton from './ActionButton';

interface Props {
    guide: string;
}

export default function Guidance({ guide }: Props) {
    const data = getGuidance(guide);
    const [index, setIndex] = useState(0);
    const deserial = useSettingDeserialise();
    const setShowSettings = useSetRecoilState(menuShowSettings);

    useEffect(() => {
        if (data && index >= 0 && index < data.steps.length) {
            const settings = data.steps[index].settings;
            if (settings) {
                deserial(settings);
            }
        }
    }, [index, data, deserial]);

    const currentStep = data?.steps[index];

    return (
        <nav className={style.container}>
            <MenuList>
                {data?.steps.map((step, ix) => (
                    <MenuItem
                        selected={ix === index}
                        onClick={() => setIndex(ix)}
                        key={ix}
                    >
                        {step.title}
                    </MenuItem>
                ))}
            </MenuList>
            {currentStep && currentStep.action && (
                <div className={style.actionContainer}>
                    <ActionButton action={currentStep.action} />
                </div>
            )}
            <div className={style.advanced}>
                <IconButton
                    color="inherit"
                    onClick={() => setShowSettings(true)}
                >
                    <Settings
                        color="inherit"
                        fontSize="large"
                    />
                </IconButton>
            </div>
        </nav>
    );
}
