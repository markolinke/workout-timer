# Task: Prepare Github Pull Request description

Create a **short and clear** description for a pull request based on `git diff origin/main`.

- Conduct review of changes, but **keep the description concise** (avoid unnecessary detail).
- Focus on the **essence of the change**, not on every line that changed.
- Pay attention to various aspects of changes and summarize them briefly:
  - Functional changes
  - Non-functional changes (e.g. performance, reliability)
  - Refactoring / code moves
- The company expects the following from each pull request:
  - Reliability - code is reliable
  - Clarity - code is clear to read. Clarity over Cleverness
  - Maintainability - code is easy to understand and follows SOLID principles
  - Simple structure - code is structured in simple way, obvious to code reviewer
  - Domain-driven - code is structured around business domains, rather than functional areas

The structure of the description should be:

**One very short sentence** (or two at most) describing the essence of the change.

- If code was only moved or reorganized with **no functional changes**, say that explicitly, e.g.:
  - `Code refactored for clarity. Code moved around with no functional changes.`

**Short bulleted list** of the most important changes, described from the **system/behavior perspective**, not the code perspective.

- **Functional changes**: describe what the system does differently, not which functions changed.
  - DON'T: `Added function xyz() that will be called during process() function`
  - DO: `Processing of background tasks will now check configuration for special cases (payment due, payment late, paid, etc.)`
- **Non-functional changes**: describe the user- or system-visible impact (performance, reliability, security, etc.).
  - Example: `Reduced load time of the workout page by caching predefined workouts in memory`
- **Refactoring / code moves**: describe moves as moves, and state clearly if behavior is unchanged.
  - Example: `Styles moved to a separate file, but not changed (assets/styles/style.css)`
  - Example: `Predefined workouts definition moved to a separate file, no changes (assets/data/workouts.js)`

**Highlighted areas to pay special attention to**, only if necessary (e.g. risky logic, complex refactor).

- If there is nothing special to watch out for, you can **omit this section**.
