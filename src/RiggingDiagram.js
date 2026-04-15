import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, {
  Line, Circle, Rect, Polygon, Text as SvgText, G, Path, Ellipse,
} from 'react-native-svg'
import { colors } from './theme'

/** Truss tower from deck to headblock — goalpost + X-bracing */
function TowerStructure({ hbX, hbY, floorY }) {
  const xL = hbX - 16
  const xR = hbX + 16
  const topY = hbY - 10
  const h = topY - floorY
  const y1 = floorY + h * 0.33
  const y2 = floorY + h * 0.66
  const steel = '#5b6578'
  const steelDim = '#3d4654'
  const steelHi = '#7c8aa0'

  return (
    <G opacity={0.95}>
      {/* Base / sill */}
      <Rect x={xL - 4} y={floorY - 2} width={xR - xL + 8} height={4} rx={1}
        fill="#2a3344" stroke={steel} strokeWidth="1" />
      {/* Main legs */}
      <Line x1={xL} y1={floorY} x2={xL} y2={topY} stroke={steel} strokeWidth="3" strokeLinecap="square" />
      <Line x1={xR} y1={floorY} x2={xR} y2={topY} stroke={steel} strokeWidth="3" strokeLinecap="square" />
      {/* Inner verticals (ladder frame) */}
      <Line x1={hbX - 5} y1={floorY + 6} x2={hbX - 5} y2={topY - 2}
        stroke={steelDim} strokeWidth="1.2" />
      <Line x1={hbX + 5} y1={floorY + 6} x2={hbX + 5} y2={topY - 2}
        stroke={steelDim} strokeWidth="1.2" />
      {/* X-bracing */}
      <Line x1={xL} y1={floorY + 4} x2={xR} y2={y2} stroke={steelDim} strokeWidth="1.2" />
      <Line x1={xR} y1={floorY + 4} x2={xL} y2={y2} stroke={steelDim} strokeWidth="1.2" />
      <Line x1={xL} y1={y1} x2={xR} y2={topY - 2} stroke={steelDim} strokeWidth="1.2" />
      <Line x1={xR} y1={y1} x2={xL} y2={topY - 2} stroke={steelDim} strokeWidth="1.2" />
      {/* Top chord / beam */}
      <Line x1={xL - 2} y1={topY} x2={xR + 2} y2={topY} stroke={steelHi} strokeWidth="2.5" strokeLinecap="round" />
      {/* Small gusset plates */}
      <Rect x={xL - 3} y={topY - 4} width={6} height={6} fill="#1e2838" stroke={steel} strokeWidth="0.8" />
      <Rect x={xR - 3} y={topY - 4} width={6} height={6} fill="#1e2838" stroke={steel} strokeWidth="0.8" />
    </G>
  )
}

/**
 * Rolling chain-hoist motor (deck rig). Rope attaches at (ax, ay) — graphic sits under
 * that point when there is vertical room; otherwise offset sideways so lines stay exact.
 */
function HoistTruck({ ax, ay, floorY }) {
  const gold = '#fbbf24'
  const body = '#3f4f64'
  const rim = '#94a3b8'
  const roomBelow = floorY - ay - 6
  const cramped = roomBelow < 14

  if (!cramped) {
    const sheaveR = 4
    const wheelY = floorY - 2
    const wxL = ax - 10
    const wxR = ax + 10
    const wheelR = 2.8
    const bodyTop = ay + sheaveR + 1
    const railY = wheelY - 5
    return (
      <G>
        <Circle cx={ax} cy={ay} r={sheaveR} fill="#0f172a" stroke={gold} strokeWidth="1.5" />
        <Rect x={ax - 10} y={bodyTop} width={20} height={Math.max(8, railY - bodyTop)} rx={2}
          fill={body} stroke={gold} strokeWidth="1" />
        <Rect x={ax - 8} y={bodyTop + 3} width={16} height={3} rx={0.5} fill={gold} opacity={0.28} />
        <Rect x={ax - 12} y={railY} width={24} height={4} rx={1} fill="#2a3548" stroke="#4b5568" strokeWidth="0.8" />
        <Ellipse cx={wxL} cy={wheelY} rx={wheelR} ry={wheelR * 0.85} fill="#1a1f2e" stroke={rim} strokeWidth="1" />
        <Ellipse cx={wxR} cy={wheelY} rx={wheelR} ry={wheelR * 0.85} fill="#1a1f2e" stroke={rim} strokeWidth="1" />
        <SvgText x={ax + 12} y={ay + 4} fill={gold} fontSize="9">H</SvgText>
      </G>
    )
  }

  /* Deck-level hoist: draw truck to the side so (ax,ay) stays the true line anchor */
  const ox = ax + 14
  const deck = floorY
  const wheelY = deck - 1
  const motorTop = deck - 26
  return (
    <G>
      <Path
        d={`M ${ax} ${ay} L ${ox} ${motorTop + 2}`}
        stroke={gold}
        strokeWidth="1.2"
        strokeDasharray="2 2"
        opacity={0.45}
      />
      <Ellipse cx={ox - 8} cy={wheelY} rx={2.8} ry={2.5} fill="#1a1f2e" stroke={rim} strokeWidth="0.9" />
      <Ellipse cx={ox + 8} cy={wheelY} rx={2.8} ry={2.5} fill="#1a1f2e" stroke={rim} strokeWidth="0.9" />
      <Rect x={ox - 12} y={deck - 12} width={24} height={5} rx={1} fill="#2a3548" stroke="#4b5568" strokeWidth="0.8" />
      <Rect x={ox - 10} y={motorTop} width={20} height={16} rx={2} fill={body} stroke={gold} strokeWidth="1.1" />
      <Rect x={ox - 8} y={motorTop + 4} width={16} height={3} rx={0.5} fill={gold} opacity={0.32} />
      <Circle cx={ox} cy={motorTop - 1} r={3} fill="#0f172a" stroke={gold} strokeWidth="1" />
      <SvgText x={ox + 12} y={motorTop + 8} fill={gold} fontSize="9">H</SvgText>
    </G>
  )
}

