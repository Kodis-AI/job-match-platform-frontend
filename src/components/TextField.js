import { useId, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';

import { makeStyles, useTheme } from '../theme';
import { Icon } from './Icon';

/**
 * Campo de texto del sistema de diseño.
 * - Etiqueta siempre visible (nunca solo placeholder).
 * - Anillo de foco con el token `ring` y error en línea anunciado a lectores de pantalla.
 * - `secure` añade el botón mostrar/ocultar contraseña.
 * - `ref` se reenvía al TextInput para mover el foco entre campos.
 */
export function TextField({
  ref,
  label,
  value,
  onChangeText,
  onBlur,
  onFocus,
  error,
  helper,
  icon,
  secure = false,
  disabled = false,
  style,
  ...inputProps
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const id = useId();
  const messageId = `${id}-message`;
  const message = error || helper;

  const borderColor = error ? colors.destructive : focused ? colors.ring : colors.inputBorder;

  return (
    <View style={[styles.field, style]}>
      <Text nativeID={`${id}-label`} style={styles.label}>
        {label}
      </Text>
      <View
        style={[
          styles.control,
          { borderColor },
          (focused || error) && styles.controlEmphasis,
          disabled && styles.controlDisabled,
        ]}
      >
        {icon ? (
          <Icon
            name={icon}
            size="md"
            color={focused ? colors.primary : colors.mutedForeground}
            style={styles.leadingIcon}
          />
        ) : null}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          secureTextEntry={secure && !revealed}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          accessibilityLabel={label}
          accessibilityLabelledBy={`${id}-label`}
          aria-invalid={Boolean(error)}
          aria-describedby={message ? messageId : undefined}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={styles.input}
          {...inputProps}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            accessibilityState={{ checked: revealed }}
            onPress={() => setRevealed((current) => !current)}
            hitSlop={4}
            style={({ pressed }) => [styles.reveal, pressed && styles.pressed]}
          >
            <Icon name={revealed ? 'eye-off' : 'eye'} size="md" color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
      {message ? (
        <View
          nativeID={messageId}
          style={styles.messageRow}
          accessibilityLiveRegion={error ? 'polite' : 'none'}
          aria-live={error ? 'polite' : undefined}
        >
          {error ? <Icon name="circle-alert" size="sm" color={colors.destructive} /> : null}
          <Text style={[styles.message, error && styles.messageError]}>{message}</Text>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  field: { gap: t.spacing.xs },
  label: { ...t.typography.bodyStrong, color: t.colors.foreground },
  control: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: t.radii.sm,
    backgroundColor: t.colors.card,
    paddingLeft: t.spacing.md,
    transitionProperty: 'border-color, box-shadow',
    transitionDuration: `${t.motion.base}ms`,
  },
  // Borde de 2px simulado con sombra para no desplazar el contenido al enfocar.
  controlEmphasis: Platform.select({
    web: { boxShadow: `0 0 0 1px ${t.colors.ring}` },
    default: { borderWidth: 2, paddingLeft: t.spacing.md - 1 },
  }),
  controlDisabled: { opacity: 0.6 },
  leadingIcon: { marginRight: t.spacing.sm },
  input: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
    ...t.typography.body,
    color: t.colors.foreground,
    paddingVertical: t.spacing.sm,
    paddingRight: t.spacing.md,
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  reveal: {
    width: t.touch.min,
    height: t.touch.min,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.spacing.xxs,
    borderRadius: t.radii.sm,
    cursor: 'pointer',
  },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.xxs },
  message: { ...t.typography.caption, color: t.colors.mutedForeground, flex: 1 },
  messageError: { color: t.colors.destructiveText },
  pressed: { opacity: 0.82 },
}));
