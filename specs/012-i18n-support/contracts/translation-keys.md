# Translation Keys Contract

**Feature**: 012-i18n-support  
**Date**: December 3, 2025

## Overview

This document defines the contract between components and translation files. All translation keys listed here MUST exist in both `en.ts` and `ms.ts` files.

## Key Format

Translation keys use dot notation: `namespace.section.key`

Example: `tasks.form.taskName` → Tasks namespace, form section, taskName key

## Required Translation Keys

### Common (`common.*`)

| Key | English | Malay |
|-----|---------|-------|
| `common.loading` | Loading... | Memuatkan... |
| `common.save` | Save | Simpan |
| `common.cancel` | Cancel | Batal |
| `common.delete` | Delete | Padam |
| `common.edit` | Edit | Sunting |
| `common.create` | Create | Cipta |
| `common.close` | Close | Tutup |
| `common.retry` | Retry | Cuba Semula |
| `common.search` | Search | Cari |
| `common.filter` | Filter | Tapis |
| `common.sort` | Sort | Susun |
| `common.clear` | Clear | Kosongkan |
| `common.clearAll` | Clear all | Kosongkan semua |
| `common.selected` | {count} selected | {count} dipilih |
| `common.noResults` | No results found | Tiada keputusan dijumpai |
| `common.required` | Required | Wajib |
| `common.optional` | Optional | Pilihan |
| `common.yes` | Yes | Ya |
| `common.no` | No | Tidak |
| `common.confirm` | Confirm | Sahkan |
| `common.back` | Back | Kembali |
| `common.next` | Next | Seterusnya |
| `common.previous` | Previous | Sebelumnya |
| `common.all` | All | Semua |
| `common.none` | None | Tiada |

### Authentication (`auth.*`)

| Key | English | Malay |
|-----|---------|-------|
| `auth.appName` | TaskFlow | TaskFlow |
| `auth.signInTitle` | Sign in to your account | Log masuk ke akaun anda |
| `auth.signInDescription` | Enter your email, username, or phone number to continue. | Masukkan e-mel, nama pengguna, atau nombor telefon untuk meneruskan. |
| `auth.noPasswordNeeded` | No password needed! | Tiada kata laluan diperlukan! |
| `auth.identifierLabel` | Email, username, or phone | E-mel, nama pengguna, atau telefon |
| `auth.identifierPlaceholder` | Email, username, or phone number | E-mel, nama pengguna, atau nombor telefon |
| `auth.signInButton` | Sign in | Log masuk |
| `auth.signingIn` | Signing in... | Sedang log masuk... |
| `auth.switchUser` | Switch User | Tukar Pengguna |
| `auth.signOut` | Sign Out | Log Keluar |
| `auth.welcome` | Welcome, {name} | Selamat datang, {name} |
| `auth.switchAccount` | Switch account | Tukar akaun |
| `auth.otherAccounts` | Other accounts | Akaun lain |

### Tasks (`tasks.*`)

| Key | English | Malay |
|-----|---------|-------|
| `tasks.myTasks` | My Tasks | Tugas Saya |
| `tasks.allTasks` | All Tasks | Semua Tugas |
| `tasks.createTask` | Create Task | Cipta Tugas |
| `tasks.newTask` | New Task | Tugas Baharu |
| `tasks.editTask` | Edit Task | Sunting Tugas |
| `tasks.taskDetails` | Task Details | Butiran Tugas |
| `tasks.taskName` | Task Name | Nama Tugas |
| `tasks.taskNamePlaceholder` | Enter task name | Masukkan nama tugas |
| `tasks.description` | Description | Penerangan |
| `tasks.descriptionPlaceholder` | Enter task description | Masukkan penerangan tugas |
| `tasks.priority` | Priority | Keutamaan |
| `tasks.category` | Category | Kategori |
| `tasks.status` | Status | Status |
| `tasks.complexity` | Complexity | Kerumitan |
| `tasks.complexityHint` | 1 = Simple, 10 = Complex | 1 = Mudah, 10 = Kompleks |
| `tasks.estimatedDuration` | Estimated Duration | Anggaran Tempoh |
| `tasks.estimatedMinutes` | minutes | minit |
| `tasks.deadline` | Deadline | Tarikh Akhir |
| `tasks.assignedTo` | Assigned To | Ditugaskan Kepada |
| `tasks.unassigned` | Unassigned | Tidak Ditugaskan |
| `tasks.tags` | Tags | Tag |
| `tasks.tagsPlaceholder` | Add tags... | Tambah tag... |
| `tasks.startTask` | Start Task | Mulakan Tugas |
| `tasks.completeTask` | Complete Task | Selesaikan Tugas |
| `tasks.reopenTask` | Reopen Task | Buka Semula Tugas |
| `tasks.deleteTask` | Delete Task | Padam Tugas |
| `tasks.emptyTitle` | No tasks yet | Belum ada tugas |
| `tasks.emptyDescription` | Get started by creating a new task. | Mulakan dengan mencipta tugas baharu. |
| `tasks.emptyFilterTitle` | No matching tasks | Tiada tugas sepadan |
| `tasks.emptyFilterDescription` | Try adjusting your filters. | Cuba ubah suai penapis anda. |
| `tasks.deleteConfirmTitle` | Delete Task | Padam Tugas |
| `tasks.deleteConfirmMessage` | Are you sure you want to delete "{name}"? This action cannot be undone. | Adakah anda pasti mahu memadam "{name}"? Tindakan ini tidak boleh dibatalkan. |
| `tasks.reopenConfirmTitle` | Reopen Task | Buka Semula Tugas |
| `tasks.reopenConfirmMessage` | Are you sure you want to reopen "{name}"? | Adakah anda pasti mahu membuka semula "{name}"? |
| `tasks.createdAt` | Created | Dicipta |
| `tasks.updatedAt` | Updated | Dikemas kini |
| `tasks.completedAt` | Completed | Diselesaikan |
| `tasks.timeSpent` | Time Spent | Masa Diluangkan |

