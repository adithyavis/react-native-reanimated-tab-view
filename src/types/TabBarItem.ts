import type { ViewProps } from 'react-native';
import type { Route, Scene, SceneRendererProps } from './common';
import type { StyleProp } from 'react-native';
import type { TextStyle } from 'react-native';

export type TabBarItemProps = Omit<ViewProps, 'children'> &
  Omit<SceneRendererProps, 'layout'> & {
    index: number;
    route: Route;
    focused: boolean;
    activeColor?: string;
    inactiveColor?: string;
    getLabelText?: (scene: Scene) => string | undefined;
    renderLabel?: (
      scene: Scene & {
        focused: boolean;
        color: string;
      }
    ) => React.ReactNode;
    onTabPress?: (scene: Scene) => void;
    onTabLongPress?: (scene: Scene) => void;
    labelStyle?: StyleProp<TextStyle>;
  };
