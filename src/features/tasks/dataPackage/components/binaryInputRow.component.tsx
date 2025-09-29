import React, { useState, useEffect } from "react";
import { createBinaryInputHelper } from "./binaryInputRow.helper";
import "./binaryInputRow.component.scss";
import NumberInputComponent from "../../../../shared/components/numberInput/numberInput.component";
import type { BinaryInputRowProps } from "../interfaces";

const BinaryInputRow: React.FC<BinaryInputRowProps> = ({ targetNumber }) => {
    const [binaryValues, setBinaryValues] = useState<number[]>(new Array(8).fill(0));
    const [result, setResult] = useState<string>("0");
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    
    const helper = createBinaryInputHelper(8);

    // Update result whenever binary values change
    useEffect(() => {
        const decimalResult = helper.calculateResult(binaryValues);
        setResult(helper.formatResult(decimalResult));
        
        // Check if the result matches the target number
        if (targetNumber !== undefined) {
            setIsCorrect(decimalResult === targetNumber);
        }
    }, [binaryValues, helper, targetNumber]);

    const handleValueChange = (index: number, value: number) => {
        const newBinaryValues = [...binaryValues];
        newBinaryValues[index] = value;
        setBinaryValues(newBinaryValues);
    };

    return (
        <div className="binary-input-row">
            <div className="binary-inputs">
                {Array.from({ length: 8 }, (_, index) => (
                    <NumberInputComponent 
                        key={index} 
                        value={binaryValues[index]}
                        onChange={(value) => handleValueChange(index, value)}
                    />
                ))}
            </div>
            <span className="equals-sign">=</span>
            <input 
                type="text" 
                disabled={true} 
                className={`result-input ${isCorrect ? 'correct' : ''}`}
                value={result} 
            />
            {targetNumber !== undefined && isCorrect && (
                <span className="success-indicator">✓</span>
            )}
        </div>
    );
};
export default BinaryInputRow;