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
        // Time per round = 15*5 + 14*1 = 75 + 14 = 89s
        // Total = 6*89 + 5*30 = 534 + 150 = 684s
        const total = calculateTotalWorkoutTime(6, 15, 5, 1, 30);
        expect(total).toBe(684);
    });

    it('calculates total time correctly for single round', () => {
        // 1 round, 10 reps, 10 work, 5 rest, 20 round rest
        // Time = 10*10 + 9*5 = 100 + 45 = 145s (round rest ignored for single round)
        const total = calculateTotalWorkoutTime(1, 10, 10, 5, 20);
        expect(total).toBe(145);
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
        expect(remaining).toBe(684);
    });

    it('calculates time correctly during round rest', () => {
        // End of Round 1 (Round Rest), 30s left
        // Remaining: 30s (current phase) + 5 full rounds
        // 5 rounds = 5 * 89 + 4 * 30 = 445 + 120 = 565s
        // Total = 30 + 565 = 595s
        const remaining = calculateRemainingTime(1, 15, false, true, rounds, reps, work, rest, roundRest, 30);
        expect(remaining).toBe(595);
    });

    it('calculates time correctly during last rep of last round', () => {
        // Round 6, Rep 15, Working, 2s left
        const remaining = calculateRemainingTime(6, 15, true, false, rounds, reps, work, rest, roundRest, 2);
        expect(remaining).toBe(2);
    });

    it('calculates time correctly mid-workout', () => {
        // Start of Round 2, Rep 1, Working, 5s left
        // Remaining: 5s (current) + (14 reps + 14 rests) + 4 full rounds + 4 round rests
        // Round 2 remaining: 14*5 + 14*1 = 70 + 14 = 84s
        // Round 2 total remaining: 5 + 84 = 89s
        // Future rounds (3,4,5,6): 4 * 89 + 3 * 30 = 356 + 90 = 446s
        // Round rest after Round 2: 30s
        // Total = 89 + 30 + 446 = 565s

        // Wait, let's re-calculate manually:
        // We are at Round 2, Rep 1.
        // Remaining in Round 2: 89s (full round)
        // Remaining rounds (3,4,5,6): 4 rounds
        // Round rests remaining: After R2, R3, R4, R5 = 4 round rests?
        // No, round rests are between rounds.
        // R1 (done) -> Rest (done) -> R2 (current) -> Rest -> R3 -> Rest -> R4 -> Rest -> R5 -> Rest -> R6
        // So we have Round 2 (89s) + Rest (30s) + R3 (89s) + Rest (30s) + R4 (89s) + Rest (30s) + R5 (89s) + Rest (30s) + R6 (89s)
        // Total = 5 * 89 + 4 * 30 = 445 + 120 = 565s

        const remaining = calculateRemainingTime(2, 1, true, false, rounds, reps, work, rest, roundRest, 5);
        expect(remaining).toBe(565);
    });
});
