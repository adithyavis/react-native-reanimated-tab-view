import React, { useCallback, useMemo, useRef, useState } from 'react';
import type {
  RouteIndexToTabOffsetMap,
  RouteIndexToTabWidthMap,
  TabBarProps,
} from '../types/TabBar';
import { FlatList } from 'react-native-gesture-handler';
import type { FlatListProps } from 'react-native';
import type { Route } from '../types/common';
import { View } from 'react-native';
import { TAB_BAR_HEIGHT } from '../constants/tabBar';
import TabBarItem from './TabBarItem';
import { StyleSheet } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { useTabBarAutoScroll } from '../hooks/useTabBarAutoScroll';
import TabIndicator from './TabIndicator';
import { useHandleTabBarItemLayout } from '../hooks/useTabBarItemLayout';

const TabBar = React.memo((props: TabBarProps) => {
  const {
    navigationState,
    scrollEnabled = false,
    bounces,
    layout,
    animatedRouteIndex,
    activeColor,
    inactiveColor,
    jumpTo,
    getLabelText,
    renderTabBarItem,
    onTabPress,
    onTabLongPress,
    tabBarItemStyle,
    labelStyle,
    indicatorStyle,
    contentContainerStyle,
    style,
  } = props;

  const flatListRef = useRef<FlatList>(null);

  const routeIndexToTabWidthMapRef = useRef<RouteIndexToTabWidthMap>({});
  const [routeIndexToTabOffsetMap, setRouteIndexToTabOffsetMap] =
    useState<RouteIndexToTabOffsetMap>({});

  const { autoScrollToRouteIndex, handleScrollToIndexFailed } =
    useTabBarAutoScroll(
      flatListRef,
      navigationState,
      routeIndexToTabWidthMapRef,
      routeIndexToTabOffsetMap,
      layout
    );

  const { handleTabBarItemLayout } = useHandleTabBarItemLayout(
    routeIndexToTabWidthMapRef,
    setRouteIndexToTabOffsetMap,
    navigationState.routes.length
  );

  const data: NonNullable<FlatListProps<Route>['data']> = useMemo(
    () => navigationState.routes,
    [navigationState.routes]
  );

  const renderItem: NonNullable<FlatListProps<Route>['renderItem']> =
    useCallback(
      ({ item, index }) => {
        const route = item;
        const scene = { route };
        const focused = index === navigationState.index;
        const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
          handleTabBarItemLayout(index, nativeEvent.layout);
        };
        const handlePressTab = () => {
          onTabPress?.(scene);
          autoScrollToRouteIndex(index);
        };
        if (renderTabBarItem) {
          return (
            <View onLayout={onLayout} style={styles.tabBarItemContainer}>
              {renderTabBarItem({
                index,
                route,
                focused,
                activeColor,
                inactiveColor,
                animatedRouteIndex,
                getLabelText,
                jumpTo,
                onTabPress: handlePressTab,
                onTabLongPress,
                style: tabBarItemStyle,
                labelStyle,
              })}
            </View>
          );
        }
        if (scrollEnabled) {
          return (
            <View onLayout={onLayout} style={styles.tabBarItemContainer}>
              <TabBarItem
                index={index}
                route={route}
                focused={focused}
                activeColor={activeColor}
                inactiveColor={inactiveColor}
                animatedRouteIndex={animatedRouteIndex}
                getLabelText={getLabelText}
                jumpTo={jumpTo}
                onTabPress={handlePressTab}
                onTabLongPress={onTabLongPress}
                style={[styles.scrollableTabBarItem, tabBarItemStyle]}
                labelStyle={labelStyle}
              />
            </View>
          );
        }
        const width = layout.width / navigationState.routes.length;
        const _tabBarItemStyle = { width };
        return (
          <View onLayout={onLayout} style={styles.tabBarItemContainer}>
            <TabBarItem
              index={index}
              route={route}
              focused={focused}
              animatedRouteIndex={animatedRouteIndex}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
              getLabelText={getLabelText}
              jumpTo={jumpTo}
              onTabPress={handlePressTab}
              onTabLongPress={onTabLongPress}
              style={[_tabBarItemStyle, tabBarItemStyle]}
              labelStyle={labelStyle}
            />
          </View>
        );
      },
      [
        navigationState.index,
        navigationState.routes.length,
        renderTabBarItem,
        scrollEnabled,
        layout.width,
        animatedRouteIndex,
        activeColor,
        inactiveColor,
        getLabelText,
        jumpTo,
        onTabLongPress,
        tabBarItemStyle,
        labelStyle,
        handleTabBarItemLayout,
        onTabPress,
        autoScrollToRouteIndex,
      ]
    );

  const tabIndicatorComponent = useMemo(() => {
    return (
      <TabIndicator
        animatedRouteIndex={animatedRouteIndex}
        routeIndexToTabOffsetMap={routeIndexToTabOffsetMap}
        style={indicatorStyle}
      />
    );
  }, [animatedRouteIndex, routeIndexToTabOffsetMap, indicatorStyle]);

  return (
    <View style={styles.tabBarContainer}>
      <FlatList
        ref={flatListRef}
        horizontal
        data={data}
        renderItem={renderItem}
        bounces={bounces}
        scrollEnabled={scrollEnabled}
        showsHorizontalScrollIndicator={false}
        style={style}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        contentContainerStyle={contentContainerStyle}
        ListHeaderComponent={tabIndicatorComponent}
      />
    </View>
  );
});
export default TabBar;

const styles = StyleSheet.create({
  tabBarContainer: {
    height: TAB_BAR_HEIGHT,
    backgroundColor: '#25A0F6',
  },
  tabBarItemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollableTabBarItem: {
    paddingHorizontal: 30,
  },
});
