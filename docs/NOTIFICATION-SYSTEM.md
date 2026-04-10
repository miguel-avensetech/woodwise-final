# Notification System Documentation

## Overview
The notification system provides time-based reminders for treatment applications and maintenance schedules for mahogany wood furniture. Notifications are automatically generated when a treatment plan is created and are displayed based on scheduled times.

## Features

### 1. Automatic Notification Generation
When a treatment plan is saved, the system automatically generates:
- **Treatment Notifications**: Immediate action reminders for cleaning, sanding, drying, and applying treatments
- **Maintenance Notifications**: Long-term care reminders for inspections and reapplications

### 2. Notification Types

#### Treatment Notifications 🧴
- Cleaning and preparation steps
- Drying time checks (12-48 hours)
- Treatment application reminders
- Step-by-step progress tracking

#### Maintenance Notifications 🔧
- **First Inspection** (1 week): Initial check for recurring damage
- **Monthly Check** (30 days): Condition monitoring for moisture, cracks, or finish deterioration
- **Protective Finish Reapplication** (3 months): Reapply protective coating
- **Semi-Annual Deep Inspection** (6 months): Thorough structural integrity check

### 3. Smart Scheduling
Notifications are scheduled based on:
- Treatment step requirements (drying times, application intervals)
- Furniture type and defect severity
- Industry best practices for wood maintenance

### 4. Notification Display
- **Active Notifications**: Shows notifications that are due (past scheduled time)
- **Upcoming Notifications**: Shows notifications within 24 hours
- **Filter Options**: All, Maintenance, or Treatment
- **Time Display**: Shows relative time (e.g., "2 h ago", "In 3 h", "Just now")

## How It Works

### Step 1: Treatment Plan Creation
When you complete a furniture scan and save the treatment plan:
```typescript
// Notification schedules are automatically generated
const notificationSchedules = generateNotificationSchedules(treatmentData);
```

### Step 2: Schedule Storage
Notification schedules are stored in Firestore with each treatment:
```typescript
{
  id: "treatment_123",
  userId: "user_456",
  title: "Mahogany Table Treatment Plan",
  notificationSchedules: [
    {
      type: "treatment",
      title: "Apply Anti-Mold Treatment",
      message: "Time to apply the anti-mold solution...",
      scheduledTime: "2026-04-11T10:00:00.000Z",
      icon: "🧴",
      read: false
    },
    // ... more schedules
  ]
}
```

### Step 3: Notification Display
The notification page loads all treatments and displays notifications that are:
- Past their scheduled time (active)
- Within 24 hours of scheduled time (upcoming)

### Step 4: Real-Time Updates
Notifications are loaded from Firestore when:
- User navigates to the notification page
- User authentication state changes
- Treatment plans are updated

## Notification Schedule Examples

### For Water Damage Treatment:
1. **Day 1**: Clean and remove mold (immediate)
2. **Day 2**: Check drying progress (24 hours)
3. **Day 3**: Apply anti-mold treatment (48 hours)
4. **Week 1**: First inspection
5. **Month 1**: Monthly maintenance check
6. **Month 3**: Reapply protective finish
7. **Month 6**: Deep inspection

### For Scratch/Dent Repair:
1. **Day 1**: Sand damaged area (immediate)
2. **Day 2**: Apply wood filler (24 hours)
3. **Day 3**: Sand smooth and apply stain (48 hours)
4. **Day 4**: Apply protective finish (72 hours)
5. **Week 1**: First inspection
6. **Month 1**: Monthly check
7. **Month 3**: Reapply finish
8. **Month 6**: Deep inspection

## User Interface

### Filter Tabs
- **All**: Shows all notifications (treatment + maintenance)
- **Maintenance**: Shows only long-term care reminders
- **Treatment**: Shows only immediate treatment actions

### Notification Card Components
- **Icon**: Visual indicator (🧴, 🔧, ⏰, 🖌️, 🔍, etc.)
- **Title**: Notification action title
- **Treatment Subtitle**: Associated treatment plan name
- **Message**: Detailed instructions
- **Time**: Relative time display
- **Badges**: Type indicator (Treatment/Maintenance) and status (Upcoming)

### Visual Indicators
- **Standard Notifications**: White background, gray border
- **Upcoming Notifications**: Gradient background, orange border, "⏰ Upcoming" badge
- **Time Colors**: 
  - Past notifications: Gray text
  - Upcoming notifications: Orange text

## Technical Implementation

### Files Modified
1. `app/scan/results/page.tsx`: Added `generateNotificationSchedules()` function
2. `app/notification/page.tsx`: Complete rewrite with Firestore integration
3. `styles/notification/notification.module.css`: Enhanced styling for notification types

### Key Functions

#### `generateNotificationSchedules(treatmentData)`
Analyzes treatment steps and generates appropriate notification schedules based on:
- Step titles (clean, dry, apply, sand, etc.)
- Drying times (12h, 24h, 48h)
- Furniture type and defect type

#### `loadNotifications(userId)`
Fetches all treatments for the user and extracts notifications that are:
- Due (past scheduled time)
- Upcoming (within 24 hours)

#### `getTimeAgo(date)` & `getTimeUntil(date)`
Converts timestamps to human-readable relative time:
- "Just now", "5 min ago", "2 h ago", "3 d ago"
- "In 30 min", "In 5 h", "On Apr 15"

## Data Structure

### NotificationSchedule Interface
```typescript
interface NotificationSchedule {
  type: "treatment" | "maintenance";
  stepIndex?: number;
  title: string;
  message: string;
  scheduledTime: string; // ISO 8601 format
  icon: string;
  read: boolean;
}
```

### Notification Interface (Display)
```typescript
interface Notification extends NotificationSchedule {
  id: string;
  treatmentTitle: string;
  timeAgo: string;
  isPast: boolean;
}
```

## Future Enhancements

### Potential Features
1. **Push Notifications**: Browser/mobile push notifications
2. **Email Reminders**: Send email notifications for important maintenance
3. **Snooze Function**: Delay notifications by custom time
4. **Mark as Complete**: Track completed notifications
5. **Custom Schedules**: Allow users to modify notification timing
6. **Notification History**: Archive of past notifications
7. **Notification Settings**: Enable/disable specific notification types
8. **Recurring Reminders**: Automatic recurring maintenance schedules

## Best Practices

### For Users
1. Check notifications regularly to stay on schedule
2. Complete treatment steps in order
3. Don't skip maintenance notifications
4. Update treatment progress in the scan results page

### For Developers
1. Always generate notification schedules when saving treatments
2. Use ISO 8601 format for all timestamps
3. Test notification timing with various treatment types
4. Ensure notifications are user-specific (filter by userId)
5. Handle edge cases (no treatments, no notifications, etc.)

## Troubleshooting

### No Notifications Showing
- Ensure you have saved at least one treatment plan
- Check that notifications are scheduled (not all in the future)
- Verify user is logged in
- Check browser console for errors

### Incorrect Timing
- Verify system time is correct
- Check notification scheduledTime in Firestore
- Ensure timezone handling is correct

### Missing Notifications
- Verify treatment has notificationSchedules array
- Check filter settings (All/Maintenance/Treatment)
- Ensure notifications are within display window (past or <24h future)
