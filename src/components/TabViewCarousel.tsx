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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import {
  useCarouselJumpToIndex,
  useCarouselSwipePanGesture,
  useCarouselSwipeTranslationAnimatedStyle,
} from '../hooks/useCarouselSwipe';
import { useCarouselRouteIndices } from '../hooks/useCarousel';
import { Keyboard } from 'react-native';
import { useCarouselLazyLoading } from '../hooks/useCarouselLazyLoading';
import LazyLoader from './LazyLoader';

export type CarouselImperativeHandle = {
  jumpToRoute: (route: string) => void;
};

const TabViewCarousel = React.memo(
  forwardRef<CarouselImperativeHandle, TabViewCarouselProps>((props, ref) => {
    const {
      navigationState,
      renderScene,
      layout,
      mode = 'window',
      onIndexChange,
      style,
      sceneContainerStyle,
      swipeEnabled = true,
      keyboardDismissMode = 'auto',
      smoothJump = true,
      animatedRouteIndex,
      onSwipeStart,
      onSwipeEnd,
    } = props;

    const dismissKeyboard = useCallback(() => {
      Keyboard.dismiss();
    }, []);

    const handleSwipeStart = useCallback(() => {
      onSwipeStart?.();
      if (keyboardDismissMode === 'on-drag') {
        dismissKeyboard();
      }
    }, [dismissKeyboard, keyboardDismissMode, onSwipeStart]);

    const handleSwipeEnd = useCallback(() => {
      onSwipeEnd?.();
    }, [onSwipeEnd]);

    const handleIndexChange = useCallback(
      (index: number) => {
        onIndexChange?.(index);
        if (keyboardDismissMode === 'auto') {
          dismissKeyboard();
        }
      },
      [dismissKeyboard, keyboardDismissMode, onIndexChange]
    );

    const sceneContainerWidth = useMemo(() => layout.width, [layout.width]);
    const noOfRoutes = useMemo(
      () => navigationState.routes.length,
      [navigationState.routes.length]
    );

    const [currentRouteIndex, setCurrentRouteIndex] = useState(
      navigationState.index
    );
    const [initialRouteIndex] = useState(currentRouteIndex);
    const currentRouteIndexSharedValue = useSharedValue(currentRouteIndex);
    const [prevRouteIndex, setPrevRouteIndex] = useState(currentRouteIndex);
    const updateCurrentRouteIndex = useCallback(
      (indexToUpdate: number) => {
        const prevCurrentRouteIndex = currentRouteIndex;
        setCurrentRouteIndex(indexToUpdate);
        if (indexToUpdate !== prevCurrentRouteIndex) {
          handleIndexChange(indexToUpdate);
        }
      },
      [currentRouteIndex, handleIndexChange]
    );

    const swipeTranslationX = useSharedValue(
      -navigationState.index * layout.width
    );
    const prevRouteTranslationX = useSharedValue(0);

    const [isJumping, setIsJumping] = useState(false);

    const { smallestRouteIndexToRender, largestRouteIndexToRender } =
      useCarouselRouteIndices(currentRouteIndex, noOfRoutes);

    const { isLazyLoadingEnabled, handleSceneMount, computeShouldRenderRoute } =
      useCarouselLazyLoading(
        mode,
        currentRouteIndexSharedValue,
        smallestRouteIndexToRender,
        largestRouteIndexToRender,
        prevRouteIndex
      );

    const jumpToRoute = useCarouselJumpToIndex(
      navigationState.routes,
      currentRouteIndexSharedValue,
      swipeTranslationX,
      sceneContainerWidth,
      noOfRoutes,
      updateCurrentRouteIndex,
      prevRouteTranslationX,
      setPrevRouteIndex,
      smoothJump,
      setIsJumping,
      animatedRouteIndex
    );

    useImperativeHandle(
      ref,
      () => ({
        jumpToRoute,
      }),
      [jumpToRoute]
    );

    const swipePanGesture = useCarouselSwipePanGesture(
      currentRouteIndexSharedValue,
      swipeTranslationX,
      updateCurrentRouteIndex,
      sceneContainerWidth,
      noOfRoutes,
      handleSwipeStart,
      handleSwipeEnd,
      swipeEnabled,
      setPrevRouteIndex,
      isJumping,
      animatedRouteIndex
    );

    const swipeTranslationAnimatedStyle =
      useCarouselSwipeTranslationAnimatedStyle(swipeTranslationX);

    const prevRouteTranslationAnimatedStyle = useAnimatedStyle(
      () => ({
        transform: [{ translateX: prevRouteTranslationX.value }],
      }),
      [prevRouteTranslationX]
    );

    return (
      <GestureDetector gesture={swipePanGesture}>
        <View style={[styles.container, style]}>
          {navigationState.routes.map((route, index) => {
            const shouldRender = computeShouldRenderRoute(index);
            const renderOffset = index * sceneContainerWidth;
            if (!shouldRender) {
              return null;
            }
            return (
              <Animated.View
                key={route.key}
                style={[
                  styles.sceneContainer,
                  styles.sceneContainerZIndex1,
                  {
                    left: renderOffset,
                  },
                  sceneContainerStyle,
                  swipeTranslationAnimatedStyle,
                ]}
              >
                <LazyLoader
                  isLazyLoadingEnabled={
                    index !== initialRouteIndex && isLazyLoadingEnabled
                  }
                  onMount={() => handleSceneMount(index)}
                >
                  <Animated.View
                    style={[
                      styles.prevRouteSceneWrapper,
                      index === prevRouteIndex &&
                        prevRouteTranslationAnimatedStyle,
                    ]}
                  >
                    {renderScene({
                      layout,
                      route,
                      animatedRouteIndex,
                      jumpTo: jumpToRoute,
                    })}
                  </Animated.View>
                </LazyLoader>
              </Animated.View>
            );
          })}
        </View>
      </GestureDetector>
    );
  })
);

export default TabViewCarousel;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    overflow: 'hidden',
  },
  sceneContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  sceneContainerZIndex1: {
    zIndex: 1,
  },
  prevRouteSceneWrapper: {
    width: '100%',
    height: '100%',
  },
});
