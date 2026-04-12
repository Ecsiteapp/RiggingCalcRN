import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, {
  Line, Circle, Rect, Polygon, Text as SvgText, G,
} from 'react-native-svg'
import { colors } from './theme'

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

        {/* Grid ceiling */}
        <Line x1={ML - 8} y1={hbY - 6} x2={hbX + 46} y2={hbY - 6}
          stroke="#1e3a5f" strokeWidth="2.5" />

        {/* Floor */}
        <Line x1={ML - 8} y1={floorY} x2={VW - MR + 5} y2={floorY}
          stroke="#334155" strokeWidth="2" />
        {hatchMarks}

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

        {/* Hoist marker */}
        {hoistDist > 0 && (
          <G>
            <Rect x={hoistX - 5} y={hoistY - 5} width="10" height="10" rx="2"
              fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
            <SvgText x={hoistX + 8} y={hoistY + 3} fill="#fbbf24" fontSize="9">H</SvgText>
          </G>
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
