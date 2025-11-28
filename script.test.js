/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatTime, updateTotalWorkoutTime } from './script.js';

describe('formatTime', () => {
    it('formats seconds into MM:SS', () => {
        expect(formatTime(0)).toBe('00:00');
        expect(formatTime(59)).toBe('00:59');
        expect(formatTime(60)).toBe('01:00');
        expect(formatTime(65)).toBe('01:05');
        expect(formatTime(3600)).toBe('60:00'); // Simple implementation might go over 60 mins
    });
});

describe('updateTotalWorkoutTime', () => {
    beforeEach(() => {
        // Set up our document body
        document.body.innerHTML = `
      <input type="number" id="rounds" value="6">
      <input type="number" id="reps" value="15">
      <input type="number" id="work" value="6">
      <input type="number" id="rest" value="2">
      <input type="number" id="roundRest" value="30">
      <strong id="totalTimeDisplay">—</strong>
    `;
    });

    it('calculates total time correctly for default values', () => {
        // Default: 6 rounds, 15 reps, 6 work, 2 rest, 30 round rest
        // Time per round (except last) = 15*6 + 14*2 + 30 = 90 + 28 + 30 = 148s
        // Last round = 15*6 + 14*2 = 90 + 28 = 118s
        // Total = 5 * 148 + 118 = 740 + 118 = 858s
        // 858 / 60 = 14.3 -> 14m 18s

        updateTotalWorkoutTime();
        const display = document.getElementById('totalTimeDisplay');
        expect(display.textContent).toBe('14m 18s');
    });

    it('updates when inputs change', () => {
        document.getElementById('rounds').value = '1';
        document.getElementById('reps').value = '1';
        document.getElementById('work').value = '10';
        document.getElementById('rest').value = '5'; // Irrelevant for 1 rep
        document.getElementById('roundRest').value = '20'; // Irrelevant for 1 round

        // 1 round, 1 rep, 10 work. Total = 10s.

        updateTotalWorkoutTime();
        const display = document.getElementById('totalTimeDisplay');
        expect(display.textContent).toBe('10s');
    });
});
