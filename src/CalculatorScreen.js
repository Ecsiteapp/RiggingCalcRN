import React, { useState, useMemo } from 'react'
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { calcRigging } from './calc'
import { colors, text } from './theme'
import RiggingDiagram from './RiggingDiagram'

const DEFAULTS = {
  loadWeight: '', headblockHeight: '', heightOfConcern: '',
  loadStandoff: '', tagDistance: '', hoistDistance: '',
  hoistHeight: '', footblockHeight: '', loadLineAngleAtFootBlock: '',
}

// ── Reusable Components ──────────────────────────────────────────

function InputRow({ label, name, value, onChangeText, unit, hint }) {
  return (
    <View style={s.inputRow}>
      <View style={s.inputLabelWrap}>
        <Text style={s.inputLabel}>{label}</Text>
        {hint ? <Text style={s.inputHint}> {hint}</Text> : null}
      </View>
      <View style={s.inputWrap}>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          returnKeyType="done"
        />
        <View style={s.unitBox}>
          <Text style={s.unitText}>{unit}</Text>
        </View>
      </View>
    </View>
  )
}

function GeoRow({ label, value, unit }) {
  const display = value != null ? (+value).toFixed(2) : '—'
  return (
    <View style={s.geoRow}>
      <Text style={s.geoLabel}>{label}</Text>
      <Text style={s.geoValue}>{display}<Text style={s.geoUnit}> {unit}</Text></Text>
    </View>
  )
}

function ForceRow({ label, value, level }) {
  const display = value != null && +value > 0 ? (+value).toFixed(1) : '—'
  const valueStyle = level === 'danger' ? s.forceDanger
    : level === 'warn' ? s.forceWarn
    : s.forceNormal
  const rowStyle = level === 'danger' ? s.forceRowDanger
    : level === 'warn' ? s.forceRowWarn
    : s.forceRow
  return (
    <View style={rowStyle}>
      <Text style={s.forceLabel}>{label}</Text>
      <Text style={[s.forceValue, valueStyle]}>
        {display}<Text style={s.forceUnit}> lbs</Text>
      </Text>
    </View>
  )
}

function SectionHeader({ title }) {
  return <Text style={s.sectionHeader}>{title}</Text>
}

function GroupLabel({ title }) {
  return <Text style={s.groupLabel}>{title}</Text>
}

// ── Main Screen ──────────────────────────────────────────────────

