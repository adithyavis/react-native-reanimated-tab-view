import React, { useCallback, useMemo, useRef } from 'react';
import type { RouteIndexToTabWidthMap, TabBarProps } from '../types/TabBar';
import { FlatList } from 'react-native-gesture-handler';
import type { FlatListProps } from 'react-native';
import type { Route } from '../types/common';
import { View } from 'react-native';
import { TAB_BAR_HEIGHT } from '../constants/tabBar';
import TabBarItem from './TabBarItem';
import { StyleSheet } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { useTabBarAutoScroll } from '../hooks/useTabBarAutoScroll';

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
    contentContainerStyle,
    style,
  } = props;

  const flatListRef = useRef<FlatList>(null);

  const routeIndexToTabWidthMapRef = useRef<RouteIndexToTabWidthMap>({});

  const { autoScrollToRouteIndex, handleScrollToIndexFailed } =
    useTabBarAutoScroll(
      flatListRef,
      navigationState,
      routeIndexToTabWidthMapRef,
      layout
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
          const { width } = nativeEvent.layout;
          routeIndexToTabWidthMapRef.current[index] = width;
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
        onTabPress,
        autoScrollToRouteIndex,
      ]
    );

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
