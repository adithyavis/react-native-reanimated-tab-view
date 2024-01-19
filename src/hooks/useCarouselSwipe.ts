import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  type SharedValue,
  runOnJS,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';

const ACTIVE_OFFSET_X = [-10, 10];

export const useCarouselSwipePanGesture = (
  currentRouteIndex: number,
  swipeTranslationX: SharedValue<number>,
  updateCurrentRouteIndex: (value: number) => void,
  sceneContainerWidth: number,
  noOfRoutes: number,
  swipeEnabled = true
) => {
  const preSwipeStartSwipeTranslationX = useSharedValue(0);

  const minRouteIndex = 0;
  const maxRouteIndex = noOfRoutes - 1;
  const minSwipeTranslationX = minRouteIndex * sceneContainerWidth;
  const maxSwipeTranslationX = maxRouteIndex * sceneContainerWidth;

  const swipePanGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(swipeEnabled)
        .activeOffsetX(ACTIVE_OFFSET_X)
        .onStart(() => {
          preSwipeStartSwipeTranslationX.value = swipeTranslationX.value;
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
        .onEnd(({ velocityX }) => {
          let closestAdjacentRouteIndexToSnap = Math.round(
            -(swipeTranslationX.value + velocityX) / sceneContainerWidth
          );
          if (closestAdjacentRouteIndexToSnap < currentRouteIndex) {
            closestAdjacentRouteIndexToSnap = Math.max(
              0,
              currentRouteIndex - 1,
              closestAdjacentRouteIndexToSnap
            );
          } else if (closestAdjacentRouteIndexToSnap > currentRouteIndex) {
            closestAdjacentRouteIndexToSnap = Math.min(
              noOfRoutes - 1,
              currentRouteIndex + 1,
              closestAdjacentRouteIndexToSnap
            );
          }
          swipeTranslationX.value = withTiming(
            -closestAdjacentRouteIndexToSnap * sceneContainerWidth,
            {
              duration: 200,
              easing: Easing.ease,
            }
          );
          runOnJS(updateCurrentRouteIndex)(closestAdjacentRouteIndexToSnap);
        }),
    [
      swipeEnabled,
      preSwipeStartSwipeTranslationX,
      swipeTranslationX,
      maxSwipeTranslationX,
      minSwipeTranslationX,
      sceneContainerWidth,
      currentRouteIndex,
      updateCurrentRouteIndex,
      noOfRoutes,
    ]
  );

  return swipePanGesture;
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