export default function CalculatorScreen({ onLogout }) {
  const [inputs, setInputs]       = useState(DEFAULTS)
  const [withFootblock, setFB]    = useState(false)

  const set = (name) => (val) => setInputs(p => ({ ...p, [name]: val }))

  const R = useMemo(() => calcRigging(inputs, withFootblock), [inputs, withFootblock])

  const W          = parseFloat(inputs.loadWeight) || 0
  const hasInputs  = Object.values(inputs).some(v => v !== '')
  const hasForces  = W > 0
  const llRatio    = W > 0 ? R.forceOnLoadLine / W : 0
  const llLevel    = llRatio > 2.5 ? 'danger' : llRatio > 1.8 ? 'warn' : 'normal'
  const hbLevel    = W > 0 && R.forceOnHeadblock / W > 3 ? 'danger' : 'normal'

  // Footblock angle: pre-fill with calculated when input is empty
  const fbAngleDisplay = withFootblock
    ? (inputs.loadLineAngleAtFootBlock !== ''
        ? inputs.loadLineAngleAtFootBlock
        : (R.loadLineAngleAtFootblock > 0 ? R.loadLineAngleAtFootblock.toFixed(2) : ''))
    : ''

  // Warnings
  const warnings = []
  if (hasForces) {
    if (R.loadLineAngleAtHeadBlock > 30)
      warnings.push({ t: 'warn', m: `Load line angle ${R.loadLineAngleAtHeadBlock.toFixed(1)}° > 30° — elevated tension` })
    if (llRatio > 2)
      warnings.push({ t: 'danger', m: `Load line = ${llRatio.toFixed(1)}× load weight — review geometry` })
    if (R.forceOnHeadblock / W > 3)
      warnings.push({ t: 'danger', m: 'High headblock load — verify mounting capacity' })
    if (R.taglineAngleFromVertical < 10 && parseFloat(inputs.tagDistance) > 0)
      warnings.push({ t: 'warn', m: 'Tagline nearly vertical — poor horizontal control' })
    if (warnings.length === 0)
      warnings.push({ t: 'ok', m: 'Geometry within normal parameters' })
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerIcon}>⚙</Text>
          <View>
            <Text style={s.headerTitle}>Rigging Calculator</Text>
            <Text style={s.headerSub}>Force & Geometry Analysis</Text>
          </View>
        </View>
        <TouchableOpacity style={s.signOutBtn} onPress={onLogout}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* ── Mode toggle ── */}
      <View style={s.toggleRow}>
        <TouchableOpacity
          style={[s.toggleBtn, !withFootblock && s.toggleActive]}
          onPress={() => setFB(false)}
        >
          <Text style={[s.toggleText, !withFootblock && s.toggleTextActive]}>
            Without Footblock
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.toggleBtn, withFootblock && s.toggleActive]}
          onPress={() => setFB(true)}
        >
          <Text style={[s.toggleText, withFootblock && s.toggleTextActive]}>
            With Footblock
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">

        {/* ── INPUTS ── */}
        <View style={s.card}>
          <SectionHeader title="Input Parameters" />

          <GroupLabel title="LOAD" />
          <InputRow label="Load Weight"            name="loadWeight"       value={inputs.loadWeight}       onChangeText={set('loadWeight')}       unit="lbs" />

          <GroupLabel title="GEOMETRY" />
          <InputRow label="Headblock Height"                   name="headblockHeight"  value={inputs.headblockHeight}  onChangeText={set('headblockHeight')}  unit="ft" />
          <InputRow label="Height of Concern"                  name="heightOfConcern"  value={inputs.heightOfConcern}  onChangeText={set('heightOfConcern')}  unit="ft"  hint="(load height)" />
          <InputRow label="Load Standoff at Height of Concern" name="loadStandoff"     value={inputs.loadStandoff}     onChangeText={set('loadStandoff')}     unit="ft" />
          <InputRow label="Tag Distance from Headblock Base"   name="tagDistance"      value={inputs.tagDistance}      onChangeText={set('tagDistance')}      unit="ft"  hint="(absolute)" />

          <GroupLabel title="HOIST" />
          <InputRow label="Hoist Distance"   name="hoistDistance" value={inputs.hoistDistance} onChangeText={set('hoistDistance')} unit="ft" hint="(from below HB)" />
          <InputRow label="Hoist Height"     name="hoistHeight"   value={inputs.hoistHeight}   onChangeText={set('hoistHeight')}   unit="ft" hint="(off floor)" />

          {withFootblock && (
            <>
              <GroupLabel title="FOOTBLOCK" />
              <InputRow label="Footblock Height"             name="footblockHeight"        value={inputs.footblockHeight}        onChangeText={set('footblockHeight')}        unit="ft"  hint="(off floor)" />
              <InputRow label="Load Line Angle at Foot Block" name="loadLineAngleAtFootBlock" value={fbAngleDisplay}              onChangeText={set('loadLineAngleAtFootBlock')} unit="deg" hint="(auto-calc, editable)" />
            </>
          )}

          <TouchableOpacity style={s.clearBtn} onPress={() => setInputs(DEFAULTS)}>
            <Text style={s.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* ── GEOMETRY OUTPUTS ── */}
        <View style={s.card}>
          <SectionHeader title="Calculated Geometry" />
          <GeoRow label="Load Distance Below Head Block"      value={hasInputs ? R.distBelowHead : null}              unit="ft" />
          <GeoRow label="Load Line Angle at Head Block"       value={hasInputs ? R.loadLineAngleAtHeadBlock : null}   unit="°" />
          <GeoRow label="Horiz. Distance Load to Tagline"     value={hasInputs ? R.horizDistToTag : null}             unit="ft" />
          <GeoRow label="Tagline Length"                      value={hasInputs ? R.taglineLength : null}              unit="ft" />
          <GeoRow label="Tagline Angle from Vertical"         value={hasInputs ? R.taglineAngleFromVertical : null}   unit="°" />
          <GeoRow label="Tagline Angle from Horizontal"       value={hasInputs ? R.taglineAngleFromHorizontal : null} unit="°" />
          <GeoRow label="Hoist Line Angle at Head Block"      value={hasInputs ? R.hoistLineAngleAtHeadBlock : null}  unit="°" />
          {withFootblock && (
            <GeoRow label="Load Line Angle at Foot Block"    value={hasInputs ? R.loadLineAngleAtFootblock : null}   unit="°" />
          )}
          <GeoRow label="Restraint Angle for Headblock"       value={hasInputs ? R.restraintAngleHeadblock : null}    unit="°" />

          <RiggingDiagram inputs={inputs} results={R} withFootblock={withFootblock} />
        </View>

        {/* ── FORCE METRICS ── */}
        <View style={s.card}>
          <SectionHeader title="Key Metrics" />
          <Text style={s.forcesSub}>Forces (lbs.)</Text>

          <ForceRow label="Force on Load Line"              value={hasForces ? R.forceOnLoadLine : null}   level={llLevel} />
          <ForceRow label="Force on Capstan Hoist"          value={hasForces ? R.forceOnCapstan : null} />
          <ForceRow label="Tagline Pull"                    value={hasForces ? R.taglinePull : null} />
          <ForceRow label="Force on Headblock"              value={hasForces ? R.forceOnHeadblock : null}  level={hbLevel} />
          {withFootblock && (
            <ForceRow label="Force on Footblock"            value={hasForces ? R.forceOnFootblock : null} />
          )}
          <ForceRow label="Side Force on Mast at Headblock" value={hasForces ? R.sideForceOnMast : null} />
          {!withFootblock && (
            <>
              <ForceRow label="Upward Pull on Hoist"        value={hasForces ? R.upwardPullOnHoist : null} />
              <ForceRow label="Sideways Pull on Hoist"      value={hasForces ? R.sidewaysPullOnHoist : null} />
            </>
          )}

          {hasForces && warnings.map((w, i) => (
            <View key={i} style={[s.alert,
              w.t === 'ok' ? s.alertOk : w.t === 'warn' ? s.alertWarn : s.alertDanger]}>
              <Text style={[s.alertText,
                w.t === 'ok' ? s.alertTextOk : w.t === 'warn' ? s.alertTextWarn : s.alertTextDanger]}>
                {w.m}
              </Text>
            </View>
          ))}

          {!hasForces && (
            <Text style={s.emptyText}>Enter Load Weight and geometry values to calculate forces.</Text>
          )}
        </View>

        <View style={s.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ── Styles ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  scroll:  { flex: 1 },
  scrollContent: { padding: 12, gap: 12 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0d1526',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon:  { fontSize: 22, color: colors.accent },
  headerTitle: { fontSize: text.lg, fontWeight: '700', color: colors.textPrimary },
  headerSub:   { fontSize: text.xs, color: colors.textMuted },
  signOutBtn: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 6, paddingHorizontal: 12, paddingVertical: 5,
  },
  signOutText: { fontSize: text.xs, color: colors.textMuted },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    margin: 12,
    marginBottom: 0,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleBtn: { flex: 1, paddingVertical: 9, alignItems: 'center' },
  toggleActive: { backgroundColor: colors.border },
  toggleText: { fontSize: text.sm, color: colors.textMuted, fontWeight: '500' },
  toggleTextActive: { color: colors.blue },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
    padding: 14,
  },

  // Section / group labels
  sectionHeader: {
    fontSize: text.xs,
    fontWeight: '600',
    color: colors.textSub,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 8,
    marginBottom: 12,
  },
  groupLabel: {
    fontSize: text.xs,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 10,
  },

  // Input
  inputRow:      { marginBottom: 8 },
  inputLabelWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  inputLabel:    { fontSize: text.sm, color: colors.textSub, lineHeight: 18 },
  inputHint:     { fontSize: text.xs, color: colors.textMuted, fontStyle: 'italic', lineHeight: 18 },
  inputWrap: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: text.base,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  unitBox: {
    backgroundColor: '#111827',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  unitText: { fontSize: text.xs, color: colors.textMuted },

  clearBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  clearText: { fontSize: text.sm, color: colors.textMuted },

  // Geometry output
  geoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 6,
    marginBottom: 4,
  },
  geoLabel: { fontSize: text.sm, color: colors.textSub, flex: 1, paddingRight: 8, lineHeight: 18 },
  geoValue: { fontSize: text.md, fontWeight: '600', color: colors.blue },
  geoUnit:  { fontSize: text.xs, color: colors.textMuted, fontWeight: '400' },

  // Forces
  forcesSub: {
    fontSize: text.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.textMuted,
    marginBottom: 8,
  },
  forceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 9, paddingHorizontal: 12,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.borderLight,
    borderRadius: 6, marginBottom: 4,
  },
  forceRowWarn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 9, paddingHorizontal: 12,
    backgroundColor: '#1c1207', borderWidth: 1, borderColor: '#92400e',
    borderRadius: 6, marginBottom: 4,
  },
  forceRowDanger: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 9, paddingHorizontal: 12,
    backgroundColor: '#150a0a', borderWidth: 1, borderColor: '#7f1d1d',
    borderRadius: 6, marginBottom: 4,
  },
  forceLabel:  { fontSize: text.sm, color: colors.textSub, flex: 1, paddingRight: 8 },
  forceValue:  { fontSize: text.lg, fontWeight: '700' },
  forceNormal: { color: colors.green },
  forceWarn:   { color: colors.warn },
  forceDanger: { color: colors.danger },
  forceUnit:   { fontSize: text.xs, color: '#4b5563', fontWeight: '400' },

  // Alerts
  alert:        { borderRadius: 6, padding: 9, marginTop: 4, borderWidth: 1 },
  alertOk:      { backgroundColor: '#052e16', borderColor: '#065f46' },
  alertWarn:    { backgroundColor: '#1c1a07', borderColor: '#78350f' },
  alertDanger:  { backgroundColor: '#1a0a0a', borderColor: '#7f1d1d' },
  alertText:    { fontSize: text.sm, lineHeight: 18 },
  alertTextOk:  { color: '#6ee7b7' },
  alertTextWarn:{ color: '#fde68a' },
  alertTextDanger: { color: '#fca5a5' },

  emptyText: { fontSize: text.sm, color: colors.textMuted, textAlign: 'center', paddingVertical: 20 },
  footerSpace: { height: 40 },
})
