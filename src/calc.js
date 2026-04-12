const toRad = (deg) => (deg * Math.PI) / 180
const toDeg = (rad) => (rad * 180) / Math.PI

export function calcRigging(inputs, withFootblock) {
  const W         = parseFloat(inputs.loadWeight)              || 0
  const H         = parseFloat(inputs.headblockHeight)         || 0
  const h         = parseFloat(inputs.heightOfConcern)         || 0
  const standoff  = parseFloat(inputs.loadStandoff)            || 0
  const tagDist   = parseFloat(inputs.tagDistance)             || 0
  const hoistDist = parseFloat(inputs.hoistDistance)           || 0
  const hoistH    = parseFloat(inputs.hoistHeight)             || 0
  const fbH       = parseFloat(inputs.footblockHeight)         || 0
  const fbAngleInput =
    inputs.loadLineAngleAtFootBlock !== ''
      ? parseFloat(inputs.loadLineAngleAtFootBlock)
      : null

  // ── Geometry ────────────────────────────────────────────────────
  const distBelowHead = H - h
  const θHB_deg =
    distBelowHead > 0 ? toDeg(Math.atan2(standoff, distBelowHead)) : standoff > 0 ? 90 : 0
  const θHB = toRad(θHB_deg)

  const horizDistToTag = Math.max(0, tagDist - standoff)
  const φ_deg =
    h > 0 ? toDeg(Math.atan2(horizDistToTag, h)) : horizDistToTag > 0 ? 90 : 0
  const φH_deg = 90 - φ_deg
  const φ = toRad(φ_deg)

  const taglineLength = Math.sqrt(horizDistToTag ** 2 + h ** 2)

  const hoistVertDist = Math.max(0, H - hoistH)
  const θHoist_deg =
    hoistVertDist > 0 ? toDeg(Math.atan2(hoistDist, hoistVertDist)) : hoistDist > 0 ? 90 : 0
  const θHoist = toRad(θHoist_deg)

  // Footblock angle β
  let loadLineAngleAtFootblock_deg = 0
  let β = 0
  if (withFootblock) {
    if (fbAngleInput !== null && isFinite(fbAngleInput)) {
      loadLineAngleAtFootblock_deg = fbAngleInput
      β = toRad(fbAngleInput)
    } else {
      const dx = hoistDist
      const dy = hoistH - fbH
      const len = Math.sqrt(dx ** 2 + dy ** 2)
      β = len > 0 ? Math.acos(Math.max(-1, Math.min(1, dy / len))) : Math.PI / 2
      loadLineAngleAtFootblock_deg = toDeg(β)
    }
  }

  // ── Forces ──────────────────────────────────────────────────────
  let T = 0, T_tag = 0
  const denom = Math.sin(φ - θHB)
  if (W > 0 && Math.abs(denom) > 1e-6) {
    T     = (W * Math.sin(φ)) / denom
    T_tag = (W * Math.sin(θHB)) / denom
  } else if (W > 0 && φ_deg < 0.05) {
    T = Math.cos(θHB) > 1e-6 ? W / Math.cos(θHB) : W
    T_tag = T * Math.sin(θHB)
  }

  // Headblock
  let forceOnHeadblock = 0
  if (withFootblock) {
    forceOnHeadblock = 2 * T * Math.cos(θHB / 2)
  } else {
    const Fx = T * (Math.sin(θHB) + Math.sin(θHoist))
    const Fy = T * (Math.cos(θHB) + Math.cos(θHoist))
    forceOnHeadblock = Math.sqrt(Fx ** 2 + Fy ** 2)
  }

  const forceOnFootblock = withFootblock ? 2 * T * Math.cos(β / 2) : 0

  const sideForceOnMast = withFootblock
    ? T * Math.sin(θHB)
    : T * (Math.sin(θHB) + Math.sin(θHoist))

  const upwardPullOnHoist   = withFootblock ? 0 : T * Math.cos(θHoist)
  const sidewaysPullOnHoist = withFootblock ? 0 : T * Math.sin(θHoist)

  let restraintAngle = 0
  if (withFootblock) {
    restraintAngle = toDeg(Math.atan2(Math.sin(θHB), 1 + Math.cos(θHB)))
  } else {
    const Fx = Math.sin(θHB) + Math.sin(θHoist)
    const Fy = Math.cos(θHB) + Math.cos(θHoist)
    restraintAngle = Fy > 1e-9 ? toDeg(Math.atan2(Fx, Fy)) : 90
  }

  const safe = (v) => (isFinite(v) && v >= 0 ? +v.toFixed(4) : 0)

  return {
    distBelowHead:               safe(distBelowHead),
    loadLineAngleAtHeadBlock:    safe(θHB_deg),
    horizDistToTag:              safe(horizDistToTag),
    taglineLength:               safe(taglineLength),
    taglineAngleFromVertical:    safe(φ_deg),
    taglineAngleFromHorizontal:  safe(φH_deg),
    hoistLineAngleAtHeadBlock:   safe(θHoist_deg),
    loadLineAngleAtFootblock:    safe(loadLineAngleAtFootblock_deg),
    restraintAngleHeadblock:     safe(restraintAngle),
    forceOnLoadLine:             safe(T),
    forceOnCapstan:              safe(T),
    taglinePull:                 safe(T_tag),
    forceOnHeadblock:            safe(forceOnHeadblock),
    forceOnFootblock:            safe(forceOnFootblock),
    sideForceOnMast:             safe(sideForceOnMast),
    upwardPullOnHoist:           safe(upwardPullOnHoist),
    sidewaysPullOnHoist:         safe(sidewaysPullOnHoist),
  }
}
