# Maintenance Schedule System Documentation

## Overview
The maintenance schedule system provides a comprehensive calendar view of all treatment and maintenance tasks for scanned furniture. OpenAI generates specific dates and times for each task, ensuring proper wood care timing.

## Key Features

### 1. AI-Generated Scheduling
When furniture is scanned, OpenAI generates:
- **Treatment Steps with Dates**: Specific dates/times for each treatment phase
- **Maintenance Schedule**: Long-term care reminders with appropriate intervals
- **Duration Estimates**: Time required for each task
- **Priority Levels**: High, medium, or low priority for maintenance tasks

### 2. Furniture Management
- **My Furniture Section**: Lists all scanned furniture items
- **Visual Icons**: Automatic icon assignment based on furniture type
- **Status Display**: Shows current defect type for each item
- **Selection Filter**: Click furniture to filter calendar events

### 3. Interactive Calendar
- **Monthly View**: Navigate between months
- **Event Display**: Shows all scheduled treatments and maintenance
- **Color Coding**:
  - Treatment events: Blue background (🧴)
  - Maintenance events: Orange background (🔧)
  - Today: Green highlight
- **Event Details**: Hover to see full description

## How It Works

### Step 1: Furniture Scanning
When you scan furniture and generate a treatment plan:

1. User uploads furniture image
2. AI analyzes defects
3. OpenAI generates treatment plan WITH schedules:

```json
{
  "treatmentSteps": [
    {
      "title": "Clean and Prepare Surface",
      "description": "Remove dirt and debris",
      "steps": ["Step 1", "Step 2"],
      "scheduledDate": "2026-04-11T09:00:00.000Z",
      "duration": "2"
    }
  ],
  "maintenanceSchedule": [
    {
      "title": "First Inspection",
      "description": "Check for recurring damage",
      "scheduledDate": "2026-04-18T10:00:00.000Z",
      "frequency": "once",
      "priority": "high"
    }
  ]
}
```

### Step 2: Data Storage
Treatment data with schedules is saved to Firestore:

```typescript
{
  id: "treatment_123",
  userId: "user_456",
  title: "Mahogany Table Treatment",
  treatmentData: {
    treatmentSteps: [...],
    maintenanceSchedule: [...]
  }
}
```

### Step 3: Calendar Display
The maintenance page:
1. Loads all user's treatments from Firestore
2. Extracts scheduled dates from treatment steps and maintenance schedule
3. Displays events on calendar by date
4. Allows filtering by furniture item

## OpenAI Prompt Structure

The generate-treatment API includes specific scheduling instructions:

```typescript
IMPORTANT: Generate a comprehensive treatment plan with SPECIFIC DATES AND TIMES for each maintenance task.
Current date and time: ${new Date().toISOString()}

SCHEDULING GUIDELINES:
- Treatment steps should be scheduled starting from today, with appropriate intervals (e.g., drying time 24-48 hours)
- Include immediate tasks (today), short-term tasks (1-7 days), and follow-up tasks (1-2 weeks)
- Maintenance schedule should include:
  * First inspection (1 week after treatment completion)
  * Monthly check (30 days)
  * Quarterly maintenance (90 days)
  * Semi-annual deep inspection (180 days)
  * Annual refinishing (365 days)
- Use realistic time estimates based on the defect severity
- All dates must be in ISO 8601 format with timezone
- Schedule times during typical working hours (9 AM - 5 PM)
```

## Data Structures

### TreatmentStep Interface
```typescript
interface TreatmentStep {
  title: string;
  description: string;
  steps: string[];
  scheduledDate?: string;  // ISO 8601 format
  duration?: string;        // Hours
  checked: boolean;
}
```

### MaintenanceSchedule Interface
```typescript
interface MaintenanceSchedule {
  title: string;
  description: string;
  scheduledDate: string;    // ISO 8601 format
  frequency: string;        // once, weekly, monthly, quarterly, semi-annually, annually
  priority: string;         // low, medium, high
}
```

### CalendarEvent Interface
```typescript
interface CalendarEvent {
  date: string;
  title: string;
  description: string;
  furnitureName: string;
  type: 'treatment' | 'maintenance';
  priority?: string;
}
```

## User Interface

### My Furniture Section
- Lists all scanned furniture with icons
- Shows furniture name and defect status
- Click to filter calendar events for that furniture
- Selected furniture highlighted with brown border

### Calendar Section
- Month navigation (previous/next buttons)
- Week day headers (SUN-SAT)
- Day cells with:
  - Day number
  - Event indicators (colored boxes)
  - Event titles with icons
- Today highlighted in green
- Event days have colored backgrounds

