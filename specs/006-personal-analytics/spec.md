# Feature Specification: Personal Analytics Dashboard

**Feature Branch**: `006-personal-analytics`  
**Created**: December 2, 2025  
**Status**: Draft  
**Input**: User description: "Personal Analytics Dashboard"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Task Summary Statistics (Priority: P1)

As a user, I want to see an overview of my task counts (total, completed, in-progress, pending) at a glance so that I can quickly understand my current workload and progress.

**Why this priority**: This is the foundational metric that provides immediate value. Users need to see their current task distribution before diving into deeper analytics. It's the entry point to understanding productivity.

**Independent Test**: Can be fully tested by creating tasks in various statuses and verifying the dashboard displays accurate counts. Delivers immediate value as users see their task distribution instantly.

**Acceptance Scenarios**:

1. **Given** I have 10 tasks (5 completed, 3 in-progress, 2 pending), **When** I open the Personal Analytics dashboard, **Then** I see cards showing Total: 10, Completed: 5, In Progress: 3, Pending: 2
2. **Given** I complete a task while viewing the dashboard, **When** the task status changes, **Then** the summary statistics update in real-time without page refresh
3. **Given** I am a new user with no tasks, **When** I open the analytics dashboard, **Then** I see all statistics showing 0 with a friendly prompt to create my first task
4. **Given** I have tasks across multiple users in the system, **When** I view my personal analytics, **Then** I only see statistics for tasks assigned to me

---

### User Story 2 - Track Estimation Accuracy (Priority: P1)

As a user who estimates task durations, I want to see how accurate my time estimates are compared to actual tracked time so that I can improve my estimation skills over time.

**Why this priority**: Estimation accuracy is a core differentiator of TaskFlow. Users who track time need feedback on whether their estimates are realistic. This directly supports the product goal of "80%+ estimation accuracy over time."

**Independent Test**: Can be fully tested by completing tasks with both estimated and actual durations, then verifying the accuracy percentage calculation. Delivers value by showing users where they overestimate or underestimate.

**Acceptance Scenarios**:

1. **Given** I have completed tasks with estimated time of 300 minutes and actual tracked time of 270 minutes, **When** I view estimation accuracy, **Then** I see an accuracy score of 90% (within 10% variance)
2. **Given** I have completed 5 tasks this week with varying accuracy levels, **When** I view the accuracy trend chart, **Then** I see a visualization comparing estimated vs actual time per task
3. **Given** I have no tasks with tracked time, **When** I view estimation accuracy, **Then** I see a message indicating "Track time on completed tasks to see your estimation accuracy"
4. **Given** I have completed multiple tasks with time tracking, **When** I view estimation accuracy, **Then** I see both the overall percentage and a visual comparison of estimated vs actual time

---

### User Story 3 - View Completion Streak (Priority: P2)

As a motivated user, I want to see my current streak of consecutive days where I completed at least one task so that I stay motivated to maintain daily productivity.

**Why this priority**: Streaks are powerful motivators and drive daily engagement. While not core functionality, they add gamification that keeps users returning to the app.

**Independent Test**: Can be fully tested by completing tasks on consecutive days and verifying the streak counter increments. Delivers value through motivation and engagement.

**Acceptance Scenarios**:

1. **Given** I completed at least one task each of the last 7 days, **When** I view my analytics, **Then** I see "🔥 7 day streak!"
2. **Given** I completed tasks yesterday and today, **When** I complete another task today, **Then** my streak remains the same (not double-counted)
3. **Given** I had a 10-day streak but missed yesterday, **When** I view my analytics today, **Then** I see "Current streak: 0 days" and "Best streak: 10 days"
4. **Given** I am a new user who just completed my first task, **When** I view my analytics, **Then** I see "🔥 1 day streak!" with encouragement to continue

---

### User Story 4 - View Category Distribution (Priority: P2)

As a user working on various types of tasks, I want to see a breakdown of my tasks by category (Development, Fix, Support) so that I understand how I spend my time across different work types.

**Why this priority**: Understanding work distribution helps users balance their workload. It's valuable for self-reflection but not critical for basic productivity tracking.