### Priorities (`priorities.*`)

| Key | English | Malay |
|-----|---------|-------|
| `priorities.urgent` | Urgent | Segera |
| `priorities.high` | High | Tinggi |
| `priorities.medium` | Medium | Sederhana |
| `priorities.low` | Low | Rendah |

### Statuses (`statuses.*`)

| Key | English | Malay |
|-----|---------|-------|
| `statuses.pending` | Pending | Belum Selesai |
| `statuses.inProgress` | In Progress | Sedang Berjalan |
| `statuses.completed` | Completed | Selesai |

### Categories (`categories.*`)

| Key | English | Malay |
|-----|---------|-------|
| `categories.development` | Development | Pembangunan |
| `categories.fix` | Fix | Pembaikan |
| `categories.support` | Support | Sokongan |

### Kanban View (`kanban.*`)

| Key | English | Malay |
|-----|---------|-------|
| `kanban.title` | Kanban Board | Papan Kanban |
| `kanban.collapseColumn` | Collapse column | Kuncupkan lajur |
| `kanban.expandColumn` | Expand column | Kembangkan lajur |
| `kanban.taskCount` | {count} tasks | {count} tugas |
| `kanban.taskCountSingular` | {count} task | {count} tugas |
| `kanban.dropHere` | Drop here | Lepaskan di sini |
| `kanban.moveToColumn` | Move to {column} | Pindah ke {column} |
| `kanban.dragToMove` | Drag to move | Seret untuk pindah |

### Focus View (`focus.*`)

| Key | English | Malay |
|-----|---------|-------|
| `focus.title` | Today's Focus | Fokus Hari Ini |
| `focus.subtitle` | Your priority tasks for today | Tugas keutamaan anda untuk hari ini |
| `focus.overdue` | Overdue | Tertunggak |
| `focus.dueToday` | Due Today | Perlu Hari Ini |
| `focus.inProgress` | In Progress | Sedang Berjalan |
| `focus.highPriority` | High Priority | Keutamaan Tinggi |
| `focus.emptyTitle` | All caught up! | Semuanya selesai! |
| `focus.emptyDescription` | No urgent tasks need your attention. | Tiada tugas mendesak memerlukan perhatian anda. |
| `focus.maxTasksNote` | Showing top {count} priority tasks | Menunjukkan {count} tugas keutamaan teratas |

### Calendar View (`calendar.*`)

| Key | English | Malay |
|-----|---------|-------|
| `calendar.title` | Calendar | Kalendar |
| `calendar.today` | Today | Hari Ini |
| `calendar.month` | Month | Bulan |
| `calendar.week` | Week | Minggu |
| `calendar.noDeadline` | No deadline | Tiada tarikh akhir |
| `calendar.tasksOnDate` | {count} tasks on {date} | {count} tugas pada {date} |
| `calendar.noTasksOnDate` | No tasks on this date | Tiada tugas pada tarikh ini |

### Timer (`timer.*`)

