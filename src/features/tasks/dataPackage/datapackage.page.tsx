import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import BinaryInputRow from "./components/binaryInputRow.component";
import { createDataPackageHelper } from "./datapackage.helper";
import "./data-package.page.scss";

const DataPackagePage: React.FC = () => {
  const [generatedNumber, setGeneratedNumber] = useState<number>(0);
  const helper = useMemo(() => createDataPackageHelper(), []);

  // Generate number automatically when component mounts
  useEffect(() => {
    const newNumber = helper.generateChallenge();
    setGeneratedNumber(newNumber);
  }, [helper]);

  return (
    <>
      <div className="datapackage-container">
        <div className="datapackage-header">
          <Link to="/dashboard" className="back-to-dashboard">
            ← Zurück zum Dashboard
          </Link>
          <h1>Data Package Übung</h1>
        </div>
        
        <div className="number-display-section">
          <label htmlFor="generated-number">Zu konvertierende Zahl:</label>
          <input 
            id="generated-number"
            type="number" 
            value={generatedNumber}
            disabled={true}
            className="generated-number-input"
            min={helper.getMinValue()}
            max={helper.getMaxValue()}
          />
        </div>
        <BinaryInputRow targetNumber={generatedNumber} />
      </div>
    </>
  );
}

export default DataPackagePage;
