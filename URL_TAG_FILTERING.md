# URL-Based Tag Filtering

## Overview
The board now supports URL-based tag filtering, allowing users to share links with pre-selected tag filters. The URL automatically updates when tags are selected, and tags are automatically selected when loading a board with tag query parameters.

## Features

### 1. **Initialize Tags from URL**
When you navigate to a board with tags in the URL, those tags are automatically selected:
```
http://localhost:3000/board/2?tags=Education|Health
```

### 2. **Update URL When Tags Change**
When you select or deselect tags using the tag selector, the URL is automatically updated to reflect the current selection. This happens without reloading the page (shallow routing).

### 3. **Shareable Links**
You can copy the URL from the address bar and share it with others. When they open the link, they'll see the board with the same tag filters applied.

## URL Format

Tags are stored as a pipe-separated string in a single `tags` query parameter.

### Single Tag
```
/board/2?tags=Education
```

### Multiple Tags
```
/board/2?tags=Education|Health|Agriculture
```

### No Tags (All Nodes Visible)
```
/board/2
```

**Note**: The pipe character (`|`) is automatically URL-encoded as `%7C` in the browser address bar, so the actual URL will look like:
```
/board/2?tags=Education%7CHealth%7CAgriculture
```

## Implementation Details

### URL Initialization
- On component mount, the board checks `router.query.tags` for any pre-selected tags
- Tags are stored as a pipe-separated string: `"Education|Health|Agriculture"`
- The string is split by `|` to create an array of tags
- Tags are dispatched to Redux store via `setSelectedTags()`

### URL Updates
- When tags are changed via the tag selector, `handleTagsChange` is called
- The function updates both Redux state and the URL query parameters
- Tags array is joined with `|` separator before adding to URL
- Uses `router.push()` with `shallow: true` to avoid page reload
- If no tags are selected, the `tags` parameter is removed from the URL

### Redux Integration
- Tag selection state is managed in Redux (`selectedTags`)
- URL is treated as another source of truth for initial state
- Changes flow: User interaction → Redux → URL update

## User Experience

1. **Seamless Navigation**: URL updates don't cause page reloads
2. **Shareable State**: Anyone with the link sees the same filtered view
3. **Browser History**: Back/forward buttons work with tag selections
4. **Bookmarkable**: Users can bookmark specific filtered views

## Example Use Cases

### Research Collaboration
Share a link with colleagues to focus on specific pillars:
```
/board/2?tags=Education|Women%20Empowerment
```

### Presentations
Prepare multiple bookmarked views for different audiences:
- Education stakeholders: `/board/2?tags=Education`
- Health stakeholders: `/board/2?tags=Health`
- Combined view: `/board/2?tags=Education|Health`
- Overview (all): `/board/2`

### Documentation
Include filtered views in documentation or reports to highlight specific aspects of the Theory of Change.

## Technical Notes

- Uses Next.js `useRouter()` hook for URL manipulation
- Pipe separator (`|`) chosen for readability and URL-safety
- URL encoding is handled automatically by Next.js (pipe becomes `%7C`)
- Tag parameter is removed from URL when all tags are deselected
- `shallow: true` routing prevents unnecessary data fetching
- Compatible with both authenticated and unauthenticated access
- Empty tags (from double pipes) are filtered out automatically

