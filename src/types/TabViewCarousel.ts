import type { SharedValue } from 'react-native-reanimated';
import type {
  Layout,
  NavigationState,
  RenderMode,
  Route,
  SceneRendererProps,
} from './common';
import type { ViewProps } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { StyleProp } from 'react-native';

export type TabViewCarouselProps = Omit<ViewProps, 'children'> & {
  navigationState: NavigationState;
  renderScene: (
    props: SceneRendererProps & {
      route: Route;
    }
  ) => React.ReactNode;
  layout: Layout;
  onIndexChange: (index: number) => void;
  sceneContainerStyle?: StyleProp<ViewStyle>;
  keyboardDismissMode?: 'none' | 'on-drag' | 'auto';
  swipeEnabled?: boolean;
  smoothJump?: boolean;
  mode?: RenderMode;
  animatedRouteIndex: SharedValue<number>;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
};

export interface CarouselRenderItemInfo<Item> {
  item: Item;
  index: number;
  animationValue: SharedValue<number>;
}

export type CarouselRenderItem<Item> = (
  info: CarouselRenderItemInfo<Item>
) => React.ReactElement;
