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
import { Keyboard } from 'react-native';
import { useCarouselLazyLoading } from '../hooks/useCarouselLazyLoading';
import LazyLoader from './LazyLoader';
import SceneWrapper from './SceneWrapper';

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

    const [initialRouteIndex] = useState(navigationState.index);
    const [currentRouteIndex, setCurrentRouteIndex] =
      useState(initialRouteIndex);
    const currentRouteIndexSharedValue = useSharedValue(initialRouteIndex);
    const prevRouteIndexSharedValue = useSharedValue(initialRouteIndex);
    const [prevRouteIndex, setPrevRouteIndex] = useState(initialRouteIndex);
    const routeIndexToJumpToSharedValue = useSharedValue<number | null>(null);
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
        initialRouteIndex,
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
      prevRouteIndexSharedValue,
      routeIndexToJumpToSharedValue,
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
      prevRouteIndexSharedValue,
      isJumping,
      animatedRouteIndex
    );

    const swipeTranslationAnimatedStyle =
      useCarouselSwipeTranslationAnimatedStyle(swipeTranslationX);

    return (
      <GestureDetector gesture={swipePanGesture}>
        <View style={[styles.container, style]}>
          {navigationState.routes.map((route, index) => {
            const shouldRender = computeShouldRenderRoute(index);
            const renderOffset = index * sceneContainerWidth;
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
                <SceneWrapper
                  routeIndex={index}
                  prevRouteTranslationX={prevRouteTranslationX}
                  prevRouteIndexSharedValue={prevRouteIndexSharedValue}
                  routeIndexToJumpToSharedValue={routeIndexToJumpToSharedValue}
                >
                  {shouldRender && (
                    <LazyLoader
                      isLazyLoadingEnabled={
                        index !== initialRouteIndex && isLazyLoadingEnabled
                      }
                      onMount={() => handleSceneMount(index)}
                    >
                      {renderScene({
                        layout,
                        route,
                        animatedRouteIndex,
                        jumpTo: jumpToRoute,
                      })}
                    </LazyLoader>
                  )}
                </SceneWrapper>
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
  prevRouteSceneWrapper: {
    width: '100%',
    height: '100%',
  },
});
