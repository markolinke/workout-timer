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
    // Note: The last round technically ends with a rest period now before the workout finishes?
    // The user said: "After EVERY rep, do a rest after rep."
    // "WORK-REST-WORK-REST-REST BETWEEN ROUNDS-WORK-REST-WORK-REST."
    // This implies the last rep of the last round also has a rest.
    // However, usually the last thing is "DONE".
    // Let's look at the example: "WORK-REST-WORK-REST-REST BETWEEN ROUNDS-WORK-REST-WORK-REST."
    // It ends with REST. So yes, the last round also has the full set of rests.
    // But wait, usually you don't rest after the very last rep of the workout, you just finish.
    // The user example: "WORK-REST-WORK-REST-REST BETWEEN ROUNDS-WORK-REST-WORK-REST."
    // It ends with REST.
    // So I will include it.

    // Actually, let's stick to the formula:
    // timePerFullRound = reps * (work + rest) + roundRest
    // lastRoundTime = reps * (work + rest)
    // But wait, if there is a round rest, it's usually between rounds.
    // The user example shows: WORK-REST-WORK-REST - REST BETWEEN ROUNDS - ...
    // So the sequence for a round is: (WORK, REST) * reps + ROUND_REST
    // For the last round: (WORK, REST) * reps.

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
