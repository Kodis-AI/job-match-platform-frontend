import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';

import { Button, FormAlert, TextField } from '../../components';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthLink } from '../../components/auth/AuthLink';
import { useAuth } from '../../context/AuthContext';
import {
  DEMO_CREDENTIALS,
  getAuthErrorMessage,
  isMockAuth,
  validateEmail,
  validatePassword,
} from '../../lib/auth';
import { resolveRedirect } from '../../lib/auth/redirect';
import { makeStyles } from '../../theme';
import { comingSoon } from '../../utils/notify';

const validators = {
  email: validateEmail,
  password: (value) => validatePassword(value, { strict: false }),
};

export default function SignInScreen() {
  const styles = useStyles();
  const { isAuthenticated, signIn } = useAuth();
  const params = useLocalSearchParams();
  const target = resolveRedirect(params.redirect);

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
    setErrors((current) => ({ ...current, [field]: validators[field](values[field]) }));
  };

  const submit = async () => {
    const nextErrors = {
      email: validators.email(values.email),
      password: validators.password(values.password),
    };
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors).find((field) => nextErrors[field]);
    if (firstInvalid) {
      const refs = { email: emailRef, password: passwordRef };
      refs[firstInvalid].current?.focus();
      return;
    }

    setSubmitting(true);
    setServerError(null);
    const { error } = await signIn({
      email: values.email.trim(),
      password: values.password,
    });
    setSubmitting(false);

    if (error) {
      setServerError(getAuthErrorMessage(error));
    }
    // Con éxito, la sesión cambia y <Redirect> lleva a `target`.
  };

  const fillDemo = () => {
    setValues({ ...DEMO_CREDENTIALS });
    setErrors({});
    setServerError(null);
  };

  return (
    <AuthLayout
      overline="PORTAL RECLUTADOR"
      title="Inicia sesión"
      description="Accede a tus vacantes, al ranking de candidatos y al análisis de compatibilidad."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>¿Aún no tienes cuenta?</Text>
          <AuthLink
            label="Crear cuenta"
            onPress={() =>
              router.push({ pathname: '/sign-up', params: params.redirect ? { redirect: params.redirect } : {} })
            }
          />
        </View>
      }
    >
      {isMockAuth ? (
        <FormAlert
          tone="info"
          title="Modo demo"
          message={`Usa ${DEMO_CREDENTIALS.email} · ${DEMO_CREDENTIALS.password} o crea una cuenta nueva.`}
        >
          <AuthLink label="Rellenar con la cuenta demo" onPress={fillDemo} style={styles.demoLink} />
        </FormAlert>
      ) : null}

      {serverError ? (
        <FormAlert tone="error" title="No pudimos iniciar sesión" message={serverError} />
      ) : null}

      <View style={styles.fields}>
        <TextField
          ref={emailRef}
          label="Correo electrónico"
          icon="mail"
          placeholder="nombre@empresa.com"
          value={values.email}
          onChangeText={update('email')}
          onBlur={() => values.email && validateField('email')}
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
            placeholder="Tu contraseña"
            value={values.password}
            onChangeText={update('password')}
            error={errors.password}
            secure
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
          />
          <AuthLink
            label="¿Olvidaste tu contraseña?"
            onPress={() => comingSoon('Recuperar contraseña')}
            style={styles.forgot}
          />
        </View>
      </View>

      <Button
        label={submitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
        variant="accent"
        size="lg"
        iconRight={submitting ? undefined : 'arrow-right'}
        fullWidth
        loading={submitting}
        onPress={submit}
      />

      <View style={styles.divider} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button
        label="Soy candidato · continuar sin cuenta"
        variant="outline"
        size="lg"
        iconLeft="user-round"
        fullWidth
        accessibilityHint="Abre el panel del candidato, no requiere cuenta"
        onPress={() => router.replace('/match')}
      />
    </AuthLayout>
  );
}

const useStyles = makeStyles((t) => ({
  fields: { gap: t.spacing.md },
  passwordGroup: { gap: t.spacing.xxs },
  forgot: { alignSelf: 'flex-end' },
  demoLink: { alignSelf: 'flex-start', marginLeft: -t.spacing.xxs },
  divider: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: t.colors.border },
  dividerText: { ...t.typography.caption, color: t.colors.mutedForeground },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: t.spacing.xxs,
  },
  footerText: { ...t.typography.bodySm, color: t.colors.mutedForeground },
}));
