import React, { useCallback, useMemo } from 'react';
import type { TabBarProps } from '../types/TabBar';
import { FlatList } from 'react-native-gesture-handler';
import type { FlatListProps } from 'react-native';
import type { Route } from '../types/common';
import { View } from 'react-native';
import { TAB_BAR_HEIGHT } from '../constants/tabBar';
import TabBarItem from './TabBarItem';
import { StyleSheet } from 'react-native';

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
        if (renderTabBarItem) {
          return <>{renderTabBarItem({ ...scene, focused })}</>;
        }
        if (scrollEnabled) {
          const _tabBarItemStyle = { paddingHorizontal: 30 };
          return (
            <TabBarItem
              index={index}
              route={route}
              focused={focused}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
              animatedRouteIndex={animatedRouteIndex}
              getLabelText={getLabelText}
              jumpTo={jumpTo}
              onTabPress={onTabPress}
              onTabLongPress={onTabLongPress}
              style={[_tabBarItemStyle, tabBarItemStyle]}
              labelStyle={labelStyle}
            />
          );
        }
        const width = layout.width / navigationState.routes.length;
        const _tabBarItemStyle = { width };
        return (
          <TabBarItem
            index={index}
            route={route}
            focused={focused}
            animatedRouteIndex={animatedRouteIndex}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
            getLabelText={getLabelText}
            jumpTo={jumpTo}
            onTabPress={onTabPress}
            onTabLongPress={onTabLongPress}
            style={[_tabBarItemStyle, tabBarItemStyle]}
            labelStyle={labelStyle}
          />
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
        onTabPress,
        onTabLongPress,
        tabBarItemStyle,
        labelStyle,
      ]
    );

  return (
    <View style={styles.tabBarContainer}>
      <FlatList
        horizontal
        data={data}
        renderItem={renderItem}
        bounces={bounces}
        scrollEnabled={scrollEnabled}
        showsHorizontalScrollIndicator={false}
        style={style}
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
});
