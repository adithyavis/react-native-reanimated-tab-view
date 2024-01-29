import React, { useCallback, useMemo, useRef, useState } from 'react';
import TabViewCarousel, {
  type CarouselImperativeHandle,
} from './TabViewCarousel';

import { type TabViewProps } from '../types/TabView';
import { View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import type { Layout } from '../types/common';
import { useSharedValue } from 'react-native-reanimated';
import TabBar from './TabBar';
import { StyleSheet } from 'react-native';

export const TabView = React.memo((props: TabViewProps) => {
  const {
    navigationState,
    initialLayout,
    sceneContainerStyle,
    keyboardDismissMode,
    swipeEnabled,
    mode = 'window',
    tabBarPosition = 'top',
    renderTabBar,
    renderScene,
    onIndexChange,
    onSwipeEnd,
    onSwipeStart,
  } = props;

  const [layout, setLayout] = useState<Layout>({
    width: 0,
    height: 0,
    ...initialLayout,
  });
  const tabViewCarouselRef = useRef<CarouselImperativeHandle>(null);

  const onLayout = useCallback(({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout;
    setLayout((prevLayout) => ({ ...prevLayout, width, height }));
  }, []);

  const containerLayoutStyle = useMemo(() => {
    const width: number | `${number}%` = layout?.width || '100%';
    return { width };
  }, [layout]);

  const jumpTo = useCallback((route: string) => {
    tabViewCarouselRef.current?.jumpToRoute(route);
  }, []);

  const animatedRouteIndex = useSharedValue(navigationState.index);

  const [currentRouteIndex, setCurrentRouteIndex] = useState(
    navigationState.index
  );

  const handleIndexChange = useCallback(
    (index: number) => {
      setCurrentRouteIndex(index);
      onIndexChange?.(index);
    },
    [onIndexChange]
  );

  const tabBar = useMemo(() => {
    if (renderTabBar) {
      return renderTabBar({
        navigationState,
        routeIndex: currentRouteIndex,
        animatedRouteIndex,
        layout,
        jumpTo,
        getLabelText: (scene) => scene.route.title,
        scrollEnabled: true,
      });
    }
    return (
      <TabBar
        layout={layout}
        routeIndex={currentRouteIndex}
        animatedRouteIndex={animatedRouteIndex}
        jumpTo={jumpTo}
        getLabelText={(scene) => scene.route.title}
        navigationState={navigationState}
        scrollEnabled={true}
      />
    );
  }, [
    renderTabBar,
    layout,
    currentRouteIndex,
    animatedRouteIndex,
    jumpTo,
    navigationState,
  ]);

  return (
    <View
      style={[styles.containerLayout, containerLayoutStyle]}
      onLayout={onLayout}
    >
      {tabBarPosition === 'top' && tabBar}
      <TabViewCarousel
        ref={tabViewCarouselRef}
        mode={mode}
        navigationState={navigationState}
        smoothJump={true}
        animatedRouteIndex={animatedRouteIndex}
        renderScene={renderScene}
        sceneContainerStyle={sceneContainerStyle}
        onIndexChange={handleIndexChange}
        layout={layout}
        keyboardDismissMode={keyboardDismissMode}
        swipeEnabled={swipeEnabled}
        onSwipeEnd={onSwipeEnd}
        onSwipeStart={onSwipeStart}
      />
      {tabBarPosition === 'bottom' && tabBar}
    </View>
  );
});

const styles = StyleSheet.create({
  containerLayout: {
    flex: 1,
  },
});