| Key | English | Malay |
|-----|---------|-------|
| `timer.startTimer` | Start Timer | Mulakan Pemasa |
| `timer.stopTimer` | Stop Timer | Hentikan Pemasa |
| `timer.pauseTimer` | Pause Timer | Jeda Pemasa |
| `timer.resumeTimer` | Resume Timer | Sambung Pemasa |
| `timer.timeSpent` | Time Spent | Masa Diluangkan |
| `timer.addManualTime` | Add Manual Time | Tambah Masa Manual |
| `timer.hours` | Hours | Jam |
| `timer.minutes` | Minutes | Minit |
| `timer.longSessionTitle` | Long Session Detected | Sesi Panjang Dikesan |
| `timer.longSessionMessage` | You've been working for {duration}. Would you like to continue or stop? | Anda telah bekerja selama {duration}. Adakah anda mahu meneruskan atau berhenti? |
| `timer.continueSession` | Continue | Teruskan |
| `timer.stopSession` | Stop & Save | Berhenti & Simpan |
| `timer.recoveryTitle` | Timer Recovery | Pemulihan Pemasa |
| `timer.recoveryMessage` | A timer was running when the browser closed. Would you like to recover it? | Pemasa sedang berjalan ketika pelayar ditutup. Adakah anda mahu memulihkannya? |
| `timer.recoverTimer` | Recover Timer | Pulihkan Pemasa |
| `timer.discardTimer` | Discard | Buang |
| `timer.elapsed` | Elapsed | Masa Berlalu |
| `timer.running` | Running | Sedang Berjalan |
| `timer.paused` | Paused | Dijeda |

### Analytics (`analytics.*`)

| Key | English | Malay |
|-----|---------|-------|
| `analytics.personal.title` | Personal Analytics | Analitik Peribadi |
| `analytics.personal.completionRate` | Completion Rate | Kadar Penyelesaian |
| `analytics.personal.tasksCompleted` | Tasks Completed | Tugas Diselesaikan |
| `analytics.personal.averageTime` | Average Time | Purata Masa |
| `analytics.personal.productivityTrend` | Productivity Trend | Trend Produktiviti |
| `analytics.personal.byCategory` | By Category | Mengikut Kategori |
| `analytics.personal.byPriority` | By Priority | Mengikut Keutamaan |
| `analytics.personal.estimationAccuracy` | Estimation Accuracy | Ketepatan Anggaran |
| `analytics.personal.streak` | Current Streak | Siri Semasa |
| `analytics.personal.streakDays` | {count} days | {count} hari |
| `analytics.team.title` | Team Analytics | Analitik Pasukan |
| `analytics.team.leaderboard` | Leaderboard | Papan Pendahulu |
| `analytics.team.teamVelocity` | Team Velocity | Kelajuan Pasukan |
| `analytics.team.workloadDistribution` | Workload Distribution | Pengagihan Beban Kerja |
| `analytics.team.comparisons` | Comparisons | Perbandingan |
| `analytics.dateRanges.today` | Today | Hari Ini |
| `analytics.dateRanges.thisWeek` | This Week | Minggu Ini |
| `analytics.dateRanges.lastWeek` | Last Week | Minggu Lepas |
| `analytics.dateRanges.thisMonth` | This Month | Bulan Ini |
| `analytics.dateRanges.lastMonth` | Last Month | Bulan Lepas |
| `analytics.dateRanges.last30Days` | Last 30 Days | 30 Hari Lepas |

### Settings (`settings.*`)

| Key | English | Malay |
|-----|---------|-------|
| `settings.theme.title` | Theme | Tema |
| `settings.theme.light` | Light | Cerah |
| `settings.theme.dark` | Dark | Gelap |
| `settings.theme.switchToLight` | Switch to light mode | Tukar ke mod cerah |
| `settings.theme.switchToDark` | Switch to dark mode | Tukar ke mod gelap |
| `settings.language.title` | Language | Bahasa |
| `settings.language.selectLanguage` | Select Language | Pilih Bahasa |
| `settings.shortcuts.title` | Keyboard Shortcuts | Pintasan Papan Kekunci |
| `settings.shortcuts.navigation` | Navigation | Navigasi |
| `settings.shortcuts.taskActions` | Task Actions | Tindakan Tugas |
| `settings.shortcuts.views` | Views | Paparan |
| `settings.shortcuts.other` | Other | Lain-lain |
| `settings.shortcuts.showHelp` | Show shortcuts help | Tunjukkan bantuan pintasan |

### Errors (`errors.*`)

