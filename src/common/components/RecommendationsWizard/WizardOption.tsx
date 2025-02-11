import { Radio } from '@mui/material';
import style from './style.module.css';
import { InputHTMLAttributes } from 'react';

interface Props {
    label: string;
    description?: string;
    value: string;
    color?: string;
    disabled?: boolean;
    selected?: boolean;
}

export default function WizardOption({ label, description, value, color, disabled, selected }: Props) {
    return (
        <label
            className={disabled ? style.wizardLabelDisabled : style.wizardLabelContainer}
            style={{ borderColor: color || undefined }}
        >
            <Radio
                value={value}
                disabled={disabled}
                inputProps={{ 'data-testid': `${value}-option` } as InputHTMLAttributes<HTMLInputElement>}
            />
            <div className={style.wizardLabelGroup}>
                <span className={selected ? style.wizardLabelSelect : style.wizardLabel}>{label}</span>
                <span className={style.wizardLabelDesc}>{description}</span>
            </div>
        </label>
    );
}
