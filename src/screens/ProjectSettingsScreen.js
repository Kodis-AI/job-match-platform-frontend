import { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

import { Badge, Button, Icon, SectionHeading } from '../components';
import { RecruiterPage } from '../components/RecruiterPage';
import { makeStyles, useTheme } from '../theme';
import { useWorkspaceLayout } from '../theme/useWorkspaceLayout';
import { comingSoon } from '../utils/notify';

const INITIAL_WEIGHTS = {
  technical: 45,
  experience: 30,
  impact: 15,
  education: 10,
};

const WEIGHT_OPTIONS = [
  { key: 'technical', label: 'Hard Skills & Stack Técnico', color: 'secondary', required: true },
  { key: 'experience', label: 'Trayectoria y Relevancia', color: 'accent', required: false },
  { key: 'impact', label: 'Métricas STAR & Redacción', color: 'warning', required: false },
  { key: 'education', label: 'Formación & Certificaciones', color: 'mutedForeground', required: false },
];

const CUTOFFS = [85, 80, 75, 70];

const APPEARANCES = [
  { value: 'system', label: 'Sistema', description: 'Sigue la apariencia del dispositivo.', icon: 'monitor' },
  { value: 'light', label: 'Claro', description: 'Fondo claro durante toda la sesión.', icon: 'sun' },
  { value: 'dark', label: 'Oscuro', description: 'Fondo oscuro durante toda la sesión.', icon: 'moon' },
];

export default function ProjectSettingsScreen() {
  const styles = useStyles();
  const { appearance, setAppearance, colors } = useTheme();
  const { isWide } = useWorkspaceLayout();
  const [weights, setWeights] = useState(INITIAL_WEIGHTS);
  const [anonymous, setAnonymous] = useState(true);
  const [hideEducation, setHideEducation] = useState(true);
  const [cutoffIndex, setCutoffIndex] = useState(1);
  const [gapPolicy, setGapPolicy] = useState('neutral');

  const updateWeight = (key, value) => {
    const nextValue = Math.max(5, Math.min(85, Math.round(value)));
    const otherKeys = WEIGHT_OPTIONS.map((item) => item.key).filter((item) => item !== key);
    const otherTotal = 100 - nextValue;
    const currentOtherTotal = otherKeys.reduce((total, item) => total + weights[item], 0);
    let remaining = otherTotal;
    const nextWeights = { ...weights, [key]: nextValue };

    otherKeys.forEach((otherKey, index) => {
      const allocated =
        index === otherKeys.length - 1
          ? remaining
          : Math.floor((otherTotal * weights[otherKey]) / currentOtherTotal);
      nextWeights[otherKey] = allocated;
      remaining -= allocated;
    });

    setWeights(nextWeights);
  };

  const resetSettings = () => {
    setWeights(INITIAL_WEIGHTS);
    setAnonymous(true);
    setHideEducation(true);
    setCutoffIndex(1);
    setGapPolicy('neutral');
  };

  const applyTechnicalWeight = () => updateWeight('technical', 60);
  const cutoff = CUTOFFS[cutoffIndex];

  return (
    <RecruiterPage
      eyebrow="PARÁMETROS ALGORITMO IA"
      title="Configuración de vacante & calibración"
      description="Ajusta las ponderaciones del modelo NLP, los umbrales de compatibilidad y las políticas de anonimización."
      action={
        <View style={[styles.headerActions, !isWide && styles.headerActionsStacked]}>
          <Button
            label="Restablecer"
            variant="outline"
            iconLeft="rotate-ccw"
            onPress={resetSettings}
          />
          <Button
            label="Simular con 50 CVs"
            variant="outline"
            iconLeft="flask-conical"
            onPress={() => comingSoon('Simular calibración')}
          />
          <Button
            label="Guardar parámetros"
            iconLeft="badge-check"
            onPress={() => comingSoon('Guardar parámetros de IA')}
          />
        </View>
      }
    >
      <View style={styles.totalCard}>
        <View style={styles.totalIcon}>
          <Icon name="sliders-horizontal" size="md" color={colors.secondaryText} />
        </View>
        <View style={styles.totalCopy}>
          <Text style={styles.totalTitle}>Calibración adaptativa en tiempo real</Text>
          <Text style={styles.totalText}>
            Ajusta la relevancia técnica, la experiencia y las credenciales para esta vacante.
          </Text>
        </View>
        <View style={styles.totalValue}>
          <Text style={styles.totalLabel}>TOTAL PONDERADO</Text>
          <Text style={styles.totalNumber}>100%</Text>
        </View>
      </View>

      <View style={[styles.configGrid, isWide && styles.configGridWide]}>
        <View style={[styles.panel, isWide && styles.weightsPanel]}>
          <SectionHeading
            overline="RELEVANCIA DEL PERFIL"
            title="Ponderaciones del match"
          />
          <View style={styles.weightsList}>
            {WEIGHT_OPTIONS.map((option) => (
              <WeightSlider
                key={option.key}
                option={option}
                value={weights[option.key]}
                onChange={(value) => updateWeight(option.key, value)}
              />
            ))}
          </View>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeading}>
              <Text style={styles.balanceTitle}>Balance algorítmico calculado</Text>
              <Badge label="Equilibrado" tone="success" />
            </View>
            <View style={styles.balanceTrack}>
              {WEIGHT_OPTIONS.map((option) => (
                <View
                  key={option.key}
                  style={[
                    styles.balanceSegment,
                    {
                      flex: weights[option.key],
                      backgroundColor: colors[option.color],
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.balanceText}>
              Diagnóstico de sesgo: distribución técnica y experiencia balanceada para el perfil.
            </Text>
          </View>
        </View>

        <View style={[styles.panel, isWide && styles.biasPanel]}>
          <SectionHeading
            overline="CANDIDATURA JUSTA"
            title="Mitigación de sesgo"
          />
          <SwitchSetting
            icon="user-round-search"
            title="Anonimización integral"
            detail="Oculta nombre, foto, edad, género y ubicación antes de evaluar."
            value={anonymous}
            onValueChange={setAnonymous}
          />
          <SwitchSetting
            icon="school"
            title="Desindexación de prestigio"
            detail="Normaliza los centros educativos para que no influyan en el ranking."
            value={hideEducation}
            onValueChange={setHideEducation}
          />
          <View style={styles.policyCard}>
            <Text style={styles.policyTitle}>Corte para shortlist automático</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Umbral de selección ${cutoff} por ciento. Pulsa para cambiar.`}
              onPress={() => setCutoffIndex((index) => (index + 1) % CUTOFFS.length)}
              style={({ pressed }) => [styles.cutoffButton, pressed && styles.pressed]}
            >
              <Text style={styles.cutoffText}>Corte recomendado: {cutoff}% o superior</Text>
              <Icon name="chevron-down" size="sm" color={colors.mutedForeground} />
            </Pressable>
            <Text style={styles.helperText}>
              Los perfiles bajo el umbral quedan para revisión manual.
            </Text>
          </View>
          <View style={styles.policyCard}>
            <Text style={styles.policyTitle}>Política de brechas temporales</Text>
            {[
              {
                value: 'neutral',
                title: 'Tratamiento neutro · recomendado',
                detail: 'No penaliza pausas si el repositorio o stack se mantiene vigente.',
              },
              {
                value: 'strict',
                title: 'Penalizar discontinuidades',
                detail: 'Aplica una penalización por pausas laborales prolongadas.',
              },
            ].map((option) => {
              const selected = gapPolicy === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setGapPolicy(option.value)}
                  style={({ pressed }) => [styles.radioRow, pressed && styles.pressed]}
                >
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.radioCopy}>
                    <Text style={styles.radioTitle}>{option.title}</Text>
                    <Text style={styles.radioDetail}>{option.detail}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.sideColumn, isWide && styles.sideColumnWide]}>
          <View style={styles.panel}>
            <View style={styles.panelHeading}>
              <View style={styles.panelTitleGroup}>
                <Icon name="database" size="md" color={colors.secondaryText} />
                <Text style={styles.panelTitle}>Pipeline pgvector</Text>
              </View>
              <Badge label="Demo" tone="success" icon="circle-check" />
            </View>
            <DataRow label="Dimensión vector" value="1536 · Cosine" />
            <DataRow label="NER extractor" value="spaCy + LLM v2" />
            <DataRow label="Latencia / CV" value="18 ms · muestra" />
            <Text style={styles.pipelineNote}>
              La normalización agrupa sinónimos tecnológicos y extrae métricas para el análisis.
            </Text>
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeading}>
              <View style={styles.panelTitleGroup}>
                <Icon name="chart-no-axes-combined" size="md" color={colors.success} />
                <Text style={styles.panelTitle}>Impacto de simulación</Text>
              </View>
              <Badge label="50 CVs test" tone="neutral" />
            </View>
            <Text style={styles.simulationCopy}>
              Vista previa ilustrativa con la ponderación técnica actual de{' '}
              <Text style={styles.highlight}>{weights.technical}%</Text>.
            </Text>
            <View style={styles.simulationMetrics}>
              <View style={styles.simulationMetric}>
                <Text style={styles.simulationLabel}>Candidatos top</Text>
                <Text style={styles.simulationValue}>+3</Text>
                <Text style={styles.simulationDetail}>perfiles cambian de posición</Text>
              </View>
              <View style={styles.simulationMetric}>
                <Text style={styles.simulationLabel}>Tasa de aprobación</Text>
                <Text style={styles.simulationValue}>24%</Text>
                <Text style={styles.simulationDetail}>12 de 50 en la muestra</Text>
              </View>
            </View>
            {[
              { name: 'Dev #4892 · Go / K8s', score: '94.8%' },
              { name: 'Dev #2104 · React / TS', score: '91.2%' },
              { name: 'Dev #9033 · Full Stack', score: '88.5%' },
            ].map((candidate, index) => (
              <View key={candidate.name} style={styles.rankingRow}>
                <View style={[styles.rankNumber, index === 0 && styles.rankNumberTop]}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <Text style={styles.rankingName}>{candidate.name}</Text>
                <Text style={styles.rankingScore}>{candidate.score}</Text>
              </View>
            ))}
            <Button
              label={`Aplicar ${weights.technical}% técnico`}
              variant="soft"
              iconLeft="zap"
              fullWidth
              onPress={applyTechnicalWeight}
            />
          </View>
        </View>
      </View>

      <View style={styles.appearanceSection}>
        <SectionHeading
          overline="PREFERENCIAS DE INTERFAZ"
          title="Tema de la aplicación"
          description="Se aplica inmediatamente en la app y no necesita backend."
        />
        <View style={[styles.appearanceGrid, isWide && styles.appearanceGridWide]}>
          {APPEARANCES.map((option) => {
            const selected = appearance === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityLabel={`${option.label}. ${option.description}`}
                accessibilityState={{ checked: selected }}
                onPress={() => setAppearance(option.value)}
                style={({ pressed }) => [
                  styles.appearanceCard,
                  selected && styles.appearanceCardSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
                  <Icon
                    name={option.icon}
                    size="md"
                    color={selected ? colors.onPrimary : undefined}
                  />
                </View>
                <View style={styles.appearanceCopy}>
                  <Text style={styles.appearanceTitle}>{option.label}</Text>
                  <Text style={styles.appearanceDescription}>{option.description}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.auditBar}>
        <Icon name="history" size="sm" color={colors.mutedForeground} />
        <Text style={styles.auditText}>
          Los parámetros son una vista previa local. Guardar y sincronizar se habilitarán cuando el backend esté en producción.
        </Text>
      </View>
    </RecruiterPage>
  );
}

function WeightSlider({ option, value, onChange }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);

  const updateFromPosition = (event) => {
    if (trackWidth === 0) return;
    const ratio = Math.max(0, Math.min(1, event.nativeEvent.locationX / trackWidth));
    onChange(5 + ratio * 80);
  };

  const handleAccessibilityAction = (event) => {
    if (event.nativeEvent.actionName === 'increment') onChange(value + 5);
    if (event.nativeEvent.actionName === 'decrement') onChange(value - 5);
  };

  return (
    <View style={styles.weightCard}>
      <View style={styles.weightHeading}>
        <View style={styles.weightTitleGroup}>
          <Icon name="grip-vertical" size="sm" color={colors.mutedForeground} />
          <Text style={styles.weightTitle}>{option.label}</Text>
          {option.required ? <Badge label="Obligatorio" tone="info" /> : null}
        </View>
        <Text style={styles.weightValue}>{value}%</Text>
      </View>
      <Pressable
        accessibilityRole="adjustable"
        accessibilityLabel={option.label}
        accessibilityValue={{ min: 5, max: 85, now: value }}
        accessibilityActions={[
          { name: 'increment', label: 'Aumentar ponderación' },
          { name: 'decrement', label: 'Reducir ponderación' },
        ]}
        onAccessibilityAction={handleAccessibilityAction}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        onPress={updateFromPosition}
        style={({ pressed }) => [styles.sliderTrack, pressed && styles.pressed]}
      >
        <View
          style={[
            styles.sliderFill,
            {
              width: `${((value - 5) / 80) * 100}%`,
              backgroundColor: colors[option.color],
            },
          ]}
        />
        <View
          style={[
            styles.sliderThumb,
            {
              left: `${((value - 5) / 80) * 100}%`,
              borderColor: colors[option.color],
            },
          ]}
        />
      </Pressable>
      <Text style={styles.weightHint}>
        {option.key === 'technical'
          ? 'TypeScript, React, Node.js, Go · PostgreSQL y Docker'
          : option.key === 'experience'
            ? 'Años en roles similares y relevancia de la trayectoria'
            : option.key === 'impact'
              ? 'Logros medibles, impacto y redacción del CV'
              : 'Formación académica y certificaciones verificables'}
      </Text>
    </View>
  );
}

function SwitchSetting({ icon, title, detail, value, onValueChange }) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.switchCard}>
      <View style={styles.switchHeading}>
        <View style={styles.switchIcon}>
          <Icon name={icon} size="md" color={colors.secondaryText} />
        </View>
        <Switch
          accessibilityLabel={title}
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      </View>
      <Text style={styles.switchTitle}>{title}</Text>
      <Text style={styles.switchDetail}>{detail}</Text>
    </View>
  );
}

function DataRow({ label, value }) {
  const styles = useStyles();

  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => {
  const { colors, radii, spacing, typography } = t;
  return {
    headerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    headerActionsStacked: { flexDirection: 'column', alignItems: 'stretch' },
    totalCard: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      marginBottom: spacing.md,
    },
    totalIcon: {
      width: 40,
      height: 40,
      borderRadius: radii.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
    },
    totalCopy: { flex: 1, minWidth: 180 },
    totalTitle: { ...typography.bodyStrong, color: colors.foreground },
    totalText: { ...typography.caption, color: colors.mutedForeground },
    totalValue: { alignItems: 'flex-end' },
    totalLabel: { ...typography.label, color: colors.mutedForeground, fontSize: 9 },
    totalNumber: { ...typography.title, color: colors.secondaryText },
    configGrid: { gap: spacing.md },
    configGridWide: { flexDirection: 'row', alignItems: 'flex-start' },
    panel: {
      minWidth: 0,
      padding: spacing.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      gap: spacing.sm,
    },
    weightsPanel: { flex: 1.15 },
    biasPanel: { flex: 0.9 },
    sideColumn: { gap: spacing.md },
    sideColumnWide: { flex: 0.82 },
    weightsList: { gap: spacing.sm },
    weightCard: {
      padding: spacing.sm,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.md,
      gap: spacing.xs,
    },
    weightHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    weightTitleGroup: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xxs },
    weightTitle: { ...typography.captionStrong, color: colors.foreground, flexShrink: 1 },
    weightValue: { ...typography.captionStrong, color: colors.secondaryText },
    sliderTrack: {
      height: 10,
      position: 'relative',
      justifyContent: 'center',
      borderRadius: radii.full,
      backgroundColor: colors.muted,
    },
    sliderFill: { height: '100%', borderRadius: radii.full },
    sliderThumb: {
      position: 'absolute',
      width: 16,
      height: 16,
      borderRadius: radii.full,
      borderWidth: 2,
      backgroundColor: colors.card,
      marginLeft: -8,
    },
    weightHint: { ...typography.caption, color: colors.mutedForeground },
    balanceCard: {
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      gap: spacing.xs,
    },
    balanceHeading: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    balanceTitle: { ...typography.captionStrong, color: colors.foreground },
    balanceTrack: { height: 8, flexDirection: 'row', overflow: 'hidden', borderRadius: radii.full },
    balanceSegment: { height: '100%' },
    balanceText: { ...typography.caption, color: colors.mutedForeground },
    switchCard: {
      padding: spacing.sm,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.md,
    },
    switchHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    switchIcon: {
      width: 32,
      height: 32,
      borderRadius: radii.sm,
      backgroundColor: colors.secondarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    switchTitle: { ...typography.captionStrong, color: colors.foreground },
    switchDetail: { ...typography.caption, color: colors.mutedForeground },
    policyCard: {
      gap: spacing.xs,
      padding: spacing.sm,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.md,
    },
    policyTitle: { ...typography.captionStrong, color: colors.foreground },
    cutoffButton: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.sm,
      backgroundColor: colors.card,
    },
    cutoffText: { ...typography.caption, color: colors.foreground, flex: 1 },
    helperText: { ...typography.caption, color: colors.mutedForeground },
    radioRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, paddingVertical: spacing.xxs },
    radio: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: radii.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: { borderColor: colors.secondary },
    radioDot: { width: 10, height: 10, borderRadius: radii.full, backgroundColor: colors.secondary },
    radioCopy: { flex: 1, gap: spacing.xxs },
    radioTitle: { ...typography.captionStrong, color: colors.foreground },
    radioDetail: { ...typography.caption, color: colors.mutedForeground },
    panelHeading: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
      paddingBottom: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    panelTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    panelTitle: { ...typography.bodyStrong, color: colors.foreground },
    dataRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
      padding: spacing.xs,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.sm,
    },
    dataLabel: { ...typography.caption, color: colors.mutedForeground },
    dataValue: { ...typography.captionStrong, color: colors.foreground },
    pipelineNote: {
      ...typography.caption,
      color: colors.mutedForeground,
      lineHeight: 18,
      padding: spacing.sm,
      backgroundColor: colors.background,
      borderRadius: radii.sm,
    },
    simulationCopy: { ...typography.caption, color: colors.mutedForeground },
    highlight: { ...typography.captionStrong, color: colors.secondaryText },
    simulationMetrics: { flexDirection: 'row', gap: spacing.xs },
    simulationMetric: {
      flex: 1,
      minWidth: 0,
      gap: spacing.xxs,
      padding: spacing.xs,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.sm,
    },
    simulationLabel: { ...typography.caption, color: colors.mutedForeground },
    simulationValue: { ...typography.h3, color: colors.secondaryText },
    simulationDetail: { ...typography.caption, color: colors.mutedForeground },
    rankingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      padding: spacing.xs,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.sm,
    },
    rankNumber: {
      width: 22,
      height: 22,
      borderRadius: radii.full,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rankNumberTop: { backgroundColor: colors.primarySoft },
    rankText: { ...typography.captionStrong, color: colors.foreground },
    rankingName: { ...typography.caption, color: colors.foreground, flex: 1 },
    rankingScore: { ...typography.captionStrong, color: colors.secondaryText },
    appearanceSection: { marginTop: spacing.xl },
    appearanceGrid: { gap: spacing.xs, marginTop: spacing.md },
    appearanceGridWide: { flexDirection: 'row' },
    appearanceCard: {
      flex: 1,
      minHeight: 68,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.sm,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
    },
    appearanceCardSelected: { borderWidth: 2, borderColor: colors.primary },
    optionIcon: {
      width: 38,
      height: 38,
      borderRadius: radii.sm,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionIconSelected: { backgroundColor: colors.primary },
    appearanceCopy: { flex: 1, minWidth: 0 },
    appearanceTitle: { ...typography.captionStrong, color: colors.foreground },
    appearanceDescription: { ...typography.caption, color: colors.mutedForeground },
    auditBar: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.xl,
    },
    auditText: { ...typography.caption, color: colors.mutedForeground, flex: 1 },
    pressed: { opacity: 0.78 },
  };
});
