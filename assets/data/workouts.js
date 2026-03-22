const PREDEFINED_WORKOUTS = [
    {
      id: 'alfredson',
      name: 'Alfredson',
      config: {
        rounds: 6,
        reps: 15,
        work: 5,
        rest: 1,
        roundRest: 15
      }
    },
    {
      id: 'calf-2x15',
      name: 'Calf Raise',
      config: {
        rounds: 2,
        reps: 12,
        work: 3,
        rest: 3,
        roundRest: 15
      }
    },
    {
      id: 'mc-gill-big-3',
      name: 'McGill Big 3 (3-2-1, 10sec each)',
      config: {
        rounds: 6,
        reps: 3,
        work: 10,
        rest: 5,
        roundRest: 15
      }
    },
    {
      id: 'calf-3x8',
      name: 'Calf Raise 3x8',
      config: {
        rounds: 3,
        reps: 8,
        work: 3,
        rest: 3,
        roundRest: 15
      }
    },
    {
      id: 'calf-3x8',
      name: 'Calf Raise 4x8',
      config: {
        rounds: 4,
        reps: 8,
        work: 3,
        rest: 3,
        roundRest: 15
      }
    },
    {
      id: 'test-2r-1rep',
      name: 'Test: 2R x 1Rep',
      config: {
        rounds: 2,
        reps: 1,
        work: 1,
        rest: 1,
        roundRest: 2
      }
    },
    {
      id: 'test-1r-2reps',
      name: 'Test: 1R x 2Reps',
      config: {
        rounds: 1,
        reps: 2,
        work: 1,
        rest: 1,
        roundRest: 1
      }
    },
    {
      id: 'test-2r-2reps',
      name: 'Test: 2R x 2Reps',
      config: {
        rounds: 2,
        reps: 2,
        work: 1,
        rest: 1,
        roundRest: 2
      }
    }
  ];

  const DEFAULT_CONFIG = PREDEFINED_WORKOUTS[0].config;