export default function RiggingDiagram({ inputs, results: R, withFootblock }) {
  const H         = parseFloat(inputs.headblockHeight)  || 0
  const h         = parseFloat(inputs.heightOfConcern)  || 0
  const standoff  = parseFloat(inputs.loadStandoff)     || 0
  const tagDist   = parseFloat(inputs.tagDistance)      || 0
  const hoistDist = parseFloat(inputs.hoistDistance)    || 0
  const hoistH    = parseFloat(inputs.hoistHeight)      || 0
  const fbH       = parseFloat(inputs.footblockHeight)  || 0

  if (!H) {
    return (
      <View style={s.wrap}>
        <Svg width="100%" height="180" viewBox="0 0 280 180">
          <SvgText x="140" y="95" textAnchor="middle" fill={colors.textMuted} fontSize="12">
            Enter headblock height to see diagram
          </SvgText>
        </Svg>
      </View>
    )
  }

  const VW = 280, VH = 200
  const ML = 32, MR = 28, MT = 22, MB = 32

  const maxH = Math.max(H, hoistH || 0, 1)
  const maxX = Math.max(standoff, tagDist, hoistDist, 10)
  const s_y  = (VH - MT - MB) / maxH
  const s_x  = (VW - ML - MR) / maxX
  const sc   = Math.min(s_x, s_y)

  const px = (x) => ML + x * sc
  const py = (y) => VH - MB - y * sc

  const hbX    = px(0),        hbY    = py(H)
  const loadX  = px(standoff), loadY  = py(h)
  const floorY = py(0)
  const tagX   = px(tagDist),  tagY   = py(0)
  const fbX    = px(0),        fbY    = py(fbH)
  const hoistX = px(hoistDist),hoistY = py(hoistH)

  // Floor hatch marks
  const hatchMarks = []
  for (let i = 0; i < 8; i++) {
    const hx = ML + i * 30
    hatchMarks.push(
      <Line key={i} x1={hx} y1={floorY} x2={hx - 8} y2={floorY + 8}
        stroke="#334155" strokeWidth="1" />
    )
  }

  return (
    <View style={s.wrap}>
      <Svg width="100%" height={VH} viewBox={`0 0 ${VW} ${VH}`}>

        {/* Grid / batten — parent beam + secondary */}
        <G opacity={0.9}>
          <Line x1={ML - 8} y1={hbY - 14} x2={hbX + 50} y2={hbY - 14}
            stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round" />
          <Line x1={ML - 4} y1={hbY - 8} x2={hbX + 44} y2={hbY - 8}
            stroke="#2d4a6f" strokeWidth="1.5" />
          <Line x1={hbX - 2} y1={hbY - 18} x2={hbX + 2} y2={hbY - 4}
            stroke="#3d5a7a" strokeWidth="2" strokeLinecap="round" />
        </G>

        {/* Floor */}
        <Line x1={ML - 8} y1={floorY} x2={VW - MR + 5} y2={floorY}
          stroke="#334155" strokeWidth="2" />
        {hatchMarks}

        {/* Tower (goalpost truss) — behind rigging lines */}
        <TowerStructure hbX={hbX} hbY={hbY} floorY={floorY} />

        {/* Vertical reference dashed */}
        <Line x1={hbX} y1={hbY} x2={hbX} y2={floorY}
          stroke="#1e3a5f" strokeWidth="1" strokeDasharray="4 3" />

        {/* Hoist rope above HB (going up) */}
        <Line x1={hbX} y1={hbY} x2={hbX} y2={hbY - 16}
          stroke={colors.accent} strokeWidth="1.5" strokeDasharray="3 2" />

        {/* Load line: HB → Load */}
        <Line x1={hbX} y1={hbY} x2={loadX} y2={loadY}
          stroke={colors.accent} strokeWidth="2.5" strokeLinecap="round" />

        {/* Tagline: Load → floor anchor */}
        {tagDist > 0 && (
          <Line x1={loadX} y1={loadY} x2={tagX} y2={tagY}
            stroke={colors.green} strokeWidth="2" strokeDasharray="7 3" strokeLinecap="round" />
        )}

        {/* Hoist rope: HB → hoist (without footblock) */}
        {hoistDist > 0 && !withFootblock && (
          <Line x1={hbX} y1={hbY} x2={hoistX} y2={hoistY}
            stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.65" />
        )}

        {/* Footblock ropes */}
        {withFootblock && (
          <G>
            <Line x1={hbX} y1={hbY} x2={fbX} y2={fbY}
              stroke={colors.blue} strokeWidth="1.5" strokeDasharray="4 3" />
            <Line x1={fbX} y1={fbY} x2={hoistX} y2={hoistY}
              stroke={colors.blue} strokeWidth="1.5" strokeDasharray="4 3" />
            {/* Footblock pulley */}
            <Circle cx={fbX} cy={fbY} r="5" fill="#0f172a" stroke={colors.blue} strokeWidth="1.5" />
            <SvgText x={fbX + 8} y={fbY - 4} fill={colors.blue} fontSize="9">FB</SvgText>
          </G>
        )}

        {/* Hoist — rolling motor / chain hoist */}
        {hoistDist > 0 && (
          <HoistTruck ax={hoistX} ay={hoistY} floorY={floorY} />
        )}

        {/* Headblock pulley */}
        <Circle cx={hbX} cy={hbY} r="8" fill="#0f172a" stroke={colors.accent} strokeWidth="2" />
        <SvgText x={hbX + 11} y={hbY + 4} fill={colors.accent} fontSize="9" fontWeight="bold">HB</SvgText>

        {/* Load */}
        <Circle cx={loadX} cy={loadY} r="9" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2" />
        <SvgText x={loadX} y={loadY + 4} textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold">W</SvgText>

        {/* Tagline anchor diamond */}
        {tagDist > 0 && (
          <G>
            <Polygon
              points={`${tagX},${tagY - 5} ${tagX + 5},${tagY} ${tagX},${tagY + 5} ${tagX - 5},${tagY}`}
              fill="#0f172a" stroke={colors.green} strokeWidth="1.5" />
            <SvgText x={tagX + 9} y={tagY - 2} fill={colors.green} fontSize="9">Tag</SvgText>
          </G>
        )}

        {/* Load line angle annotation at HB */}
        {standoff > 0 && H > h && (
          <SvgText x={hbX + 4} y={hbY + 20} fill={colors.accent} fontSize="9">
            {R.loadLineAngleAtHeadBlock.toFixed(1)}°
          </SvgText>
        )}

        {/* Tagline angle annotation at load */}
        {tagDist > 0 && (
          <SvgText x={loadX + 12} y={loadY + 12} fill={colors.green} fontSize="9">
            {R.taglineAngleFromVertical.toFixed(1)}°
          </SvgText>
        )}

        {/* Height label (rotated) */}
        <SvgText
          x={ML - 16} y={(hbY + floorY) / 2 + 4}
          fill="#475569" fontSize="9" textAnchor="middle"
          rotation="-90"
          originX={ML - 16}
          originY={(hbY + floorY) / 2}
        >
          {H.toFixed(0)} ft
        </SvgText>

        {/* Standoff label */}
        {standoff > 0 && (
          <SvgText x={(hbX + loadX) / 2} y={floorY + 16}
            fill="#475569" fontSize="9" textAnchor="middle">
            {standoff.toFixed(0)} ft standoff
          </SvgText>
        )}

        {/* Legend */}
        <Line x1={VW - 95} y1={VH - 24} x2={VW - 82} y2={VH - 24}
          stroke={colors.accent} strokeWidth="2.5" />
        <SvgText x={VW - 79} y={VH - 20} fill="#64748b" fontSize="8">Load line</SvgText>

        {tagDist > 0 && (
          <G>
            <Line x1={VW - 95} y1={VH - 11} x2={VW - 82} y2={VH - 11}
              stroke={colors.green} strokeWidth="2" strokeDasharray="4 2" />
            <SvgText x={VW - 79} y={VH - 7} fill="#64748b" fontSize="8">Tagline</SvgText>
          </G>
        )}
      </Svg>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: '#080d18',
    borderWidth: 1,
    borderColor: '#1a2744',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
  },
})
