# Saved Recommendations Feature Setup

## Overview
The "Saved Recommendations" page now shows only treatments that have been explicitly saved by clicking the "Save" button in the treatment results page.

## Changes Made

### 1. Results Page (`app/scan/results/page.tsx`)
- Updated `handleSave()` function to set `saved: true` in Firestore when user clicks Save button
- Auto-save and "Done" button do NOT mark treatments as saved
- Only explicit "Save" button click marks a treatment as saved

### 2. Saved Page (`app/saved/page.tsx`)
- Updated query to filter treatments where `saved === true`
- Changed "Remove" button to set `saved: false` instead of deleting the document
- Treatments remain in dashboard but are removed from saved recommendations

### 3. Firestore Index
- Created `firestore.indexes.json` with composite index for efficient querying
- Index fields: `userId` (ASC), `saved` (ASC), `date` (DESC)

## Firestore Index Setup

### Option 1: Automatic (Recommended)
When you first run a query that needs the index, Firestore will show an error with a link to create the index automatically. Click the link and the index will be created.

### Option 2: Manual via Firebase Console
1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Collection: `treatments`
4. Add fields:
   - `userId` - Ascending
   - `saved` - Ascending  
   - `date` - Descending
5. Click "Create"

### Option 3: Firebase CLI
If you have Firebase CLI installed:
```bash
firebase deploy --only firestore:indexes
```

## How It Works

### User Flow:
1. User scans furniture → Treatment plan is created (NOT saved)
2. User works on treatment → Auto-saves progress (still NOT saved)
3. User clicks "Save" button → Treatment is marked as `saved: true`
4. Treatment now appears in "Saved Recommendations" page
5. User clicks "Remove" in Saved page → Sets `saved: false`
6. Treatment disappears from Saved but remains in Dashboard

### Data Structure:
```typescript
{
  id: string;
  userId: string;
  title: string;
  saved: boolean;  // NEW FIELD - true only when explicitly saved
  // ... other fields
}
```

## Migration Notes

### Existing Treatments
Existing treatments in Firestore do NOT have the `saved` field. They will:
- Still appear in Dashboard (all treatments)
- NOT appear in Saved Recommendations (only saved: true)
- Can be saved by opening them and clicking "Save" button

### No Data Loss
- No treatments are deleted
- "Remove" from Saved only sets `saved: false`
- Treatments can be re-saved at any time

## Testing

1. **Create new treatment**: Scan furniture, generate treatment
2. **Check Dashboard**: Treatment should appear
3. **Check Saved**: Treatment should NOT appear (not saved yet)
4. **Click Save**: In results page, click Save button
5. **Check Saved**: Treatment should now appear
6. **Click Remove**: In Saved page, click Remove
7. **Check Dashboard**: Treatment still appears
8. **Check Saved**: Treatment no longer appears

## Troubleshooting

### "Missing index" error
- Click the link in the error message to create the index
- Or manually create the index in Firebase Console
- Index creation takes a few minutes

### Saved page shows nothing
- This is expected if no treatments have been explicitly saved
- Open a treatment and click the "Save" button
- It will then appear in Saved Recommendations

### Treatment disappeared from everywhere
- This shouldn't happen - Remove only sets `saved: false`
- Check Firestore console to verify document still exists
- Check that `userId` matches the logged-in user
