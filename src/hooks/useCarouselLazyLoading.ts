import { useCallback, useMemo, useState } from 'react';
import type { RenderMode } from '../types/common';
import {
  type SharedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

export const useCarouselLazyLoading = (
  mode: RenderMode,
  initialRouteIndex: number,
  currentRouteIndexSharedValue: SharedValue<number>,
  smallestRouteIndexToRender: number,
  largestRouteIndexToRender: number,
  prevRouteIndex: number
) => {
  const [lazyLoadedRouteIndices, setLazyLoadedRouteIndices] = useState<
    number[]
  >([initialRouteIndex]);

  const appendTolazyLoadedRouteIndices = useCallback((index: number) => {
    setLazyLoadedRouteIndices((prev) => {
      if (!prev.includes(index)) {
        return [...prev, index];
      }
      return prev;
    });
  }, []);

  useAnimatedReaction(
    () => currentRouteIndexSharedValue.value,
    (index: number) => {
      runOnJS(appendTolazyLoadedRouteIndices)(index);
    },
    []
  );

  const handleSceneMount = useCallback((index: number) => {
    setLazyLoadedRouteIndices((prev) => {
      if (!prev.includes(index)) {
        return [...prev, index];
      }
      return prev;
    });
  }, []);

  const isLazyLoadingEnabled = useMemo(() => mode === 'lazy', [mode]);

  const computeShouldRenderRoute = useCallback(
    (index: number) => {
      if (mode === 'window') {
        return (
          (index >= smallestRouteIndexToRender &&
            index <= largestRouteIndexToRender) ||
          index === prevRouteIndex
        );
      }
      if (mode === 'lazy') {
        return lazyLoadedRouteIndices.includes(index);
      }
      return true;
    },
    [
      largestRouteIndexToRender,
      lazyLoadedRouteIndices,
      mode,
      prevRouteIndex,
      smallestRouteIndexToRender,
    ]
  );

  return {
    isLazyLoadingEnabled,
    handleSceneMount,
    computeShouldRenderRoute,
  };
};
