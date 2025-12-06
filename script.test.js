/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { formatTime, calculateTotalWorkoutTime, calculateRemainingTime } from './script.js';

describe('formatTime', () => {
    it('formats seconds into MM:SS', () => {
        expect(formatTime(0)).toBe('00:00');
        expect(formatTime(59)).toBe('00:59');
        expect(formatTime(60)).toBe('01:00');
        expect(formatTime(65)).toBe('01:05');
        expect(formatTime(3600)).toBe('60:00');
    });
});

describe('calculateTotalWorkoutTime', () => {
    it('calculates total time correctly for Alfredson protocol', () => {
        // 6 rounds, 15 reps, 5 work, 1 rest, 30 round rest
        // Time per round = 15*5 + 15*1 = 75 + 15 = 90s
        // Total = 6*90 + 5*30 = 540 + 150 = 690s
        const total = calculateTotalWorkoutTime(6, 15, 5, 1, 30);
        expect(total).toBe(690);
    });

    it('calculates total time correctly for single round', () => {
        // 1 round, 10 reps, 10 work, 5 rest, 20 round rest
        // Time = 10*10 + 10*5 = 100 + 50 = 150s (round rest ignored for single round)
        const total = calculateTotalWorkoutTime(1, 10, 10, 5, 20);
        expect(total).toBe(150);
    });

    it('returns 0 if rounds or reps are 0', () => {
        expect(calculateTotalWorkoutTime(0, 10, 10, 5, 20)).toBe(0);
        expect(calculateTotalWorkoutTime(10, 0, 10, 5, 20)).toBe(0);
    });
});

describe('calculateRemainingTime', () => {
    // Alfredson: 6 rounds, 15 reps, 5 work, 1 rest, 30 round rest
    const rounds = 6;
    const reps = 15;
    const work = 5;
    const rest = 1;
    const roundRest = 30;

    it('calculates full workout time at start', () => {
        // Round 1, Rep 1, Working, 5s left in phase
        const remaining = calculateRemainingTime(1, 1, true, false, rounds, reps, work, rest, roundRest, 5);
        expect(remaining).toBe(690);
    });

    it('calculates time correctly during round rest', () => {
        // End of Round 1 (Round Rest), 30s left
        // Remaining: 30s (current phase) + 5 full rounds
        // 5 rounds = 5 * 90 + 4 * 30 = 450 + 120 = 570s
        // Total = 30 + 570 = 600s
        const remaining = calculateRemainingTime(1, 15, false, true, rounds, reps, work, rest, roundRest, 30);
        expect(remaining).toBe(600);
    });

    it('calculates time correctly during last rep of last round', () => {
        // Round 6, Rep 15, Working, 2s left
        // Remaining: 2s (current work) + 1s (rest after last rep) = 3s
        const remaining = calculateRemainingTime(6, 15, true, false, rounds, reps, work, rest, roundRest, 2);
        expect(remaining).toBe(3);
    });

    it('calculates time correctly mid-workout', () => {
        // Start of Round 2, Rep 1, Working, 5s left
        // Remaining in Round 2: 90s (full round)
        // Remaining rounds (3,4,5,6): 4 rounds
        // Round 2 remaining: 15*5 + 15*1 = 75 + 15 = 90s
        // Round 2 total remaining: 5 (current work) + 1 (current rest) + 14*(5+1) = 6 + 84 = 90s
        // Future rounds (3,4,5,6): 4 * 90 + 3 * 30 = 360 + 90 = 450s
        // Round rest after Round 2: 30s
        // Total = 90 + 30 + 450 = 570s

        const remaining = calculateRemainingTime(2, 1, true, false, rounds, reps, work, rest, roundRest, 5);
        expect(remaining).toBe(570);
    });
});
