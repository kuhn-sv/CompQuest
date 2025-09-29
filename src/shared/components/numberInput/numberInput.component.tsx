import React, { useState } from 'react';
import './numberInput.component.scss';
import { createNumberInputHelpers } from './numberInput.helper';
import type { NumberInputProps } from '../../interfaces';

const NumberInputComponent: React.FC<NumberInputProps> = ({ value: propValue, onChange }) => {
    const config = { min: 0, max: 1 };
    const helpers = createNumberInputHelpers(config);
    const [internalValue, setInternalValue] = useState(config.min);
    
    // Use prop value if provided, otherwise use internal state
    const value = propValue !== undefined ? propValue : internalValue;
    const setValue = (newValue: number) => {
        if (onChange) {
            onChange(newValue);
        } else {
            setInternalValue(newValue);
        }
    };

    const handleIncrement = () => {
        setValue(helpers.increment(value));
    };

    const handleDecrement = () => {
        setValue(helpers.decrement(value));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = helpers.parseInputValue(e.target.value);
        setValue(newValue);
    };

    return (
        <div className="number-input-container">
            <button 
                className="arrow-button up" 
                onClick={handleIncrement}
                disabled={!helpers.canIncrement(value)}
            />
            <input 
                type="number" 
                min={config.min} 
                max={config.max} 
                value={value}
                onChange={handleInputChange}
            />
            <button 
                className="arrow-button down" 
                onClick={handleDecrement}
                disabled={!helpers.canDecrement(value)}
            />
        </div>
    );
};

export default NumberInputComponent;