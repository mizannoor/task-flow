# Feature Specification: Time Tracking / Task Timer

**Feature Branch**: `005-time-tracking`  
**Created**: December 1, 2025  
**Status**: Draft  
**Input**: User description: "Develop Time Tracking / Task Timer feature for tracking actual time spent on tasks with start/pause/stop controls, persistent timing across page refreshes, and estimation accuracy tracking"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Start and Track Time on a Task (Priority: P1)

As a user working on a task, I want to start a timer when I begin working so that I can accurately track how much time I actually spend on each task.

**Why this priority**: This is the core functionality of time tracking. Without the ability to start and run a timer, no other time tracking features have value. This enables the fundamental use case of measuring actual work time.

**Independent Test**: Can be fully tested by starting a timer on an in-progress task and observing the elapsed time display increment in real-time. Delivers immediate value for users who want to track their work time.

**Acceptance Scenarios**:

1. **Given** I have a task in "In Progress" status, **When** I click the "Start Timer" button, **Then** the timer begins counting from 00:00:00 and displays elapsed time updating every second
2. **Given** I have started the timer on a task, **When** I navigate away from the task view and return, **Then** the timer continues to display the correct elapsed time
3. **Given** I have a task in "Pending" status, **When** I view the task, **Then** the timer controls are disabled with a tooltip explaining I must start the task first
4. **Given** I have a task in "Completed" status, **When** I view the task, **Then** the timer controls are hidden and only the total tracked time is displayed

---

### User Story 2 - Pause and Resume Timer (Priority: P1)

As a user who gets interrupted during work, I want to pause the timer and resume it later so that I only track actual work time and not breaks or interruptions.

**Why this priority**: Pausing is essential for accurate time tracking since users frequently get interrupted. Without pause functionality, tracked time would be inaccurate, defeating the purpose of the feature.

**Independent Test**: Can be fully tested by starting a timer, pausing it, waiting, then resuming and verifying the pause duration was not counted. Delivers value by ensuring accurate tracking during real work scenarios.

**Acceptance Scenarios**:

1. **Given** a timer is running on my task, **When** I click "Pause", **Then** the timer stops incrementing and displays "Paused" indicator
2. **Given** a timer is paused, **When** I click "Resume", **Then** the timer continues counting from where it was paused
3. **Given** a timer is paused, **When** I check the elapsed time after 5 minutes, **Then** the elapsed time has not increased from when I paused
4. **Given** a timer is running, **When** I pause it multiple times during a work session, **Then** only the active working periods are counted in the total elapsed time

---

### User Story 3 - Stop Timer and Save Time (Priority: P1)

As a user who has finished working on a task (or switching to another task), I want to stop the timer and have my tracked time saved so that I have an accurate record of time spent.

**Why this priority**: Saving tracked time is essential for the feature to provide value. Without persisting the time, users lose their tracking data and cannot benefit from analytics or estimation comparisons.

**Independent Test**: Can be fully tested by running a timer for a known duration, stopping it, and verifying the task's actual duration field is updated correctly. Delivers value by creating a permanent record of work time.

**Acceptance Scenarios**:

1. **Given** a timer is running on my task, **When** I click "Stop & Save", **Then** the elapsed time is added to the task's total actual duration and saved to the database
2. **Given** a timer shows 45 minutes elapsed and the task already has 30 minutes tracked, **When** I stop the timer, **Then** the task's total actual duration becomes 75 minutes
3. **Given** I stop a timer, **When** I view the task details, **Then** I see the updated total tracked time reflecting the recently saved session
4. **Given** I accidentally close the browser while timer is running, **When** I reopen the application, **Then** the elapsed time since last save is preserved and the timer can be resumed or stopped

---

### User Story 4 - Single Active Timer Enforcement (Priority: P2)

As a user, I want the system to ensure only one timer runs at a time so that I don't accidentally track time on multiple tasks simultaneously and get inaccurate data.

**Why this priority**: While important for data accuracy, the basic timer functionality works without this. This is an enhancement that prevents user error and ensures cleaner data.

**Independent Test**: Can be fully tested by starting a timer on Task A, then starting a timer on Task B, and verifying Task A's timer automatically stopped and saved. Delivers value by preventing tracking mistakes.

**Acceptance Scenarios**:

1. **Given** I have a timer running on Task A, **When** I start the timer on Task B, **Then** Task A's timer automatically stops and saves, and Task B's timer starts
2. **Given** I have a timer running on Task A, **When** I attempt to start Task B's timer, **Then** I see a brief notification that Task A's timer was stopped and saved
3. **Given** I have no timers running, **When** I start a timer on any task, **Then** it starts immediately without any auto-stop behavior

---

### User Story 5 - View Time Tracking Progress (Priority: P2)

As a user, I want to see how my actual time compares to my estimated time so that I can improve my estimation skills and know if I'm on track.

**Why this priority**: Comparison with estimates provides feedback for improving estimation accuracy, which is a key goal of the application. However, basic timing works without this comparison display.

**Independent Test**: Can be fully tested by tracking time on a task with an estimate and observing the comparison display showing percentage of estimate used. Delivers value by providing actionable feedback on estimation accuracy.

**Acceptance Scenarios**:

