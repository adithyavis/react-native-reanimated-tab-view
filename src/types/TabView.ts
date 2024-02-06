import type { ViewProps } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { StyleProp } from 'react-native';
import type {
  Layout,
  NavigationState,
  RenderMode,
  Route,
  SceneRendererProps,
  TabBarType,
} from './common';
import type { TabBarProps } from './TabBar';

export type TabViewProps = Omit<ViewProps, 'children'> & {
  onIndexChange: (index: number) => void;
  navigationState: NavigationState;
  renderScene: (
    props: SceneRendererProps & {
      route: Route;
    }
  ) => React.ReactNode;
  // renderLazyPlaceholder?: (props: { route: Route }) => React.ReactNode;
  renderTabBar?: (props: TabBarProps) => React.ReactNode;
  tabBarPosition?: 'top' | 'bottom';
  smoothJump?: boolean;
  initialLayout?: Partial<Layout>;
  sceneContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  keyboardDismissMode?: 'none' | 'on-drag' | 'auto';
  swipeEnabled?: boolean;
  mode?: RenderMode;
  type?: TabBarType;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
};
