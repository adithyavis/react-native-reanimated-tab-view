import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { View } from 'react-native';
import type { TabViewCarouselProps } from '../types/TabViewCarousel';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import {
  useCarouselJumpToIndex,
  useCarouselSwipePanGesture,
  useCarouselSwipeTranslationAnimatedStyle,
} from '../hooks/useCarouselSwipe';
import { useCarouselRouteIndices } from '../hooks/useCarousel';

type CarouselImperativeHandle = {
  jumpToRoute: (route: string) => void;
};

export const TabViewCarousel = React.memo(
  forwardRef<CarouselImperativeHandle, TabViewCarouselProps>((props, ref) => {
    const {
      navigationState,
      renderScene,
      layout,
      onIndexChange,
      style,
      sceneContainerStyle,
      swipeEnabled = true,
      onSwipeStart,
      onSwipeEnd,
    } = props;

    const sceneContainerWidth = useMemo(() => layout.width, [layout.width]);
    const noOfRoutes = useMemo(
      () => navigationState.routes.length,
      [navigationState.routes.length]
    );

    const [currentRouteIndex, setCurrentRouteIndex] = useState(
      navigationState.index
    );
    const updateCurrentRouteIndex = useCallback(
      (indexToUpdate: number) => {
        const prevCurrentRouteIndex = currentRouteIndex;
        setCurrentRouteIndex(indexToUpdate);
        if (indexToUpdate !== prevCurrentRouteIndex) {
          onIndexChange?.(indexToUpdate);
        }
      },
      [currentRouteIndex, onIndexChange]
    );

    const { smallestRouteIndexToRender, largestRouteIndexToRender } =
      useCarouselRouteIndices(currentRouteIndex, noOfRoutes);

    const swipeTranslationX = useSharedValue(0);

    const handleSwipeStart = useCallback(() => {
      onSwipeStart?.();
    }, [onSwipeStart]);

    const handleSwipeEnd = useCallback(() => {
      onSwipeEnd?.();
    }, [onSwipeEnd]);

    const jumpToRoute = useCarouselJumpToIndex(
      navigationState.routes,
      swipeTranslationX,
      sceneContainerWidth,
      updateCurrentRouteIndex
    );

    useImperativeHandle(
      ref,
      () => ({
        jumpToRoute,
      }),
      [jumpToRoute]
    );

    const swipePanGesture = useCarouselSwipePanGesture(
      currentRouteIndex,
      swipeTranslationX,
      updateCurrentRouteIndex,
      sceneContainerWidth,
      noOfRoutes,
      handleSwipeStart,
      handleSwipeEnd,
      swipeEnabled
    );

    const swipeTranslationAnimatedStyle =
      useCarouselSwipeTranslationAnimatedStyle(swipeTranslationX);

    return (
      <GestureDetector gesture={swipePanGesture}>
        <View style={[styles.container, style]}>
          {navigationState.routes.map((route, index) => {
            const shouldRender =
              index >= smallestRouteIndexToRender &&
              index <= largestRouteIndexToRender;
            const renderOffset = index * sceneContainerWidth;
            if (!shouldRender) {
              return null;
            }
            return (
              <Animated.View
                key={route.key}
                style={[
                  styles.sceneContainer,
                  {
                    left: renderOffset,
                  },
                  sceneContainerStyle,
                  swipeTranslationAnimatedStyle,
                ]}
              >
                {renderScene({ layout, route, jumpTo: jumpToRoute })}
              </Animated.View>
            );
          })}
        </View>
      </GestureDetector>
    );
  })
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  sceneContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});