import { toFixedPointBits, bitsToString } from './src/features/tasks/practiceTaskOne/fixedFloatingPoint/fixedFloatingPoint.helper';

// Simple manual test runner since I cannot run full project tests easily in this environment without setup.

function testFixedPoint() {
    console.log('Testing Fixed Point 4.4...');

    // 2.25 -> 2 + 0.25 -> 0010.0100
    const v1 = 2.25;
    const b1 = toFixedPointBits(v1);
    const s1 = bitsToString(b1);
    console.log(`Value: ${v1}, Bits: ${s1}, Expected: 00100100`, s1 === '00100100' ? 'PASS' : 'FAIL');

    // -2.25
    // +2.25 = 0010.0100
    // Invert = 1101.1011
    // Add 1 = 1101.1100
    const v2 = -2.25;
    const b2 = toFixedPointBits(v2);
    const s2 = bitsToString(b2);
    console.log(`Value: ${v2}, Bits: ${s2}, Expected: 11011100`, s2 === '11011100' ? 'PASS' : 'FAIL');

    // Max value: 7.9375 -> 0111.1111
    const v3 = 7.9375;
    const b3 = toFixedPointBits(v3);
    const s3 = bitsToString(b3);
    console.log(`Value: ${v3}, Bits: ${s3}, Expected: 01111111`, s3 === '01111111' ? 'PASS' : 'FAIL');
}

testFixedPoint();
