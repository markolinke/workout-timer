function formatTime(sec) {
    sec = Math.ceil(sec);
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

function calculateTotalWorkoutTime(rounds, repsPerRound, workSec, restSec, roundRestSec) {
    if (rounds === 0 || repsPerRound === 0) return 0;

    const timePerFullRound = repsPerRound * workSec + repsPerRound * restSec + roundRestSec;
    const lastRoundTime = repsPerRound * workSec + repsPerRound * restSec;

    return (rounds - 1) * timePerFullRound + lastRoundTime;
}

function calculateRemainingTime(
    currentRound,
    currentRep,
    isWorking,
    isRoundRest,
    rounds,
    repsPerRound,
    workSec,
    restSec,
    roundRestSec,
    currentPhaseSeconds
) {
    let remaining = currentPhaseSeconds;

    if (isRoundRest) {
        // Currently in round rest, add all remaining rounds
        const remainingRounds = rounds - currentRound;
        const timePerRound = repsPerRound * workSec + repsPerRound * restSec;
        remaining += remainingRounds * timePerRound + (remainingRounds - 1) * roundRestSec;
    } else {
        // Currently in a rep (work or rest)
        const remainingRepsThisRound = repsPerRound - currentRep + (isWorking ? 1 : 0);
        // Remaining rests: if working, we have rest after this rep + rests for remaining reps.
        // If resting, we have rests for remaining reps.
        // Actually simpler: each remaining rep has a rest.
        // If working: finish work + rest + (remainingReps-1)*(work+rest)
        // If resting: finish rest + remainingReps*(work+rest)

        if (isWorking) {
            // Finish current work (already in remaining)
            // Add current rest
            remaining += restSec;
            // Add remaining full reps (work + rest)
            remaining += (repsPerRound - currentRep) * (workSec + restSec);
        } else {
            // Finish current rest (already in remaining)
            // Add remaining full reps (work + rest)
            remaining += (repsPerRound - currentRep) * (workSec + restSec);
        }

        // Add round rest if not the last round
        if (currentRound < rounds) {
            remaining += roundRestSec;
        }

        // Add all remaining rounds after this one
        const remainingRounds = rounds - currentRound;
        if (remainingRounds > 0) {
            const timePerRound = repsPerRound * workSec + repsPerRound * restSec;
            remaining += remainingRounds * timePerRound + (remainingRounds - 1) * roundRestSec;
        }
    }

    return remaining;
}

// Universal Module Definition (UMD) to support both browser and Node.js/Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatTime, calculateTotalWorkoutTime, calculateRemainingTime };
} else {
    window.formatTime = formatTime;
    window.calculateTotalWorkoutTime = calculateTotalWorkoutTime;
    window.calculateRemainingTime = calculateRemainingTime;
}