### Event Display
- **Treatment Events** (🧴):
  - Blue background (#E3F2FD)
  - Blue left border (#2196F3)
  - Shows treatment step title
  
- **Maintenance Events** (🔧):
  - Orange background (#FFF3E0)
  - Orange left border (#FF9800)
  - Shows maintenance task title

## Example Scheduling Timeline

### For Water Damage (Mold):
```
Day 1 (Today, 9 AM): Clean and Remove Mold
Day 2 (10 AM): Check Drying Progress
Day 3 (9 AM): Apply Anti-Mold Treatment
Day 5 (10 AM): Apply Protective Sealant
Week 2 (10 AM): First Inspection
Month 1 (10 AM): Monthly Check
Month 3 (10 AM): Reapply Protective Coating
Month 6 (10 AM): Deep Inspection
Year 1 (10 AM): Annual Refinishing
```

### For Scratches/Dents:
```
Day 1 (Today, 9 AM): Sand Damaged Area
Day 2 (10 AM): Apply Wood Filler
Day 3 (9 AM): Sand Smooth
Day 4 (10 AM): Apply Stain
Day 5 (9 AM): Apply Varnish
Week 2 (10 AM): First Inspection
Month 1 (10 AM): Monthly Check
Month 3 (10 AM): Touch-up Finish
Month 6 (10 AM): Deep Inspection
```

## Technical Implementation

### Files Modified
1. `app/api/generate-treatment/route.ts`: Updated OpenAI prompt with scheduling requirements
2. `app/maintenance/page.tsx`: Complete rewrite with Firestore integration and calendar logic
3. `app/scan/results/page.tsx`: Updated to handle scheduled dates from OpenAI
4. `styles/maintenance/maintenance.module.css`: Enhanced styling for events and selection

### Key Functions

#### `loadFurnitureAndSchedules(userId)`
Loads all treatments for user and extracts calendar events:
- Fetches treatments from Firestore
- Processes treatment steps with scheduled dates
- Processes maintenance schedule
- Organizes events by date key (YYYY-MM-DD)

#### `formatDateKey(date)`
Converts Date object to calendar key format:
```typescript
"2026-04-15" // YYYY-MM-DD
```

#### `getFurnitureIcon(type)`
Maps furniture types to emoji icons:
- table/chair/desk/bench → 🪑
- cabinet → 🗄️
- shelf → 📚
- door → 🚪
- bed → 🛏️
- default → 🪵

#### `handleFurnitureClick(furnitureId)`
Toggles furniture selection for calendar filtering

#### `renderCalendar()`
Generates calendar grid with:
- Empty cells for days before month start
- Day cells with numbers and events
- Today highlighting
- Event filtering based on selected furniture

## Integration with Notification System

The maintenance schedule works alongside the notification system:

1. **Maintenance Page**: Visual calendar view of all scheduled tasks
2. **Notification Page**: Alert-style list of due/upcoming tasks
3. **Both use same data**: Treatment schedules from OpenAI

### Data Flow
```
OpenAI → Treatment Data with Schedules → Firestore
                                            ↓
                        ┌───────────────────┴───────────────────┐
                        ↓                                       ↓
              Maintenance Page                        Notification Page
              (Calendar View)                         (Alert List)
```

## Best Practices

### For Users
1. Check maintenance calendar regularly
2. Click furniture items to focus on specific schedules
3. Navigate months to see long-term maintenance
4. Complete tasks on scheduled dates
5. Update progress in treatment plan

### For Developers
1. Always include current date in OpenAI prompt
2. Validate ISO 8601 date format from OpenAI
3. Handle missing scheduledDate gracefully
4. Test with various furniture types and defects
5. Ensure timezone consistency

## Troubleshooting

### No Furniture Showing
- Ensure user has scanned at least one furniture item
- Check Firestore for treatments collection
- Verify user is logged in
- Check browser console for errors

### No Events on Calendar
- Verify OpenAI is generating scheduledDate fields
- Check treatment data structure in Firestore
- Ensure dates are in ISO 8601 format
- Verify date parsing logic

### Events on Wrong Dates
- Check timezone handling
- Verify OpenAI is using correct current date
- Ensure formatDateKey function is working correctly
- Check for date parsing errors

### Calendar Not Updating
- Verify Firestore connection
- Check authentication state
- Ensure useEffect dependencies are correct
- Try refreshing the page

## Future Enhancements

### Potential Features
1. **Drag-and-Drop Rescheduling**: Move events to different dates
2. **Event Completion Tracking**: Mark tasks as done on calendar
3. **Recurring Events**: Automatic scheduling of recurring maintenance
4. **Calendar Export**: Export to Google Calendar, iCal, etc.
5. **Reminder Settings**: Customize notification timing
6. **Multi-View**: Week view, day view, agenda view
7. **Event Notes**: Add custom notes to scheduled tasks
8. **Weather Integration**: Adjust outdoor furniture schedules based on weather
9. **Photo Tracking**: Before/after photos for each maintenance task
10. **Sharing**: Share calendar with family members or professionals

## API Reference

### OpenAI Response Format
```json
{
  "furnitureType": "Table",
  "placement": "Outdoor",
  "defectType": "Water Damage",
  "defectDescription": "Mold growth on surface",
  "severity": "Moderate",
  "materialsNeeded": [...],
  "diyRecipes": [...],
  "treatmentSteps": [
    {
      "title": "Clean Surface",
      "description": "Remove mold and debris",
      "steps": ["Mix cleaning solution", "Scrub surface", "Rinse thoroughly"],
      "scheduledDate": "2026-04-11T09:00:00.000Z",
      "duration": "2"
    }
  ],
  "maintenanceSchedule": [
    {
      "title": "First Inspection",
      "description": "Check for recurring mold",
      "scheduledDate": "2026-04-18T10:00:00.000Z",
      "frequency": "once",
      "priority": "high"
    }
  ]
}
```

### Firestore Document Structure
```typescript
{
  id: string;
  userId: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  furnitureType: string;
  placement: string;
  defectType: string;
  date: string;
  treatmentData: {
    treatmentSteps: TreatmentStep[];
    maintenanceSchedule: MaintenanceSchedule[];
    // ... other fields
  };
  checkedSteps: { [key: number]: boolean };
  checkedMaterials: { [key: number]: boolean };
  notificationSchedules: NotificationSchedule[];
}
```
