import { useGuide } from '@genaism/hooks/guidance';
import { MenuItem, MenuList } from '@mui/material';
import style from './style.module.css';
import { useEffect } from 'react';
import { useSettingDeserialise } from '@genaism/hooks/settings';
import ActionButton from './ActionButton';
import { useLocation, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';

interface Props {
    guide: string;
}

export default function Guidance({ guide }: Props) {
    const data = useGuide(guide);
    const deserial = useSettingDeserialise();
    const navigate = useNavigate();
    const { search } = useLocation();
    const [params, setParams] = useSearchParams();
    const page = params.get('page');
    const index = page !== null ? parseInt(page) : 0;

    useEffect(() => {
        if (data && index >= 0 && index < data.steps.length) {
            const settings = data.steps[index].settings;
            if (settings) {
                deserial(settings);
            }
            const url = data.steps[index].url;
            if (url) {
                navigate(url + search);
            }
        }
    }, [index, data, deserial, navigate, search]);

    const currentStep = data?.steps[index];

    return (
        <nav className={style.container}>
            <MenuList>
                {data?.steps.map((step, ix) => (
                    <MenuItem
                        selected={ix === index}
                        onClick={() =>
                            setParams((prev) => {
                                prev.set('page', `${ix}`);
                                return prev;
                            })
                        }
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
        </nav>
    );
}
