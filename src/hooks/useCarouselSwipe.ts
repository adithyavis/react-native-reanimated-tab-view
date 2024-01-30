import {
  useCallback,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from 'react';
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
import type { Route } from '../types/common';

const ACTIVE_OFFSET_X = [-10, 10];

export const useCarouselSwipePanGesture = (
  currentRouteIndexSharedValue: SharedValue<number>,
  swipeTranslationX: SharedValue<number>,
  updateCurrentRouteIndex: (value: number) => void,
  sceneContainerWidth: number,
  noOfRoutes: number,
  handleSwipeStart: () => void,
  handleSwipeEnd: () => void,
  _swipeEnabled = true,
  setPrevRouteIndex: (index: number) => void,
  prevRouteIndexSharedValue: SharedValue<number>,
  isJumping: boolean,
  animatedRouteIndex: SharedValue<number>
) => {
  const preSwipeStartSwipeTranslationX = useSharedValue(0);

  const minRouteIndex = 0;
  const maxRouteIndex = noOfRoutes - 1;
  const minSwipeTranslationX = minRouteIndex * sceneContainerWidth;
  const maxSwipeTranslationX = maxRouteIndex * sceneContainerWidth;

  const swipeEnabled = useMemo(
    () => !isJumping && _swipeEnabled,
    [_swipeEnabled, isJumping]
  );

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
          const boundedTranslationX = Math.min(
            Math.max(translationX, -sceneContainerWidth),
            sceneContainerWidth
          );
          swipeTranslationX.value = Math.min(
            Math.max(
              preSwipeStartSwipeTranslationX.value + boundedTranslationX,
              -1 * maxSwipeTranslationX
            ),
            -1 * minSwipeTranslationX
          );
          animatedRouteIndex.value =
            -swipeTranslationX.value / sceneContainerWidth;
        })
        .onEnd(({ translationX, velocityX }) => {
          const currentRouteIndex = currentRouteIndexSharedValue.value;
          const shouldInertiallySnapBackToCurrentRouteIndex =
            Math.round(
              -(swipeTranslationX.value + velocityX) / sceneContainerWidth
            ) === currentRouteIndex;

          if (shouldInertiallySnapBackToCurrentRouteIndex) {
            swipeTranslationX.value = withTiming(
              -currentRouteIndex * sceneContainerWidth,
              {
                duration: AUTO_SWIPE_COMPLETION_DURATION,
                easing: Easing.out(Easing.ease),
              }
            );
            animatedRouteIndex.value = withTiming(currentRouteIndex, {
              duration: AUTO_SWIPE_COMPLETION_DURATION,
              easing: Easing.out(Easing.ease),
            });
            runOnJS(handleSwipeEnd)();
            return;
          }

          let routeIndexToInertiallySnap: number;
          const leftSwipe = translationX > 0;
          if (leftSwipe) {
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
          animatedRouteIndex.value = withTiming(routeIndexToInertiallySnap, {
            duration: AUTO_SWIPE_COMPLETION_DURATION,
            easing: Easing.out(Easing.ease),
          });

          swipeTranslationX.value = withTiming(
            -routeIndexToInertiallySnap * sceneContainerWidth,
            {
              duration: AUTO_SWIPE_COMPLETION_DURATION,
              easing: Easing.out(Easing.ease),
            },
            () => {
              prevRouteIndexSharedValue.value = routeIndexToInertiallySnap;
              runOnJS(setPrevRouteIndex)(routeIndexToInertiallySnap);
            }
          );

          currentRouteIndexSharedValue.value = routeIndexToInertiallySnap;
          runOnJS(updateCurrentRouteIndex)(routeIndexToInertiallySnap);
          runOnJS(handleSwipeEnd)();
        }),
    [
      swipeEnabled,
      preSwipeStartSwipeTranslationX,
      swipeTranslationX,
      handleSwipeStart,
      sceneContainerWidth,
      maxSwipeTranslationX,
      minSwipeTranslationX,
      animatedRouteIndex,
      currentRouteIndexSharedValue,
      updateCurrentRouteIndex,
      handleSwipeEnd,
      maxRouteIndex,
      prevRouteIndexSharedValue,
      setPrevRouteIndex,
    ]
  );

  return swipePanGesture;
};

export const useCarouselJumpToIndex = (
  routes: Route[],
  currentRouteIndexSharedValue: SharedValue<number>,
  swipeTranslationX: SharedValue<number>,
  sceneContainerWidth: number,
  noOfRoutes: number,
  updateCurrentRouteIndex: (value: number) => void,
  prevRouteTranslationX: SharedValue<number>,
  setPrevRouteIndex: (value: number) => void,
  prevRouteIndexSharedValue: SharedValue<number>,
  routeIndexToJumpToSharedValue: SharedValue<number | null>,
  smoothJump: boolean,
  setIsJumping: Dispatch<SetStateAction<boolean>>,
  animatedRouteIndex: SharedValue<number>
) => {
  const minRouteIndex = 0;
  const maxRouteIndex = noOfRoutes - 1;

  const jumpToRoute = useCallback(
    (key: string) => {
      const currentRouteIndex = currentRouteIndexSharedValue.value;
      const routeIndexToJumpTo = routes.findIndex((route) => route.key === key);
      /** Only jump if route is in between the min and max ranges,
       * and not equal to current route index
       */
      if (
        routeIndexToJumpTo === -1 ||
        routeIndexToJumpTo < minRouteIndex ||
        routeIndexToJumpTo > maxRouteIndex ||
        routeIndexToJumpTo === currentRouteIndex
      ) {
        return;
      }

      setIsJumping(true);
      routeIndexToJumpToSharedValue.value = routeIndexToJumpTo;

      if (smoothJump) {
        const shouldJumpLeft = routeIndexToJumpTo > currentRouteIndex;
        let tempRouteIndexToJumpTo: number;
        if (shouldJumpLeft) {
          tempRouteIndexToJumpTo = routeIndexToJumpTo - 1;
        } else {
          tempRouteIndexToJumpTo = routeIndexToJumpTo + 1;
        }
        swipeTranslationX.value = -tempRouteIndexToJumpTo * sceneContainerWidth;
        prevRouteTranslationX.value =
          (tempRouteIndexToJumpTo - currentRouteIndex) * sceneContainerWidth;
      }

      currentRouteIndexSharedValue.value = routeIndexToJumpTo;
      updateCurrentRouteIndex(routeIndexToJumpTo);

      animatedRouteIndex.value = withTiming(routeIndexToJumpTo, {
        duration: AUTO_SWIPE_COMPLETION_DURATION,
        easing: Easing.ease,
      });

      swipeTranslationX.value = withTiming(
        -routeIndexToJumpTo * sceneContainerWidth,
        {
          duration: AUTO_SWIPE_COMPLETION_DURATION,
          easing: Easing.ease,
        },
        () => {
          routeIndexToJumpToSharedValue.value = null;
          prevRouteIndexSharedValue.value = routeIndexToJumpTo;
          prevRouteTranslationX.value = 0;
          runOnJS(setPrevRouteIndex)(routeIndexToJumpTo);
          runOnJS(setIsJumping)(false);
        }
      );
    },
    [
      animatedRouteIndex,
      currentRouteIndexSharedValue,
      maxRouteIndex,
      prevRouteIndexSharedValue,
      prevRouteTranslationX,
      routeIndexToJumpToSharedValue,
      routes,
      sceneContainerWidth,
      setIsJumping,
      setPrevRouteIndex,
      smoothJump,
      swipeTranslationX,
      updateCurrentRouteIndex,
    ]
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
