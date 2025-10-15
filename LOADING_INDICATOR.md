# Loading Indicator Implementation

## Overview
Added a global horizontal progress bar that appears at the top of the screen during API calls to provide visual feedback to users.

## Components Created

### 1. LoadingBar Component (`web/src/components/LoadingBar.js`)
- A fixed position bar at the top of the screen
- Displays an indeterminate animated progress bar
- Only visible when API calls are in progress
- Uses Tailwind CSS for styling

### 2. LoadingContext (`web/src/context/LoadingContext.js`)
- Provides global loading state management
- Uses a counter to track multiple concurrent API calls
- Exposes `startLoading()` and `stopLoading()` functions
- Shows the loading bar when `loadingCount > 0`

### 3. Custom Hook (`web/src/hooks/useApiCall.js`)
- Optional wrapper for API calls
- Automatically manages loading state
- Can be used like: `const { callApi } = useApiCall(); await callApi(apiFunction, ...args);`

## Integration

### Provider Setup
Updated `web/src/providers.js` to wrap the app with `LoadingProvider` and include the `LoadingBar` component:
```javascript
<Provider store={store}>
  <LoadingProvider>
    <AuthProvider>
      <LoadingBar />
      {children}
    </AuthProvider>
  </LoadingProvider>
</Provider>
```

### CSS Animation
Added to `web/src/styles/globals.css`:
```css
@keyframes loading-bar {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}

.animate-loading-bar {
  animation: loading-bar 1.5s ease-in-out infinite;
  width: 50%;
}
```

## Usage Examples

### In TocBoard (Board Loading)
```javascript
const { startLoading, stopLoading } = useLoading();

async function loadBoard() {
  try {
    startLoading();
    const backendData = await boardsApi.getBoardData(boardId);
    // ... process data
  } finally {
    stopLoading();
  }
}
```

### In TocNodeEditDialog (Comment Operations)
```javascript
const { startLoading, stopLoading } = useLoading();

const handleAddComment = async () => {
  startLoading();
  try {
    const data = await boardsApi.createNodeComment(board.id, node.id, newComment);
    // ... update state
  } finally {
    stopLoading();
  }
};
```

## Features
- ✅ Indeterminate horizontal progress bar
- ✅ Fixed at top of screen (z-index: 50)
- ✅ Blue color (#3b82f6) matching the app theme
- ✅ Smooth CSS animation
- ✅ Handles concurrent API calls (counter-based)
- ✅ No visual flash for very quick operations
- ✅ Global state management via Context API

## Future Enhancements
- Add loading state to more API operations (edge comments, assumptions, node updates, etc.)
- Consider adding a minimum display time to prevent flickering
- Add optional timeout/error handling
- Consider adding progress percentage for long operations

