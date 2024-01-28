import type { ViewProps } from 'react-native';
import type { NavigationState, Scene, SceneRendererProps } from './common';
import type { ViewStyle } from 'react-native';
import type { StyleProp } from 'react-native';
import type { TextStyle } from 'react-native';
import type { TabBarItemProps } from './TabBarItem';

export type TabBarProps = Omit<ViewProps, 'children'> &
  SceneRendererProps & {
    navigationState: NavigationState;
    scrollEnabled?: boolean;
    bounces?: boolean;
    activeColor?: string;
    inactiveColor?: string;
    getLabelText?: (scene: Scene) => string | undefined;
    renderTabBarItem?: (props: TabBarItemProps) => React.ReactNode;
    onTabPress?: (scene: Scene) => void;
    onTabLongPress?: (scene: Scene) => void;
    tabBarItemStyle?: StyleProp<ViewStyle>;
    indicatorStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
  };

export type RouteIndexToTabWidthMap = {
  [key: number]: number;
};

export type RouteIndexToTabOffsetMap = {
  [key: number]: number;
};