1. **Given** a task has an estimated duration of 2 hours and I've tracked 1.5 hours, **When** I view the timer display, **Then** I see "Tracked: 1h 30m / Estimated: 2h 00m (75%)"
2. **Given** a task has tracked time exceeding the estimate, **When** I view the timer display, **Then** I see a visual indicator (color change) showing I've exceeded the estimate
3. **Given** a task has no estimated duration, **When** I view the timer display, **Then** I see only the tracked time without comparison
4. **Given** I'm viewing the task list or card, **When** I look at a task with time tracking data, **Then** I see a compact time indicator showing tracked vs estimated

---

### User Story 6 - Manual Time Entry (Priority: P3)

As a user who forgot to start the timer or worked offline, I want to manually enter time I spent on a task so that my time records are complete and accurate.

**Why this priority**: While useful for data completeness, manual entry is a fallback mechanism. The primary value comes from automatic timer tracking. This ensures no time is lost but is less critical than core timer functions.

**Independent Test**: Can be fully tested by manually adding 30 minutes to a task and verifying the actual duration is updated correctly. Delivers value by allowing users to correct or supplement automated tracking.

**Acceptance Scenarios**:

1. **Given** I'm viewing a task, **When** I click "Add Time Manually", **Then** I see an input to enter hours and minutes
2. **Given** I enter "1 hour 30 minutes" in the manual entry form, **When** I submit, **Then** 90 minutes is added to the task's actual duration
3. **Given** a task has 2 hours already tracked, **When** I manually add 30 minutes, **Then** the total tracked time becomes 2.5 hours
4. **Given** I enter invalid time (negative or non-numeric), **When** I try to submit, **Then** I see a validation error and the entry is not saved

---

### Edge Cases

- What happens when the browser/tab is closed with a timer running? → Timer state (start time) persists in IndexedDB; on reopening, the app calculates elapsed time since last recorded start time and allows user to save or discard
- What happens when the user completes a task while timer is running? → Timer automatically stops and saves before status changes to completed
- What happens when a task is deleted while timer is running? → Timer stops and tracked time is discarded with the task
- What happens during poor device performance (timer display freezes)? → Timer logic based on timestamps, not intervals; display may lag but saved time remains accurate
- What happens when user switches between different user accounts? → Each user's timer state is independent; switching accounts pauses/saves current timer and restores target user's timer state

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide Start, Pause/Resume, and Stop timer controls for tasks in "in-progress" status
- **FR-002**: System MUST display elapsed time in HH:MM:SS format, updating every second when timer is running
- **FR-003**: System MUST persist timer state (running/paused, elapsed time) in IndexedDB to survive page refreshes and browser restarts
- **FR-004**: System MUST accumulate tracked time in the task's `actualDuration` field when timer is stopped
- **FR-005**: System MUST enforce single active timer per user, automatically stopping and saving any running timer when a new one is started
- **FR-006**: System MUST display comparison between tracked time and estimated duration when estimate exists
- **FR-007**: System MUST allow manual time entry in addition to timer-based tracking
- **FR-008**: System MUST automatically stop and save running timer when task status changes to "completed"
- **FR-009**: System MUST disable timer controls for tasks not in "in-progress" status with appropriate user feedback
- **FR-010**: System MUST calculate elapsed time based on timestamps (not intervals) to ensure accuracy regardless of display performance
- **FR-011**: System MUST validate manual time entries to reject negative or invalid values
- **FR-012**: System MUST notify user when auto-stopping a timer due to starting another task's timer
- **FR-013**: System MUST prompt user to review and optionally adjust elapsed time before saving when a session exceeds 4 hours, to prevent accidental time inflation from forgotten timers

### Key Entities _(include if feature involves data)_

- **Task Timer State**: Per-task tracking data stored directly on the task entity, including cumulative `actualDuration` (total minutes tracked), `timerStartedAt` (timestamp if timer active), and `timerPausedAt` (timestamp if paused). No separate session history is maintained; only the running total is persisted.
- **Active Timer Reference**: Transient application state tracking which task (if any) has the currently running timer for the logged-in user, enabling single-active-timer enforcement.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can start, pause, resume, and stop a timer within 1 second of clicking the control
- **SC-002**: Timer display accuracy is within 1 second of actual elapsed time after any duration of tracking
- **SC-003**: Tracked time persists correctly through page refreshes, browser restarts, and offline periods
- **SC-004**: 95% of users can successfully track time on their first attempt without documentation
- **SC-005**: Time tracking data enables users to achieve 80%+ estimation accuracy improvement over time (visible in analytics)
- **SC-006**: Single active timer enforcement prevents 100% of accidental simultaneous tracking scenarios
- **SC-007**: Manual time entry allows corrections within 30 seconds for users who forgot to start timer
- **SC-008**: Timer state restoration after browser restart completes within 2 seconds of page load

## Clarifications

### Session 2025-12-01

- Q: How should the system handle extended timer sessions (e.g., user left browser open overnight)? → A: Prompt user to review and adjust time before saving if session exceeds a threshold (e.g., 4 hours)
- Q: Should the system maintain a history of individual time tracking sessions per task, or only store the cumulative total? → A: Store only cumulative total in `actualDuration` (simpler, matches current PRD data model)

## Assumptions

- Users understand the concept of time tracking and expect standard timer behavior (start/pause/stop)
- IndexedDB is available and functioning in the user's browser (part of core app requirements)
- Users primarily track time in real-time; manual entry is a fallback mechanism
- Timer accuracy to the second is sufficient (sub-second precision not required)
- Users accept that only one timer can run at a time across all their tasks
- Time tracking is optional per task; users are not forced to track time
- The existing task data model already includes `actualDuration` and `timerStartedAt` fields as defined in PRD
