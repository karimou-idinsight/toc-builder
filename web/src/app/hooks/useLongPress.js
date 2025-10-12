'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for handling long press interactions
 * @param {Function} onLongPress - Callback function to execute on long press
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Time in ms to trigger long press (default: 600)
 * @param {Function} options.onStart - Callback when press starts
 * @param {Function} options.onEnd - Callback when press ends
 * @param {Function} options.onCancel - Callback when press is cancelled
 * @returns {Object} Event handlers and state
 */
export function useLongPress(onLongPress, options = {}) {
  const {
    threshold = 600,
    onStart,
    onEnd,
    onCancel
  } = options;

  const [isPressed, setIsPressed] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [startPosition, setStartPosition] = useState(null);
  const [shouldPreventEnd, setShouldPreventEnd] = useState(false);
  
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);

  // Clear timer and reset state
  const clearLongPressTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start long press detection
  const startLongPress = useCallback((event) => {
    // Get position from mouse or touch event
    const clientX = event.clientX || (event.touches && event.touches[0]?.clientX);
    const clientY = event.clientY || (event.touches && event.touches[0]?.clientY);
    
    setStartPosition({ x: clientX, y: clientY });
    setIsPressed(true);
    isLongPressRef.current = false;
    
    if (onStart) {
      onStart(event, { x: clientX, y: clientY });
    }

    timerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      isLongPressRef.current = true;
      setShouldPreventEnd(true); // Prevent the end callback on this gesture
      
      if (onLongPress) {
        onLongPress(event, { x: clientX, y: clientY });
      }
    }, threshold);
  }, [onLongPress, onStart, threshold]);

  // End long press detection
  const endLongPress = useCallback((event) => {
    clearLongPressTimer();
    
    const wasLongPress = isLongPressRef.current;
    const preventEnd = shouldPreventEnd;
    
    setIsPressed(false);
    setIsLongPressing(false);
    setStartPosition(null);
    setShouldPreventEnd(false);
    isLongPressRef.current = false;
    
    // Only call onEnd if this wasn't a long press that should continue as drag
    if (onEnd && !preventEnd) {
      onEnd(event, { wasLongPress, startPosition });
    }
    
    return wasLongPress;
  }, [clearLongPressTimer, onEnd, startPosition, shouldPreventEnd]);

  // Cancel long press (e.g., on mouse leave)
  const cancelLongPress = useCallback((event) => {
    clearLongPressTimer();
    
    setIsPressed(false);
    setIsLongPressing(false);
    setStartPosition(null);
    isLongPressRef.current = false;
    
    if (onCancel) {
      onCancel(event);
    }
  }, [clearLongPressTimer, onCancel]);

  // Mouse event handlers
  const handleMouseDown = useCallback((event) => {
    startLongPress(event);
  }, [startLongPress]);

  const handleMouseUp = useCallback((event) => {
    return endLongPress(event);
  }, [endLongPress]);

  const handleMouseLeave = useCallback((event) => {
    cancelLongPress(event);
  }, [cancelLongPress]);

  // Touch event handlers
  const handleTouchStart = useCallback((event) => {
    startLongPress(event);
  }, [startLongPress]);

  const handleTouchEnd = useCallback((event) => {
    return endLongPress(event);
  }, [endLongPress]);

  const handleTouchCancel = useCallback((event) => {
    cancelLongPress(event);
  }, [cancelLongPress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  // Allow external control to continue the gesture
  const continueAsGesture = useCallback(() => {
    setShouldPreventEnd(true);
  }, []);

  // Allow external control to end the gesture properly
  const endGesture = useCallback(() => {
    setShouldPreventEnd(false);
    setIsPressed(false);
    setIsLongPressing(false);
    setStartPosition(null);
    isLongPressRef.current = false;
  }, []);

  // Return handlers and state
  return {
    // Event handlers
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    
    // State
    isPressed,
    isLongPressing,
    startPosition,
    
    // Manual control
    cancel: cancelLongPress,
    clear: clearLongPressTimer,
    continueAsGesture,
    endGesture
  };
}

export default useLongPress;