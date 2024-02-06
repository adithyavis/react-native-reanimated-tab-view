import React, { useCallback, useMemo, useRef } from 'react';
import type { TabBarProps } from '../types/TabBar';
import { FlatList } from 'react-native-gesture-handler';
import type { FlatListProps } from 'react-native';
import type { Route } from '../types/common';
import { View } from 'react-native';
import TabBarItem from './TabBarItem';
import { StyleSheet } from 'react-native';
import { useTabBarAutoScroll } from '../hooks/useTabBarAutoScroll';
import TabIndicator from './TabIndicator';
import { TAB_BAR_HEIGHT, TAB_BAR_PADDING_VERTICAL } from '../constants/tabBar';
import Tab from './Tab';

const TabBar = React.memo((props: TabBarProps) => {
  const {
    navigationState,
    routeIndex: currentRouteIndex,
    scrollEnabled = false,
    bounces,
    layout,
    animatedRouteIndex,
    activeColor,
    inactiveColor,
    type = 'secondary',
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

  const { autoScrollToRouteIndex, handleScrollToIndexFailed } =
    useTabBarAutoScroll(flatListRef, currentRouteIndex, layout);

  const data: NonNullable<FlatListProps<Route>['data']> = useMemo(
    () => navigationState.routes,
    [navigationState.routes]
  );

  const renderItem: NonNullable<FlatListProps<Route>['renderItem']> =
    useCallback(
      ({ item, index: routeIndex }) => {
        const route = item;
        const scene = { route };
        const focused = routeIndex === navigationState.index;
        const handlePressTab = () => {
          onTabPress?.(scene);
          autoScrollToRouteIndex(routeIndex);
        };
        if (renderTabBarItem) {
          return (
            <Tab
              index={routeIndex}
              noOfRoutes={navigationState.routes.length}
              style={styles.tab}
            >
              {renderTabBarItem({
                index: routeIndex,
                route,
                focused,
                activeColor,
                inactiveColor,
                animatedRouteIndex,
                getLabelText,
                jumpTo,
                onTabPress: handlePressTab,
                onTabLongPress,
                style: [styles.tabBarItem, tabBarItemStyle],
                labelStyle,
              })}
            </Tab>
          );
        }
        if (scrollEnabled) {
          return (
            <Tab
              index={routeIndex}
              noOfRoutes={navigationState.routes.length}
              style={styles.tab}
            >
              <TabBarItem
                index={routeIndex}
                route={route}
                focused={focused}
                activeColor={activeColor}
                inactiveColor={inactiveColor}
                animatedRouteIndex={animatedRouteIndex}
                getLabelText={getLabelText}
                jumpTo={jumpTo}
                onTabPress={handlePressTab}
                onTabLongPress={onTabLongPress}
                style={[styles.tabBarItem, tabBarItemStyle]}
                labelStyle={labelStyle}
              />
            </Tab>
          );
        }
        const width = layout.width / navigationState.routes.length;
        const _tabStyle = { width };
        return (
          <Tab
            index={routeIndex}
            noOfRoutes={navigationState.routes.length}
            style={[styles.tab, _tabStyle]}
          >
            <TabBarItem
              index={routeIndex}
              route={route}
              focused={focused}
              animatedRouteIndex={animatedRouteIndex}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
              getLabelText={getLabelText}
              jumpTo={jumpTo}
              onTabPress={handlePressTab}
              onTabLongPress={onTabLongPress}
              style={[styles.tabBarItem, tabBarItemStyle]}
              labelStyle={labelStyle}
            />
          </Tab>
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

  const tabIndicatorComponent = useMemo(() => {
    return (
      <TabIndicator
        type={type}
        animatedRouteIndex={animatedRouteIndex}
        style={indicatorStyle}
      />
    );
  }, [type, animatedRouteIndex, indicatorStyle]);

  return (
    <View style={[styles.tabBarContainer, style]}>
      <FlatList
        ref={flatListRef}
        horizontal
        data={data}
        renderItem={renderItem}
        bounces={bounces}
        removeClippedSubviews={false}
        scrollEnabled={scrollEnabled}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        ListHeaderComponent={tabIndicatorComponent}
      />
    </View>
  );
});
export default TabBar;

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: '#25A0F6',
    height: TAB_BAR_HEIGHT,
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  tabBarItem: {
    paddingVertical: TAB_BAR_PADDING_VERTICAL,
  },
});