**Independent Test**: Can be fully tested by creating tasks in different categories and verifying the pie chart accurately reflects the distribution. Delivers value through workload visibility.

**Acceptance Scenarios**:

1. **Given** I have 20 tasks (10 Development, 6 Fix, 4 Support), **When** I view the category distribution chart, **Then** I see a pie chart showing Development 50%, Fix 30%, Support 20%
2. **Given** all my tasks are in the same category, **When** I view the distribution, **Then** I see a single-segment chart (100% one category)
3. **Given** I filter analytics to a specific date range, **When** I view category distribution, **Then** it reflects only tasks within that period
4. **Given** I hover over a pie chart segment, **When** the tooltip appears, **Then** I see the exact task count and percentage for that category

---

### User Story 5 - View Complexity Distribution (Priority: P2)

As a user who manages tasks of varying difficulty, I want to see how my tasks are distributed across complexity levels (1-10) so that I can understand if I'm taking on appropriately challenging work.

**Why this priority**: Complexity insights help users understand their workload difficulty. It supports capacity planning but is less immediately actionable than task counts or accuracy.

**Independent Test**: Can be fully tested by creating tasks with various complexity levels and verifying the bar chart accurately reflects the distribution. Delivers value through workload insight.

**Acceptance Scenarios**:

1. **Given** I have tasks with complexities ranging from 1-10, **When** I view complexity distribution, **Then** I see a bar chart with bars for each complexity level showing task counts
2. **Given** most of my tasks are complexity 5-7, **When** I view the chart, **Then** the 5-7 bars are visually taller than others
3. **Given** I have no high-complexity tasks (8-10), **When** I view the chart, **Then** those bars show zero but the scale remains consistent
4. **Given** I view the average complexity metric, **When** I have 10 tasks with complexities [3,4,5,5,6,6,7,7,8,9], **Then** I see "Average Complexity: 6.0"

---

### User Story 6 - View Velocity Trend (Priority: P3)

As a user tracking my productivity over time, I want to see how many tasks I complete per day/week so that I can identify my productivity trends and set realistic goals.

**Why this priority**: Velocity trends provide longer-term insights. Valuable for productivity optimization but requires historical data to be meaningful.

**Independent Test**: Can be fully tested by completing tasks over multiple days and verifying the trend line accurately reflects completion patterns. Delivers value for productivity analysis.

**Acceptance Scenarios**:

1. **Given** I completed 3, 5, 2, 4, 6 tasks over the last 5 days, **When** I view velocity trend, **Then** I see a line chart plotting these completions over time
2. **Given** I switch between daily and weekly view, **When** I toggle the time period, **Then** the chart aggregates data appropriately (sum for weekly)
3. **Given** I have been using the app for 2 weeks, **When** I view velocity trend, **Then** I see a comparison to previous period with percentage change
4. **Given** today is my first day, **When** I view velocity, **Then** I see my current day's completions with a message "More data coming as you use TaskFlow"

---

### User Story 7 - View Time Tracked Summary (Priority: P3)

As a user who tracks time on tasks, I want to see my total time tracked this week/month so that I understand how much focused work time I'm investing.

**Why this priority**: Time tracking summary complements the time tracking feature. Valuable for users who track time but secondary to estimation accuracy insights.

**Independent Test**: Can be fully tested by tracking time on multiple tasks and verifying the total is correctly summed. Delivers value for time investment awareness.

**Acceptance Scenarios**:

1. **Given** I tracked 120 minutes on Task A and 90 minutes on Task B this week, **When** I view time tracked, **Then** I see "3h 30m tracked this week"
2. **Given** I toggle between weekly and monthly views, **When** I select monthly, **Then** I see the aggregated time for the current month
3. **Given** I have no tracked time this period, **When** I view time tracked, **Then** I see "0h 0m" with a prompt to start tracking time
4. **Given** I view time tracked breakdown by day, **When** I see the daily chart, **Then** each day shows total minutes tracked

---

### Edge Cases