| Key | English | Malay |
|-----|---------|-------|
| `errors.unknown` | An unexpected error occurred. Please try again. | Ralat tidak dijangka berlaku. Sila cuba lagi. |
| `errors.networkError` | Network error. Please check your connection. | Ralat rangkaian. Sila semak sambungan anda. |
| `errors.storageUnavailable` | Local storage is not available. Please enable it in your browser settings. | Storan setempat tidak tersedia. Sila aktifkannya dalam tetapan pelayar anda. |
| `errors.identifierRequired` | Please enter an email, username, or phone number | Sila masukkan e-mel, nama pengguna, atau nombor telefon |
| `errors.invalidIdentifier` | Invalid identifier format | Format pengenal tidak sah |
| `errors.userNotFound` | User not found | Pengguna tidak dijumpai |
| `errors.sessionCorrupted` | Your session data is corrupted. Please log in again. | Data sesi anda rosak. Sila log masuk semula. |
| `errors.taskNameRequired` | Task name is required | Nama tugas diperlukan |
| `errors.taskNameTooLong` | Task name must be at most {max} characters | Nama tugas mestilah tidak melebihi {max} aksara |
| `errors.descriptionTooLong` | Description must be at most {max} characters | Penerangan mestilah tidak melebihi {max} aksara |
| `errors.invalidComplexity` | Complexity must be between {min} and {max} | Kerumitan mestilah antara {min} dan {max} |
| `errors.invalidDuration` | Duration must be between {min} and {max} minutes | Tempoh mestilah antara {min} dan {max} minit |
| `errors.invalidDeadline` | Invalid deadline date | Tarikh akhir tidak sah |
| `errors.timerTaskNotInProgress` | Timer can only be started on tasks that are in progress | Pemasa hanya boleh dimulakan untuk tugas yang sedang berjalan |
| `errors.timerAlreadyRunning` | Timer is already running on this task | Pemasa sudah berjalan untuk tugas ini |
| `errors.noActiveTimer` | No active timer to stop | Tiada pemasa aktif untuk dihentikan |
| `errors.invalidManualTime` | Please enter a valid time | Sila masukkan masa yang sah |

### Toast Notifications (`toast.*`)

| Key | English | Malay |
|-----|---------|-------|
| `toast.taskCreated` | Task created successfully | Tugas berjaya dicipta |
| `toast.taskUpdated` | Task updated successfully | Tugas berjaya dikemas kini |
| `toast.taskDeleted` | Task deleted successfully | Tugas berjaya dipadam |
| `toast.taskStarted` | Task "{name}" started! | Tugas "{name}" dimulakan! |
| `toast.taskCompleted` | Task "{name}" completed! | Tugas "{name}" selesai! |
| `toast.taskReopened` | Task "{name}" reopened | Tugas "{name}" dibuka semula |
| `toast.timerStopped` | Timer stopped. {duration} saved. | Pemasa dihentikan. {duration} disimpan. |
| `toast.languageChanged` | Language changed to {language} | Bahasa ditukar kepada {language} |
| `toast.themeChanged` | Theme changed to {theme} | Tema ditukar kepada {theme} |
| `toast.taskMovedToColumn` | Task moved to {column} | Tugas dipindahkan ke {column} |
| `toast.errorGeneric` | Something went wrong | Sesuatu tidak kena |

### Sort Options (`sort.*`)

| Key | English | Malay |
|-----|---------|-------|
| `sort.priority` | Priority | Keutamaan |
| `sort.complexity` | Complexity | Kerumitan |
| `sort.estimatedDuration` | Duration | Tempoh |
| `sort.createdAt` | Created | Dicipta |
| `sort.deadline` | Deadline | Tarikh Akhir |
| `sort.taskName` | Name | Nama |
| `sort.ascending` | Ascending | Menaik |
| `sort.descending` | Descending | Menurun |
| `sort.sortBy` | Sort by | Susun mengikut |

### Views (`views.*`)

| Key | English | Malay |
|-----|---------|-------|
| `views.list` | List | Senarai |
| `views.kanban` | Kanban | Kanban |
| `views.focus` | Focus | Fokus |
| `views.calendar` | Calendar | Kalendar |
| `views.statistics` | Statistics | Statistik |
| `views.teamAnalytics` | Team Analytics | Analitik Pasukan |

### AI Features (`ai.*`)

| Key | English | Malay |
|-----|---------|-------|
| `ai.analyze` | Analyze with AI | Analisis dengan AI |
| `ai.reanalyze` | Re-analyze | Analisis semula |
| `ai.suggestions` | AI Suggestions | Cadangan AI |
| `ai.applySuggestion` | Apply | Guna |
| `ai.applyAll` | Apply All | Guna Semua |
| `ai.dismiss` | Dismiss | Abaikan |
| `ai.analyzing` | Analyzing... | Menganalisis... |
| `ai.noSuggestions` | No suggestions available | Tiada cadangan tersedia |
| `ai.error` | AI analysis failed. Please try again. | Analisis AI gagal. Sila cuba lagi. |
| `ai.configureApiKey` | Configure API key in settings | Tetapkan kunci API dalam tetapan |

## Validation Rules

1. **All keys MUST exist in both language files**
2. **Interpolation placeholders MUST match** - If English has `{name}`, Malay must have `{name}`
3. **Keys MUST be unique** within their namespace
4. **Fallback chain**: Selected language → English → Return key string
5. **Empty strings are NOT allowed** - Use `" "` (space) if intentionally blank
