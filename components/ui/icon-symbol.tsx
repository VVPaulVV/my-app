

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;


const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',

  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'map': 'map',
  'map.fill': 'map',
  'tram.fill': 'tram',
  'bus.fill': 'directions-bus',
  'info.circle': 'info',
  'info.circle.fill': 'info',
  'phone.fill': 'phone',
  'globe': 'public',
  'arrow.up.right': 'arrow-outward',
  'arrow.left': 'arrow-back',
  'book.fill': 'book',
  'star.fill': 'star',
  'fork.knife': 'restaurant',
  'building.columns.fill': 'museum',
  'figure.walk': 'directions-walk',
  'camera.fill': 'camera-alt',
  'lightbulb.fill': 'lightbulb',
  'airplane': 'flight',
  'person.3.fill': 'groups',
  'heart': 'favorite-border',
  'heart.fill': 'favorite',
  'building.2': 'business',
  'building.2.fill': 'business',
  'sparkles': 'auto-awesome',
  'mappin.and.ellipse': 'place',
  'suit.heart.fill': 'favorite',
  'checkmark.circle.fill': 'check-circle',
  'circle': 'radio-button-unchecked',

  'line.3.horizontal': 'menu',
  'location.north.circle': 'explore',
  'magnifyingglass': 'search',
  'square.stack.3d.up': 'layers',
  'safari': 'explore',
  'trash.fill': 'delete',
  'list.bullet.rectangle.portrait.fill': 'list',
  'plus': 'add',
  'checkmark': 'check',
  'ferry.fill': 'directions-boat',
} as IconMapping;



export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
