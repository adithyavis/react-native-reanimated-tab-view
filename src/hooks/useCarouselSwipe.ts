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

  const handleSwipeAnimationEnd = useCallback(
    (prevRouteIndex: number) => {
      setTimeout(() => {
        setPrevRouteIndex(prevRouteIndex);
      }, AUTO_SWIPE_COMPLETION_DURATION);
    },
    [setPrevRouteIndex]
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
          swipeTranslationX.value = withTiming(
            -routeIndexToInertiallySnap * sceneContainerWidth,
            {
              duration: AUTO_SWIPE_COMPLETION_DURATION,
              easing: Easing.out(Easing.ease),
            }
          );
          animatedRouteIndex.value = withTiming(routeIndexToInertiallySnap, {
            duration: AUTO_SWIPE_COMPLETION_DURATION,
            easing: Easing.out(Easing.ease),
          });

          currentRouteIndexSharedValue.value = routeIndexToInertiallySnap;
          runOnJS(updateCurrentRouteIndex)(routeIndexToInertiallySnap);
          runOnJS(handleSwipeEnd)();
          runOnJS(handleSwipeAnimationEnd)(routeIndexToInertiallySnap);
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
      handleSwipeAnimationEnd,
      minRouteIndex,
      maxRouteIndex,
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
  smoothJump: boolean,
  setIsJumping: Dispatch<SetStateAction<boolean>>,
  animatedRouteIndex: SharedValue<number>
) => {
  const minRouteIndex = 0;
  const maxRouteIndex = noOfRoutes - 1;

  const handleJumpAnimationEnd = useCallback(
    (prevRouteIndex: number) => {
      setTimeout(() => {
        setPrevRouteIndex(prevRouteIndex);
        prevRouteTranslationX.value = 0;

        setIsJumping(false);
      }, AUTO_SWIPE_COMPLETION_DURATION);
    },
    [prevRouteTranslationX, setIsJumping, setPrevRouteIndex]
  );

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
        }
      );

      handleJumpAnimationEnd(routeIndexToJumpTo);
    },
    [
      animatedRouteIndex,
      currentRouteIndexSharedValue,
      handleJumpAnimationEnd,
      maxRouteIndex,
      minRouteIndex,
      prevRouteTranslationX,
      routes,
      sceneContainerWidth,
      setIsJumping,
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