- What happens when a user has no tasks? → Show empty state with onboarding guidance
- What happens when tasks have no tracked time? → Show estimation accuracy as unavailable with explanation
- How does system handle tasks without deadlines for completion rate? → Exclude from "on-time" calculations
- What happens when a user completes tasks at midnight? → Use the user's local timezone for streak/daily calculations
- How does system handle tasks with 0 estimated time? → Exclude from accuracy calculations to avoid division errors
- What happens when user views analytics on mobile? → Charts should be responsive and scrollable
- How does system handle historical data if user deletes tasks? → Analytics reflect current data only (no historical snapshots)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display task summary cards showing total, completed, in-progress, and pending task counts
- **FR-002**: System MUST calculate and display estimation accuracy using variance-based formula: `100 - abs((actual - estimated) / estimated) * 100`, capped at 0-100% range
- **FR-003**: System MUST track and display current completion streak (consecutive days with at least one task completed)
- **FR-004**: System MUST display longest/best completion streak for the user
- **FR-005**: System MUST display category distribution as a visual chart showing percentage of tasks per category
- **FR-006**: System MUST display complexity distribution showing task counts across complexity levels 1-10
- **FR-007**: System MUST display average complexity score for the user's tasks
- **FR-008**: System MUST display velocity trend showing tasks completed over time (daily/weekly view)
- **FR-009**: System MUST display total time tracked for configurable periods with preset options: Today, This Week (default), Last Week, This Month, Last Month, Last 30 Days
- **FR-010**: System MUST update all statistics in real-time when task data changes
- **FR-011**: System MUST only show statistics for tasks assigned to the currently logged-in user
- **FR-012**: System MUST provide meaningful empty states when insufficient data exists for a metric
- **FR-013**: System MUST display tooltips on chart elements showing exact values
- **FR-014**: System MUST be accessible from the main navigation as "My Statistics" or "Analytics"
- **FR-015**: System MUST persist the user's preferred time period filter across sessions
- **FR-016**: System MUST apply the selected time period filter globally to all applicable metrics (velocity, time tracked, category distribution)

### Key Entities *(include if feature involves data)*

- **Task Statistics**: Aggregated counts and calculations derived from user's task data (total count, status breakdown, completion dates)
- **Time Metrics**: Calculated values from estimated and actual duration fields (accuracy percentage, total tracked time)
- **Streak Data**: Derived from task completion timestamps (current streak, best streak, last completion date)
- **Distribution Data**: Aggregated task counts grouped by category and complexity level

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access and view their personal analytics dashboard within 2 seconds of navigation
- **SC-002**: All statistics accurately reflect the user's task data with 100% accuracy
- **SC-003**: 80% of users who track time view their estimation accuracy weekly
- **SC-004**: Dashboard loads and displays charts smoothly for users with up to 1,000 tasks
- **SC-005**: Users can understand their productivity status within 10 seconds of viewing the dashboard
- **SC-006**: Charts are responsive and usable on screens from 320px to 2560px width
- **SC-007**: All interactive elements (tooltips, toggles, filters) respond within 200ms
- **SC-008**: Users report the analytics help them improve estimation accuracy (measured via feedback)

## Clarifications

### Session 2025-12-02

- Q: How should "Estimation Accuracy" be calculated when actual time differs from estimated time? → A: Variance-based: `100 - abs((actual - estimated) / estimated) * 100` — shows % accuracy with symmetric error handling
- Q: What default time range should the analytics dashboard display when first opened? → A: This Week (Mon-Sun or rolling 7 days) — balanced recency and data volume
- Q: Should the dashboard include a date range filter to view historical analytics? → A: Preset periods — include "Last Week", "Last Month", "Last 30 Days" alongside current periods

## Assumptions

- Users have tasks with both estimated and actual duration to benefit from accuracy metrics
- Time tracking feature (005-time-tracking) is implemented and tasks have actualDuration data
- Charts library (Recharts) is available and configured in the project
- Streak calculations use the browser's local timezone for day boundaries
- Dashboard is read-only; no task editing capabilities from the analytics view
- Historical data is not archived; analytics always reflect current data only
- Estimation accuracy is calculated using variance-based formula: `100 - abs((actual - estimated) / estimated) * 100`, treating over/under-estimation symmetrically
