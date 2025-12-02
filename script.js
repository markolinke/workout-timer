function formatTime(sec) {
    sec = Math.ceil(sec);
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

function calculateTotalWorkoutTime(rounds, repsPerRound, workSec, restSec, roundRestSec) {
    if (rounds === 0 || repsPerRound === 0) return 0;

    const timePerFullRound = repsPerRound * workSec + (repsPerRound - 1) * restSec + roundRestSec;
    const lastRoundTime = repsPerRound * workSec + (repsPerRound - 1) * restSec;
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
        const timePerRound = repsPerRound * workSec + (repsPerRound - 1) * restSec;
        remaining += remainingRounds * timePerRound + (remainingRounds - 1) * roundRestSec;
    } else {
        // Currently in a rep (work or rest)
        const remainingRepsThisRound = repsPerRound - currentRep + (isWorking ? 1 : 0);
        const remainingRestsThisRound = repsPerRound - currentRep;

        // Add remaining time in current round (excluding current phase which is already in totalSeconds)
        if (!isWorking) {
            // Currently resting, need to add remaining reps
            remaining += remainingRepsThisRound * workSec + (remainingRestsThisRound - 1) * restSec;
        } else {
            // Currently working, need to add remaining reps and rests
            remaining += (remainingRepsThisRound - 1) * workSec + remainingRestsThisRound * restSec;
        }

        // Add round rest if not the last round
        if (currentRound < rounds) {
            remaining += roundRestSec;
        }

        // Add all remaining rounds after this one
        const remainingRounds = rounds - currentRound;
        if (remainingRounds > 0) {
            const timePerRound = repsPerRound * workSec + (repsPerRound - 1) * restSec;
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
