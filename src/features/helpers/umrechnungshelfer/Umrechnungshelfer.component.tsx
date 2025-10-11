import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {SubTaskComponentProps} from '../../../shared/interfaces/tasking.interfaces';
import './Umrechnungshelfer.scss';
import TabRow from '../../../shared/components/tabRow/TabRow.component';
import '../../../shared/components/BaseValueSpinner/BaseValueSpinner.scss';
import StepPanel from './components/StepPanel/StepPanel';
import './components/StepPanel/StepPanel.scss';
import './components/PlaceValueInputGrid/PlaceValueInputGrid.scss';
import Step1Box from './components/Step1Box/Step1Box';
import Step2Box from './components/Step2Box/Step2Box';
import ResultLine from './components/ResultLine/ResultLine';
import {useBaseConvert} from './hooks/useBaseConvert';
import {useStepperExpanded} from './hooks/useStepperExpanded';
// keep local ModeTab type below for clarity
import {useOctalStep} from './hooks/useOctalStep';
// UI helpers not used yet

type ModeTab = 'binhex' | 'binoct' | 'octhex';
const BITS = 8;

const Umrechnungshelfer: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
}) => {
  const {
    toBits,
    bitsToDecimal,
    decimalToHex,
    decimalToOct,
    bitsToOctalDigits,
    octalDigitsToString,
  } = useBaseConvert();
  const [tab, setTab] = useState<ModeTab>('binhex');
  // targetDec optional for future steps; for now we derive expectedDec from bits
  const [targetBits, setTargetBits] = useState<number[]>(Array(BITS).fill(0));
  const [entries, setEntries] = useState<Array<0 | 1 | null>>(
    Array(BITS).fill(null),
  );
  const [evaluated, setEvaluated] = useState(false);

  const expectedDec = useMemo(
    () => bitsToDecimal(targetBits),
    [bitsToDecimal, targetBits],
  );
  const expectedOctDigits = useMemo(
    () => bitsToOctalDigits(targetBits),
    [bitsToOctalDigits, targetBits],
  );
  const expectedOct = useMemo(
    () => decimalToOct(expectedDec),
    [decimalToOct, expectedDec],
  );

  // User-entered bits and derived values
  const userBits = useMemo(
    () => entries.map(v => (v === 1 ? 1 : 0)),
    [entries],
  );
  const userDec = useMemo(
    () => bitsToDecimal(userBits),
    [bitsToDecimal, userBits],
  );
  const userHex = useMemo(() => decimalToHex(userDec), [decimalToHex, userDec]);
  const isDecCorrect = userDec === expectedDec;

  // Per-tab expand state via helper hook (needs to be declared before it's used in newTask)
  const {
    expanded,
    toggle: toggleExpanded,
    reset: resetExpanded,
  } = useStepperExpanded();

  const newTask = useCallback(() => {
    const n = Math.floor(Math.random() * 256); // 0..255
    setTargetBits(toBits(n, BITS));
    setEntries(Array(BITS).fill(null));
    // reset octal step state via hook below (if available later) and collapse panels
    resetExpanded();
    setEvaluated(false);
  }, [toBits, resetExpanded]);

  // init and provide controls to container
  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      newTask();
    }
  }, [newTask]);

  useEffect(() => {
    const subtitle =
      tab === 'binhex'
        ? 'Modus: Binär ↔ Hexadezimal'
        : tab === 'binoct'
          ? 'Modus: Binär ↔ Oktal'
          : 'Modus: Oktal ↔ Hexadezimal';
    onHudChange?.({
      subtitle,
      progress: null,
    });
    onControlsChange?.({
      onReset: () => newTask(),
      onEvaluate: () => setEvaluated(true),
      onNext: () => newTask(),
      showReset: true,
      showEvaluate: true,
      showNext: true,
    });
    return () => {
      onHudChange?.(null);
      onControlsChange?.(null);
    };
  }, [onControlsChange, onHudChange, newTask, tab]);

  const setEntry = (idx: number, val: 0 | 1 | null) =>
    setEntries(prev => prev.map((v, i) => (i === idx ? val : v)));

  // input rows now handled by PlaceValueInputGrid component

  const binaryString = useMemo(() => targetBits.join(''), [targetBits]);

  // Oktal ↔ Hex Step 1 encapsulated via hook
  const {
    octEntries,
    expectedOctalDigitsPadded,
    userOctDec,
    isCorrect: isOctStep1Correct,
    onChange: onChangeOct,
  } = useOctalStep(expectedOctDigits, expectedDec);
  const canProceedToStep2OctHex = isOctStep1Correct;

  // Active tab config for rendering two-step flow
  const activeConfig = useMemo(() => {
    if (tab === 'binhex') {
      return {
        step1Title: 'Binär → Dezimal',
        headerRight: (
          <div className="uh-target">
            {binaryString}
            <span className="uh-base">₂</span>
          </div>
        ),
        step1Node: (
          <Step1Box
            base={2}
            width={BITS}
            values={entries}
            expected={targetBits}
            evaluated={evaluated}
            onChange={(idx, val) => setEntry(idx, val as 0 | 1 | null)}
            decimalValue={userDec}
            isCorrect={isDecCorrect}
          />
        ),
        canProceed: isDecCorrect,
        decimalValue: userDec,
        step2Title: 'Dezimal → Hexadezimal',
        step2Box: (
          <Step2Box
            base={16}
            restMode="hex"
            initialDecimal={userDec}
            showContent={true}
            expectedDigits={userHex}
          />
        ),
      } as const;
    }
    if (tab === 'binoct') {
      return {
        step1Title: 'Binär → Dezimal',
        headerRight: (
          <div className="uh-target">
            {binaryString}
            <span className="uh-base">₂</span>
          </div>
        ),
        step1Node: (
          <Step1Box
            base={2}
            width={BITS}
            values={entries}
            expected={targetBits}
            evaluated={evaluated}
            onChange={(idx, val) => setEntry(idx, val as 0 | 1 | null)}
            decimalValue={userDec}
            isCorrect={isDecCorrect}
          />
        ),
        canProceed: isDecCorrect,
        decimalValue: userDec,
        step2Title: 'Dezimal → Oktal',
        step2Box: (
          <Step2Box
            base={8}
            restMode="octal"
            initialDecimal={userDec}
            showContent={true}
            expectedDigits={expectedOct}
          />
        ),
      } as const;
    }
    // octhex
    return {
      step1Title: 'Oktal → Dezimal',
      headerRight: (
        <div className="uh-target">
          {octalDigitsToString(expectedOctDigits)}
          <span className="uh-base">₈</span>
        </div>
      ),
      step1Node: (
        <Step1Box
          base={8}
          width={BITS}
          values={octEntries}
          expected={expectedOctalDigitsPadded}
          evaluated={evaluated}
          onChange={(idx, val) => onChangeOct(idx, val as number | null)}
          decimalValue={userOctDec}
          isCorrect={isOctStep1Correct}
        />
      ),
      canProceed: canProceedToStep2OctHex,
      decimalValue: userOctDec,
      step2Title: 'Dezimal → Hexadezimal',
      step2Box: (
        <Step2Box
          base={16}
          restMode="hex"
          initialDecimal={userOctDec}
          showContent={true}
          expectedDigits={decimalToHex(userOctDec)}
        />
      ),
    } as const;
  }, [
    tab,
    binaryString,
    entries,
    evaluated,
    expectedOct,
    expectedOctDigits,
    expectedOctalDigitsPadded,
    isDecCorrect,
    isOctStep1Correct,
    octEntries,
    octalDigitsToString,
    targetBits,
    userDec,
    userHex,
    userOctDec,
    decimalToHex,
    canProceedToStep2OctHex,
    onChangeOct,
  ]);

  // Step 2: Decimal → Hex conversion via division by 16 steps
  // Step 2 internal state handled by Step2Box now

  return (
    <div className="umrechnungshelfer">
      <TabRow
        value={tab}
        items={[
          {value: 'binhex', label: 'Binär ⇆ Hexadezimal'},
          {value: 'binoct', label: 'Binär ⇆ Oktal'},
          {value: 'octhex', label: 'Oktal ⇆ Hexadezimal'},
        ]}
        onSelect={v => setTab(v)}
        ariaLabel="Umrechnungsmodus"
      />

      <StepPanel
        step={1}
        title={activeConfig.step1Title}
        headerRight={activeConfig.headerRight}
        expanded={!expanded[tab]}
        onToggle={() => toggleExpanded(tab)}
        ctaVisible={expanded[tab] || activeConfig.canProceed}
        ctaDirection={expanded[tab] ? 'up' : 'down'}
        ctaAriaLabel={
          expanded[tab] ? 'Zu Schritt 1 wechseln' : 'Zu Schritt 2 wechseln'
        }>
        {activeConfig.step1Node}
      </StepPanel>

      <StepPanel
        step={2}
        title={activeConfig.step2Title}
        expanded={expanded[tab]}
        onToggle={() => toggleExpanded(tab)}
        ctaVisible={activeConfig.canProceed || expanded[tab]}
        ctaDirection={expanded[tab] ? 'up' : 'down'}
        ctaAriaLabel={
          expanded[tab] ? 'Zu Schritt 1 zurück' : 'Schritt 2 öffnen'
        }>
        {!activeConfig.canProceed ? (
          <ResultLine label="Dezimal:" value={'—'} baseSuffix="₁₀" />
        ) : (
          <>
            <ResultLine
              label="Dezimal:"
              value={activeConfig.decimalValue}
              baseSuffix="₁₀"
            />
            {activeConfig.step2Box}
          </>
        )}
      </StepPanel>
    </div>
  );
};

export default Umrechnungshelfer;
