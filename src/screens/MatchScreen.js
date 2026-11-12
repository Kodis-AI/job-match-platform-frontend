import { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import {
  Badge,
  Button,
  Chip,
  Icon,
  Overline,
  Recommendation,
  ScoreCard,
  SectionHeading,
  StepTitle,
  Suggestion,
} from '../components';
import { WorkspaceModeSwitcher } from '../components/RecruiterPage';
import { makeStyles, useTheme } from '../theme';
import { useWorkspaceLayout } from '../theme/useWorkspaceLayout';
import { comingSoon } from '../utils/notify';

const JOB_SAMPLES = [
  {
    title: 'Senior Software Engineer - FinTech Latam',
    description:
      'Vacante: Senior Software Engineer (FinTech)\nEmpresa Confidencial · Remoto\n\nBuscamos un Ingeniero de Software Senior con sólida experiencia en arquitecturas de backend distribuidas. Requisitos esenciales: Dominio profundo de Go o Node.js, Kubernetes para orquestación, CI/CD y bases de datos relacionales. Se valorará experiencia en FinTech y arquitectura hexagonal.',
  },
  {
    title: 'Machine Learning Specialist',
    description:
      'Vacante: Machine Learning Specialist\nEmpresa de tecnología · Híbrido\n\nBuscamos experiencia en Python, machine learning, diseño de modelos predictivos y despliegue de soluciones de IA en producción.',
  },
];

const SCORES = [
  {
    title: 'Habilidades técnicas',
    score: 88,
    icon: 'cpu',
    tone: 'primary',
    detail: 'Fuerte coincidencia en Backend, AWS y bases de datos relacionales.',
  },
  {
    title: 'Experiencia y seniority',
    score: 80,
    icon: 'trending-up',
    tone: 'success',
    detail: 'Cumples los 5+ años exigidos; perfil alineado a nivel Staff / Senior.',
  },
  {
    title: 'Palabras clave ATS',
    score: 92,
    icon: 'scan-search',
    tone: 'accent',
    detail: 'Densidad léxica óptima sin detección de sobrecarga artificial.',
  },
  {
    title: 'Formación y certificaciones',
    score: 75,
    icon: 'graduation-cap',
    tone: 'warning',
    detail: 'Grado validado; falta certificación Kubernetes formal.',
  },
];

const MISSING_KEYWORDS = ['Kubernetes', 'CI/CD pipelines', 'Arquitectura hexagonal'];

export default function MatchScreen() {
  const styles = useStyles();
  const { colors, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const { isCompact, contentWidth } = useWorkspaceLayout();
  const isWide = contentWidth >= layout.breakpoints.wide;
  const isResultsWide = contentWidth >= 640;

  const scrollRef = useRef(null);
  const formY = useRef(0);
  const resultsY = useRef(0);
  const [jobDescription, setJobDescription] = useState(JOB_SAMPLES[0].description);
  const [activeSample, setActiveSample] = useState(null);

  const scrollTo = (position) => {
    scrollRef.current?.scrollTo({ y: position.current, animated: true });
  };

  const selectSample = (sample) => {
    setActiveSample(sample.title);
    setJobDescription(sample.description);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="auto" />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Encabezado */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={[styles.headerInner, !isWide && styles.headerInnerCompact]}>
            <View style={styles.brandGroup}>
              <View style={styles.brandMark} aria-hidden accessibilityElementsHidden>
                <Text style={styles.brandMarkText}>M</Text>
              </View>
              <Text style={styles.brandName} accessibilityRole="header">
                MatchAI
              </Text>
              {!isCompact && (
                <Badge
                  label="Copiloto de carrera con IA"
                  tone="success"
                  icon="circle-check"
                  style={styles.headerBadge}
                />
              )}
            </View>
            <WorkspaceModeSwitcher compact={isCompact} />
            <View style={styles.headerActions}>
              {!isCompact && (
                <Button label="Cómo funciona" variant="ghost" onPress={() => scrollTo(formY)} />
              )}
            </View>
          </View>
        </View>

        <View style={[styles.content, isCompact && styles.contentCompact]}>
          {/* Hero */}
          <View style={styles.hero}>
            <Badge
              label="Análisis semántico ATS y perfil"
              tone="info"
              icon="sparkles"
              style={styles.heroBadge}
            />
            <Text
              accessibilityRole="header"
              style={[styles.heroTitle, isCompact && styles.heroTitleCompact]}
            >
              Copiloto de Compatibilidad Laboral
            </Text>
            <Text style={styles.heroDescription}>
              Sube tu currículum y la descripción de la vacante. Nuestro asistente analizará el
              encaje semántico y te dirá exactamente cómo optimizarlo antes de postular.
            </Text>
          </View>

          {/* Formulario */}
          <View
            onLayout={(event) => {
              formY.current = event.nativeEvent.layout.y;
            }}
            style={[styles.inputGrid, isWide && styles.inputGridWide]}
          >
            <View style={styles.inputColumn}>
              <StepTitle step="1" title="Tu currículum" detail="PDF · DOCX · TXT" />
              <View style={styles.panel}>
                <View style={styles.fileCard}>
                  <View style={styles.fileIcon}>
                    <Icon name="file-text" size="lg" color={colors.onPrimarySoft} />
                  </View>
                  <View style={styles.fileDetails}>
                    <Text numberOfLines={1} style={styles.fileName}>
                      CV_Carlos_Mendoza_2025.pdf
                    </Text>
                    <Text style={styles.fileMeta}>248 KB · Actualizado hace 2 días</Text>
                  </View>
                  <Badge label="Listo" tone="success" icon="check" />
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Subir una nueva versión del currículum"
                  accessibilityHint="Abre el selector de archivos"
                  onPress={() => comingSoon('Subir currículum')}
                  style={({ pressed }) => [styles.uploadArea, pressed && styles.pressed]}
                >
                  <View style={styles.uploadIcon}>
                    <Icon name="upload" size="md" color={colors.secondaryText} />
                  </View>
                  <Text style={styles.uploadTitle}>
                    Arrastra una nueva versión o explora tus archivos
                  </Text>
                  <Text style={styles.uploadHint}>Compatible con formatos estructurados ATS</Text>
                </Pressable>

                <View style={styles.excerptHeader}>
                  <Text style={styles.excerptTitle}>Extracto reconocido por IA</Text>
                  <Badge label="7 secciones procesadas" tone="success" icon="check" />
                </View>
                <Text style={styles.excerpt}>
                  “Ingeniero de Software Senior con 6+ años liderando desarrollo Backend en
                  arquitecturas de microservicios distribuidas sobre AWS, Docker y bases de datos
                  transaccionales...”
                </Text>
              </View>
            </View>

            <View style={styles.inputColumn}>
              <StepTitle step="2" title="La oferta de empleo" detail="Texto o enlace" />
              <View style={[styles.panel, styles.jobPanel]}>
                <Text style={styles.fieldLabel}>Ejemplos rápidos</Text>
                <View style={styles.sampleRow}>
                  {JOB_SAMPLES.map((sample) => (
                    <Chip
                      key={sample.title}
                      label={sample.title}
                      selected={activeSample === sample.title}
                      onPress={() => selectSample(sample)}
                    />
                  ))}
                </View>
                <Text nativeID="jobDescriptionLabel" style={styles.fieldLabel}>
                  Descripción de la vacante
                </Text>
                <TextInput
                  accessibilityLabel="Descripción de la vacante"
                  accessibilityLabelledBy="jobDescriptionLabel"
                  multiline
                  onChangeText={(text) => {
                    setJobDescription(text);
                    setActiveSample(null);
                  }}
                  placeholder="Pega aquí la descripción de la vacante..."
                  placeholderTextColor={colors.placeholder}
                  style={styles.jobInput}
                  textAlignVertical="top"
                  value={jobDescription}
                />
                <View style={styles.jobInputFooter}>
                  <Button
                    label="Pegar enlace"
                    variant="ghost"
                    iconLeft="link"
                    onPress={() => comingSoon('Pegar enlace')}
                    style={styles.linkButton}
                  />
                  <Text style={styles.characterCount}>{jobDescription.length} caracteres</Text>
                </View>
              </View>
            </View>
          </View>

          <Button
            label="Evaluar compatibilidad con IA"
            variant="accent"
            size="lg"
            iconLeft="sparkles"
            iconRight="arrow-right"
            onPress={() => scrollTo(resultsY)}
            style={styles.evaluateButton}
          />
          <Text style={styles.evaluateCaption}>
            Comparación en tiempo real · 48 factores de correlación analizados
          </Text>

          {/* Resultados */}
          <View
            onLayout={(event) => {
              resultsY.current = event.nativeEvent.layout.y;
            }}
            style={styles.results}
          >
            <View style={styles.resultBanner} accessibilityRole="summary">
              <View style={styles.resultBannerIcon}>
                <Icon name="circle-check" size="lg" color={colors.success} />
              </View>
              <View style={styles.flexOne}>
                <Text style={styles.resultBannerTitle}>Alta probabilidad de entrevista</Text>
                <Text style={styles.resultBannerText}>
                  Tu perfil presenta un alineamiento excepcional con los requerimientos centrales
                  del puesto.
                </Text>
              </View>
            </View>

            <SectionHeading
              overline="Resumen de compatibilidad"
              title="Diagnóstico integral de ajuste profesional"
              stacked={isCompact}
            >
              <View style={styles.actionsRow}>
                <Button
                  label="Compartir"
                  variant="outline"
                  iconLeft="share-2"
                  onPress={() => comingSoon('Compartir informe')}
                />
                <Button
                  label="Descargar informe"
                  variant="soft"
                  iconLeft="download"
                  onPress={() => comingSoon('Descargar informe')}
                />
              </View>
            </SectionHeading>

            <View style={[styles.scoresGrid, isResultsWide && styles.scoresGridWide]}>
              <View
                accessible
                accessibilityLabel="Match general: 84 por ciento. Superas el umbral de corte automático ATS del 75 por ciento."
                style={[styles.overallCard, isResultsWide && styles.overallCardWide]}
              >
                <View
                  style={[
                    styles.overallRing,
                    { width: Math.min(200, Math.max(140, contentWidth - 80)) },
                  ]}
                >
                  <Svg width="100%" height="100%" viewBox="0 0 100 100">
                    <Circle
                      cx="50"
                      cy="50"
                      r="43"
                      fill="none"
                      stroke={colors.borderSubtle}
                      strokeWidth="7"
                    />
                    <Circle
                      cx="50"
                      cy="50"
                      r="43"
                      fill="none"
                      stroke={colors.primary}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 43} ${2 * Math.PI * 43}`}
                      strokeDashoffset={2 * Math.PI * 43 * 0.16}
                      transform="rotate(-90 50 50)"
                    />
                  </Svg>
                  <View style={styles.overallRingCenter}>
                    <Text style={styles.overallScore}>84%</Text>
                    <Overline style={styles.overallLabel}>Match general</Overline>
                  </View>
                </View>
                <Text style={styles.overallText}>
                  Superas el umbral de corte automático ATS (75%) para la ronda de preselección
                  técnica.
                </Text>
              </View>

              <View
                style={[
                  styles.metricGrid,
                  isResultsWide && styles.metricGridWide,
                  isCompact && styles.metricGridCompact,
                ]}
              >
                {SCORES.map((item) => (
                  <ScoreCard key={item.title} {...item} stacked={isCompact} />
                ))}
              </View>
            </View>

            <SectionHeading
              overline="Próximos pasos"
              title="Plan de optimización recomendado"
              description="Acciones concretas y directas para elevar tu encaje del 84% al 96%."
              stacked={isCompact}
            >
              <Button
                label="Copiar sugerencias"
                variant="outline"
                iconLeft="copy"
                onPress={() => comingSoon('Copiar sugerencias')}
              />
            </SectionHeading>

            <Recommendation
              icon="search"
              title="Palabras clave faltantes"
              description="La vacante menciona explícitamente 3 metodologías y herramientas que aún no figuran de forma idéntica en tu currículum:"
            >
              <View style={styles.keywordRow}>
                {MISSING_KEYWORDS.map((keyword) => (
                  <View key={keyword} style={styles.keyword}>
                    <Text style={styles.keywordText}>{keyword}</Text>
                    <Badge label="Ausente" tone="warning" icon="circle-alert" />
                  </View>
                ))}
              </View>
              <Suggestion>
                Añádelas en la sección técnica o en el desglose de tu último empleo.
              </Suggestion>
            </Recommendation>

            <Recommendation
              icon="trending-up"
              title="Impacto de métricas"
              description="Las descripciones de tus logros son cualitativas. Los reclutadores técnicos priorizan métricas de rendimiento cuantificables."
            >
              <View style={[styles.quoteGrid, isWide && styles.quoteGridWide]}>
                <View style={styles.quoteBox}>
                  <Overline style={styles.quoteLabel}>Actualmente dice</Overline>
                  <Text style={styles.quoteText}>
                    “Mejora sustancial en la velocidad de la base de datos...”
                  </Text>
                </View>
                <View style={[styles.quoteBox, styles.quoteBoxSuggested]}>
                  <Overline>Formato recomendado</Overline>
                  <Text style={styles.quoteTextSuggested}>
                    “Reducción de latencia p99 en 34% mediante particionamiento y caché Redis...”
                  </Text>
                </View>
              </View>
              <Suggestion>
                Incluye volumen de transacciones por segundo o tamaño de equipo liderado.
              </Suggestion>
            </Recommendation>

            <Recommendation
              icon="award"
              title="Ajuste de titular y perfil"
              description="Tu extracto principal actual es muy genérico. Conéctalo directamente con el dominio financiero y nubes escalables de la vacante."
            >
              <View style={[styles.quoteBox, styles.quoteBoxSuggested, styles.headline]}>
                <Overline>Propuesta de titular</Overline>
                <Text style={styles.quoteTextSuggested}>
                  “Senior Backend Engineer | Cloud Distributed Systems (AWS & K8s) | FinTech &
                  High-Throughput Architectures”
                </Text>
              </View>
              <Suggestion>
                Refleja las primeras 3 líneas del perfil para superar el escáner inicial de 6
                segundos.
              </Suggestion>
            </Recommendation>
          </View>

          {/* CTA final */}
          <View style={[styles.cta, !isWide && styles.ctaStacked]}>
            <View style={styles.ctaIcon}>
              <Icon name="sparkles" size="lg" color={colors.onPrimary} />
            </View>
            <View style={styles.ctaCopy}>
              <Text style={styles.ctaTitle}>
                ¿Deseas que reescriba tu CV adaptado automáticamente?
              </Text>
              <Text style={styles.ctaText}>
                El asistente puede generar una versión lista para descargar con las palabras clave
                ya integradas.
              </Text>
            </View>
            <Button
              label="Generar CV optimizado"
              variant="accent"
              iconRight="arrow-right"
              onPress={() => comingSoon('Generar CV optimizado')}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              MatchAI · Inteligencia analítica para el posicionamiento profesional
            </Text>
            <View style={styles.footerPrivacy}>
              <Icon name="shield-check" size="sm" color={colors.success} />
              <Text style={styles.footerPrivacyText}>
                Privacidad y confidencialidad garantizadas
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => {
  const { colors, spacing, radii, typography, layout } = t;
  return {
    screen: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1 },
    flexOne: { flex: 1 },
    pressed: { opacity: 0.82 },

    // Encabezado
    header: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerInner: {
      width: '100%',
      maxWidth: 1360,
      minHeight: 68,
      alignSelf: 'center',
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    headerInnerCompact: {
      minHeight: 60,
      paddingHorizontal: spacing.md,
      flexWrap: 'wrap',
    },
    brandGroup: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
    brandMark: {
      width: 36,
      height: 36,
      borderRadius: radii.sm,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.xs,
    },
    brandMarkText: { ...typography.title, color: colors.onPrimary },
    brandName: { ...typography.title, color: colors.foreground },
    headerBadge: { marginLeft: spacing.md, alignSelf: 'center' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },

    // Contenido
    content: {
      width: '100%',
      maxWidth: 1360,
      alignSelf: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
    },
    contentCompact: { paddingHorizontal: spacing.md, paddingTop: spacing.md },

    // Hero
    hero: {
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xl,
      marginBottom: spacing.lg,
    },
    heroBadge: { alignSelf: 'center', marginBottom: spacing.md },
    heroTitle: {
      ...typography.h1,
      color: colors.foreground,
      textAlign: 'center',
      maxWidth: layout.readableWidth,
      marginBottom: spacing.sm,
    },
    heroTitleCompact: { ...typography.h1Compact },
    heroDescription: {
      ...typography.body,
      color: colors.mutedForeground,
      textAlign: 'center',
      maxWidth: 640,
    },

    // Formulario
    inputGrid: { gap: spacing.lg },
    inputGridWide: { flexDirection: 'row', alignItems: 'stretch' },
    inputColumn: { flex: 1, minWidth: 0 },
    panel: {
      flex: 1,
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radii.lg,
      padding: spacing.md,
      ...t.shadows.sm,
    },
    fileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.sm,
      backgroundColor: colors.background,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      marginBottom: spacing.sm,
    },
    fileIcon: {
      width: 44,
      height: 44,
      borderRadius: radii.sm,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fileDetails: { flex: 1, minWidth: 0 },
    fileName: { ...typography.bodyStrong, color: colors.foreground },
    fileMeta: { ...typography.caption, color: colors.mutedForeground },
    uploadArea: {
      borderStyle: 'dashed',
      borderColor: colors.secondaryBorder,
      borderWidth: 1.5,
      borderRadius: radii.md,
      backgroundColor: colors.secondarySoft,
      alignItems: 'center',
      padding: spacing.md,
      marginBottom: spacing.md,
      cursor: 'pointer',
    },
    uploadIcon: {
      width: 40,
      height: 40,
      borderRadius: radii.full,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    uploadTitle: { ...typography.bodyStrong, color: colors.secondaryText, textAlign: 'center' },
    uploadHint: {
      ...typography.caption,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: spacing.xxs,
    },
    excerptHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    excerptTitle: { ...typography.bodyStrong, color: colors.foreground },
    excerpt: {
      ...typography.bodySm,
      color: colors.mutedForeground,
      backgroundColor: colors.muted,
      borderRadius: radii.sm,
      padding: spacing.sm,
    },
    jobPanel: { minHeight: 360 },
    fieldLabel: {
      ...typography.captionStrong,
      color: colors.foreground,
      marginBottom: spacing.xs,
    },
    sampleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
    jobInput: {
      ...typography.bodySm,
      flex: 1,
      minHeight: 200,
      color: colors.foreground,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: radii.md,
      backgroundColor: colors.card,
    },
    jobInputFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    linkButton: { paddingHorizontal: spacing.xs, marginLeft: -spacing.xs },
    characterCount: { ...typography.caption, color: colors.mutedForeground },

    evaluateButton: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: 480,
      marginTop: spacing.lg,
      ...t.shadows.md,
    },
    evaluateCaption: {
      ...typography.caption,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: spacing.xs,
      marginBottom: spacing.xl,
    },

    // Resultados
    results: { gap: spacing.lg },
    resultBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.successSoft,
      borderColor: colors.successBorder,
      borderWidth: 1,
      borderRadius: radii.lg,
      padding: spacing.md,
    },
    resultBannerIcon: {
      width: 44,
      height: 44,
      borderRadius: radii.full,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultBannerTitle: { ...typography.subtitle, color: colors.success },
    resultBannerText: { ...typography.bodySm, color: colors.foreground },
    actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },

    scoresGrid: { gap: spacing.md },
    scoresGridWide: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.md },
    overallCard: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.lg,
      padding: spacing.lg,
    },
    overallCardWide: { flexBasis: '38%', flexShrink: 0, minWidth: 0 },
    overallRing: { aspectRatio: 1, position: 'relative' },
    overallRingCenter: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    overallLabel: { color: colors.mutedForeground, fontSize: 9 },
    overallScore: { ...typography.h2, color: colors.primary, lineHeight: 30 },
    percent: { ...typography.h2, color: colors.primary },
    overallText: {
      ...typography.caption,
      color: colors.foreground,
      textAlign: 'center',
      maxWidth: 260,
    },
    metricGrid: { gap: spacing.sm },
    metricGridWide: { flex: 1, minWidth: 0, justifyContent: 'space-between' },
    metricGridCompact: { flexDirection: 'column', flexWrap: 'nowrap', alignItems: 'stretch' },

    keywordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
    keyword: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radii.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    keywordText: { ...typography.bodyStrong, color: colors.foreground },
    quoteGrid: { gap: spacing.sm, marginBottom: spacing.md },
    quoteGridWide: { flexDirection: 'row' },
    quoteBox: {
      flex: 1,
      minWidth: 0,
      backgroundColor: colors.background,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    quoteBoxSuggested: { backgroundColor: colors.secondarySoft, borderColor: colors.secondaryBorder },
    quoteLabel: { color: colors.mutedForeground },
    quoteText: { ...typography.bodySm, color: colors.mutedForeground, flexShrink: 1 },
    quoteTextSuggested: { ...typography.bodyStrong, color: colors.foreground, flexShrink: 1 },
    headline: {
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: 'auto',
      alignSelf: 'stretch',
      marginBottom: spacing.md,
    },

    // CTA final
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radii.lg,
      padding: spacing.lg,
      marginTop: spacing.xl,
      ...t.shadows.sm,
    },
    ctaStacked: { flexDirection: 'column', alignItems: 'stretch' },
    ctaIcon: {
      width: 48,
      height: 48,
      borderRadius: radii.md,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaCopy: { flex: 1, minWidth: 0 },
    ctaTitle: { ...typography.title, color: colors.foreground, marginBottom: spacing.xxs },
    ctaText: { ...typography.bodySm, color: colors.mutedForeground },

    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.lg,
      paddingTop: spacing.md,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    footerText: { ...typography.caption, color: colors.mutedForeground },
    footerPrivacy: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
    footerPrivacyText: { ...typography.captionStrong, color: colors.success },
  };
});
