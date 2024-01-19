import { useCallback, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  type SharedValue,
  runOnJS,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { AUTO_SWIPE_COMPLETION_DURATION } from '../constants/carousel';
import { useCarouselRouteIndices } from './useCarousel';
import type { Route } from '../types/common';

const ACTIVE_OFFSET_X = [-10, 10];

export const useCarouselSwipePanGesture = (
  currentRouteIndex: number,
  swipeTranslationX: SharedValue<number>,
  updateCurrentRouteIndex: (value: number) => void,
  sceneContainerWidth: number,
  noOfRoutes: number,
  handleSwipeStart: () => void,
  handleSwipeEnd: () => void,
  swipeEnabled = true
) => {
  const preSwipeStartSwipeTranslationX = useSharedValue(0);

  const { minRouteIndex, maxRouteIndex } = useCarouselRouteIndices(
    currentRouteIndex,
    noOfRoutes
  );
  const minSwipeTranslationX = minRouteIndex * sceneContainerWidth;
  const maxSwipeTranslationX = maxRouteIndex * sceneContainerWidth;

  const swipePanGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(swipeEnabled)
        .activeOffsetX(ACTIVE_OFFSET_X)
        .onStart(() => {
          preSwipeStartSwipeTranslationX.value = swipeTranslationX.value;
          runOnJS(handleSwipeStart)();
        })
        .onUpdate(({ translationX }) => {
          swipeTranslationX.value = Math.min(
            Math.max(
              preSwipeStartSwipeTranslationX.value + translationX,
              -1 * maxSwipeTranslationX
            ),
            -1 * minSwipeTranslationX
          );
        })
        .onEnd(({ translationX, velocityX }) => {
          const shouldInertiallySnapBackToCurrentRouteIndex =
            Math.round(
              -(swipeTranslationX.value + velocityX) / sceneContainerWidth
            ) === currentRouteIndex;

          if (shouldInertiallySnapBackToCurrentRouteIndex) {
            swipeTranslationX.value = withTiming(
              -currentRouteIndex * sceneContainerWidth,
              {
                duration: AUTO_SWIPE_COMPLETION_DURATION,
                easing: Easing.ease,
              }
            );
            runOnJS(handleSwipeEnd)();
            return;
          }

          let routeIndexToInertiallySnap;
          if (translationX > 0) {
            routeIndexToInertiallySnap = Math.max(
              minRouteIndex,
              currentRouteIndex - 1
            );
          } else {
            routeIndexToInertiallySnap = Math.min(
              maxRouteIndex,
              currentRouteIndex + 1
            );
          }
          swipeTranslationX.value = withTiming(
            -routeIndexToInertiallySnap * sceneContainerWidth,
            {
              duration: AUTO_SWIPE_COMPLETION_DURATION,
              easing: Easing.ease,
            }
          );
          runOnJS(updateCurrentRouteIndex)(routeIndexToInertiallySnap);
          runOnJS(handleSwipeEnd)();
        }),
    [
      swipeEnabled,
      preSwipeStartSwipeTranslationX,
      swipeTranslationX,
      handleSwipeStart,
      maxSwipeTranslationX,
      minSwipeTranslationX,
      sceneContainerWidth,
      currentRouteIndex,
      updateCurrentRouteIndex,
      handleSwipeEnd,
      minRouteIndex,
      maxRouteIndex,
    ]
  );

  return swipePanGesture;
};

export const useCarouselJumpToIndex = (
  routes: Route[],
  swipeTranslationX: SharedValue<number>,
  sceneContainerWidth: number,
  updateCurrentRouteIndex: (value: number) => void
) => {
  const jumpToRoute = useCallback(
    (key: string) => {
      const indexToJumpTo = routes.findIndex((route) => route.key === key);
      if (indexToJumpTo === -1) {
        return;
      }
      swipeTranslationX.value = withTiming(
        -indexToJumpTo * sceneContainerWidth,
        {
          duration: AUTO_SWIPE_COMPLETION_DURATION,
          easing: Easing.ease,
        }
      );
      updateCurrentRouteIndex(indexToJumpTo);
    },
    [routes, sceneContainerWidth, swipeTranslationX, updateCurrentRouteIndex]
  );

  return jumpToRoute;
};

export const useCarouselSwipeTranslationAnimatedStyle = (
  swipeTranslationX: SharedValue<number>
) => {
  const swipeTranslationAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateX: swipeTranslationX.value }],
    }),
    [swipeTranslationX]
  );
  return swipeTranslationAnimatedStyle;
};