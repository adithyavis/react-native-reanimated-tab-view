import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import type { TabViewCarouselProps } from '../types/TabViewCarousel';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import {
  useCarouselSwipePanGesture,
  useCarouselSwipeTranslationAnimatedStyle,
} from '../hooks/useCarouselSwipe';

export const TabViewCarousel = React.memo((props: TabViewCarouselProps) => {
  const {
    navigationState,
    renderScene,
    layout,
    onIndexChange,
    style,
    sceneContainerStyle,
    swipeEnabled = true,
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
  const leftAdjacentRouteIndex = useMemo(
    () => Math.max(0, currentRouteIndex - 1),
    [currentRouteIndex]
  );
  const rightAdjacentRouteIndex = useMemo(
    () => Math.min(noOfRoutes - 1, currentRouteIndex + 1),
    [currentRouteIndex, noOfRoutes]
  );

  const swipeTranslationX = useSharedValue(0);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const jumpToRoute = useCallback(() => {}, []);

  const swipePanGesture = useCarouselSwipePanGesture(
    currentRouteIndex,
    swipeTranslationX,
    updateCurrentRouteIndex,
    sceneContainerWidth,
    noOfRoutes,
    swipeEnabled
  );

  const swipeTranslationAnimatedStyle =
    useCarouselSwipeTranslationAnimatedStyle(swipeTranslationX);

  return (
    <GestureDetector gesture={swipePanGesture}>
      <View style={[styles.container, style]}>
        {navigationState.routes.map((route, index) => {
          const shouldRender =
            index >= leftAdjacentRouteIndex && index <= rightAdjacentRouteIndex;
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
});

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
