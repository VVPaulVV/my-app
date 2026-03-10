import { Colors } from '@/constants/theme';
import { StyleSheet, Text, type TextProps, useColorScheme } from 'react-native';

export type ThemedTextProps = TextProps & {
  color?: string;
  variant?: 'heading' | 'body' | 'caption' | 'label';
  muted?: boolean;
};

const getFontFamily = (variant: string) => {
  switch (variant) {
    case 'heading': return 'CormorantGaramond_300Light';
    case 'body':
    case 'label': return 'Outfit_400Regular';
    case 'caption': return 'Outfit_200ExtraLight';
    default: return undefined;
  }
};

export function ThemedText({
  style,
  color,
  muted = false,
  variant = 'body',
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const textColor = color || (muted ? theme.textSecondary : theme.text);

  const variantStyles = styles[variant] || styles.body;

  return (
    <Text
      style={[
        { color: textColor, fontFamily: getFontFamily(variant) },
        variantStyles,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 0.01,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.08,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: 11,
    fontWeight: '200',
    letterSpacing: 0.03,
  },
});
