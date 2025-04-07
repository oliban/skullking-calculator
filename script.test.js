const { calculateSingleRoundScore } = require('./script.js');

describe('Skull King Score Calculation', () => {

  // Test cases for correct bids (non-zero)
  test('Correct bid of 3 in round 1 should score 60', () => {
    expect(calculateSingleRoundScore(3, 3, 1, false, 0)).toBe(60);
  });

  test('Correct bid of 5 in round 5 should score 100', () => {
    expect(calculateSingleRoundScore(5, 5, 5, false, 0)).toBe(100);
  });

  // Test cases for correct bids (zero)
  test('Correct bid of 0 in round 1 should score 10', () => {
    expect(calculateSingleRoundScore(0, 0, 1, false, 0)).toBe(10);
  });

  test('Correct bid of 0 in round 8 should score 80', () => {
    expect(calculateSingleRoundScore(0, 0, 8, false, 0)).toBe(80);
  });

  // Test cases for incorrect bids (bid > tricks)
  test('Bid 5, tricks 3 in round 4 should score -20', () => {
    expect(calculateSingleRoundScore(5, 3, 4, false, 0)).toBe(-20);
  });

  test('Bid 1, tricks 0 in round 1 should score -10', () => {
    expect(calculateSingleRoundScore(1, 0, 1, false, 0)).toBe(-10);
  });

  // Test cases for incorrect bids (bid < tricks)
  test('Bid 2, tricks 4 in round 6 should score -20', () => {
    expect(calculateSingleRoundScore(2, 4, 6, false, 0)).toBe(-20);
  });

  test('Bid 0, tricks 1 in round 3 should score -30', () => {
    expect(calculateSingleRoundScore(0, 1, 3, false, 0)).toBe(-30);
  });

  test('Bid 0, tricks 5 in round 7 should score -70', () => {
    expect(calculateSingleRoundScore(0, 5, 7, false, 0)).toBe(-70);
  });

  // Test cases for bonuses (Mermaid)
  test('Correct bid of 2 with Mermaid bonus should score 40 + 50 = 90', () => {
    expect(calculateSingleRoundScore(2, 2, 3, true, 0)).toBe(90);
  });

  test('Correct bid of 0 with Mermaid bonus should score 50 (round 5 * 10 + 50)', () => {
    expect(calculateSingleRoundScore(0, 0, 5, true, 0)).toBe(100);
  });

  test('Incorrect bid of 2 (got 1) with Mermaid bonus should still score -10 (no bonus)', () => {
    expect(calculateSingleRoundScore(2, 1, 4, true, 0)).toBe(-10);
  });

  // Test cases for bonuses (Pirates)
  test('Correct bid of 4 with 2 Pirates bonus should score 80 + (2*30) = 140', () => {
    expect(calculateSingleRoundScore(4, 4, 4, false, 2)).toBe(140);
  });

   test('Correct bid of 0 with 1 Pirate bonus should score 30 (round 3 * 10 + 30)', () => {
    expect(calculateSingleRoundScore(0, 0, 3, false, 1)).toBe(60);
  });

  test('Incorrect bid of 3 (got 4) with 1 Pirate bonus should still score -10 (no bonus)', () => {
    expect(calculateSingleRoundScore(3, 4, 6, false, 1)).toBe(-10);
  });

  // Test cases for bonuses (Mermaid and Pirates)
  test('Correct bid of 1 with Mermaid and 3 Pirates should score 20 + 50 + (3*30) = 160', () => {
    expect(calculateSingleRoundScore(1, 1, 2, true, 3)).toBe(160);
  });

  test('Correct bid of 0 with Mermaid and 1 Pirate should score 70 + 50 + 30 = 150 (round 7)', () => {
    expect(calculateSingleRoundScore(0, 0, 7, true, 1)).toBe(150);
  });

  test('Incorrect bid of 0 (got 1) with Mermaid and 2 Pirates should score -50 (no bonus) (round 5)', () => {
    expect(calculateSingleRoundScore(0, 1, 5, true, 2)).toBe(-50);
  });

  // Edge cases with NaN/invalid inputs
  test('NaN bid should result in 0 score', () => {
    expect(calculateSingleRoundScore(NaN, 3, 1, false, 0)).toBe(0);
  });

  test('NaN tricks should result in 0 score', () => {
    expect(calculateSingleRoundScore(2, NaN, 1, false, 0)).toBe(0);
  });

  test('NaN bid and tricks should result in 0 score', () => {
    expect(calculateSingleRoundScore(NaN, NaN, 1, false, 0)).toBe(0);
  });

}); 