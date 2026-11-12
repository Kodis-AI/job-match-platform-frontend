import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';

import { Button, FormAlert, Icon, TextField } from '../../components';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthLink } from '../../components/auth/AuthLink';
import { useAuth } from '../../context/AuthContext';
import {
  PASSWORD_RULES,
  getAuthErrorMessage,
  validateEmail,
  validateName,
  validatePassword,
} from '../../lib/auth';
import { resolveRedirect } from '../../lib/auth/redirect';
import { makeStyles, useTheme } from '../../theme';

const FIELDS = ['name', 'email', 'password'];
const validators = {
  name: validateName,
  email: validateEmail,
  password: (value) => validatePassword(value),
};

export default function SignUpScreen() {
  const styles = useStyles();
  const { isAuthenticated, signUp } = useAuth();
  const params = useLocalSearchParams();
  const target = resolveRedirect(params.redirect);

  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  if (isAuthenticated) {
    return <Redirect href={target} />;
  }

  const update = (field) => (text) => {
    setValues((current) => ({ ...current, [field]: text }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: null }));
    if (serverError) setServerError(null);
  };

  const validateField = (field) => {
    if (!values[field]) return;
    setErrors((current) => ({ ...current, [field]: validators[field](values[field]) }));
  };

  const submit = async () => {
    const nextErrors = Object.fromEntries(
      FIELDS.map((field) => [field, validators[field](values[field])]),
    );
    setErrors(nextErrors);
    const firstInvalid = FIELDS.find((field) => nextErrors[field]);
    if (firstInvalid) {
      const refs = { name: nameRef, email: emailRef, password: passwordRef };
      refs[firstInvalid].current?.focus();
      return;
    }

    setSubmitting(true);
    setServerError(null);
    const { error } = await signUp({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    });
    setSubmitting(false);

    if (error) {
      setServerError(getAuthErrorMessage(error));
    }
    // Better Auth inicia sesión tras el registro; <Redirect> lleva a `target`.
  };

  return (
    <AuthLayout
      overline="PORTAL RECLUTADOR"
      title="Crea tu cuenta"
      description="Publica vacantes y evalúa candidatos con IA en pocos minutos."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
          <AuthLink
            label="Inicia sesión"
            onPress={() =>
              router.replace({ pathname: '/sign-in', params: params.redirect ? { redirect: params.redirect } : {} })
            }
          />
        </View>
      }
    >
      {serverError ? (
        <FormAlert tone="error" title="No pudimos crear la cuenta" message={serverError} />
      ) : null}

      <View style={styles.fields}>
        <TextField
          ref={nameRef}
          label="Nombre completo"
          icon="user-round"
          placeholder="Ej. Laura Méndez"
          value={values.name}
          onChangeText={update('name')}
          onBlur={() => validateField('name')}
          error={errors.name}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextField
          ref={emailRef}
          label="Correo de trabajo"
          icon="mail"
          placeholder="nombre@empresa.com"
          value={values.email}
          onChangeText={update('email')}
          onBlur={() => validateField('email')}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          inputMode="email"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <View style={styles.passwordGroup}>
          <TextField
            ref={passwordRef}
            label="Contraseña"
            icon="lock-keyhole"
            placeholder="Crea una contraseña segura"
            value={values.password}
            onChangeText={update('password')}
            onBlur={() => validateField('password')}
            error={errors.password}
            secure
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            passwordRules="minlength: 8; required: lower; required: digit;"
            returnKeyType="go"
            onSubmitEditing={submit}
          />
          <PasswordChecklist value={values.password} />
        </View>
      </View>

      <Button
        label={submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        variant="accent"
        size="lg"
        iconRight={submitting ? undefined : 'arrow-right'}
        fullWidth
        loading={submitting}
        onPress={submit}
      />

      <Text style={styles.legal}>
        Al crear una cuenta aceptas los términos de uso y la política de privacidad de
        TalentMatch AI.
      </Text>
    </AuthLayout>
  );
}

function PasswordChecklist({ value }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.checklist} accessibilityLabel="Requisitos de la contraseña">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <View
            key={rule.key}
            style={styles.rule}
            accessible
            accessibilityLabel={`${rule.label}: ${met ? 'cumplido' : 'pendiente'}`}
          >
            <Icon
              name={met ? 'circle-check' : 'circle'}
              size="sm"
              color={met ? colors.success : colors.mutedForeground}
            />
            <Text style={[styles.ruleText, met && styles.ruleTextMet]}>{rule.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  fields: { gap: t.spacing.md },
  passwordGroup: { gap: t.spacing.sm },
  checklist: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: t.spacing.md,
    rowGap: t.spacing.xxs,
  },
  rule: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.xxs },
  ruleText: { ...t.typography.caption, color: t.colors.mutedForeground },
  ruleTextMet: { color: t.colors.foreground },
  legal: { ...t.typography.caption, color: t.colors.mutedForeground, textAlign: 'center' },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: t.spacing.xxs,
  },
  footerText: { ...t.typography.bodySm, color: t.colors.mutedForeground },
}));
