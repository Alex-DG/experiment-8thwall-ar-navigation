import * as TURF from '@turf/turf'

/**
 * Calculate distance between 2 set of coordinates
 *
 * @param {lat, lng} start
 * @param {lat, lng} end
 * @returns distance (meter)
 */
export const distanceHaversine = (start, end) => {
  // Computational optimization for no change.
  if (start.lat === end.lat && start.lng === end.lng) return 0

  const lat1R = (start.lat * Math.PI) / 180
  const lat2R = (end.lat * Math.PI) / 180
  const halfLatD = 0.5 * (lat2R - lat1R)
  const halfLngD =
    0.5 * ((end.lng * Math.PI) / 180 - (start.lng * Math.PI) / 180)
  const v =
    Math.sin(halfLatD) ** 2 +
    Math.sin(halfLngD) ** 2 * Math.cos(lat1R) * Math.cos(lat2R)
  const arc = 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v))
  return arc * 6371008.8 // Earth arithmetic mean radius, per en.wikipedia.org/wiki/Earth_radius
}

export const findClosestLocation = (distances) => {
  let minDistance = Infinity
  let closestIndex = -1

  for (let i = 0; i < distances.length; i++) {
    const distance = distances[i]
    if (distance < minDistance) {
      minDistance = distance
      closestIndex = i
    }
  }

  if (closestIndex < 0) return { distance: 0, closestIndex }

  return { distance: distances[closestIndex], closestIndex }
}

export const distanceBetweenPoints = (
  start,
  end,
  options = { units: 'kilometers' } // can be degrees, radians, miles, or kilometers
) => {
  const from = TURF.point([start.lng, start.lat])
  const to = TURF.point([end.lng, end.lat])
  const d = TURF.distance(from, to, options)
  return d * 1000 // return distance in meters
}

export const wayspotVector3 = (wayspotPosition) => {
  const position = new THREE.Vector3()

  if (!wayspotPosition) return position

  const { lat, lng } = wayspotPosition

  const latRad = lat * (Math.PI / 180)
  const lonRad = lng * (Math.PI / 180)
  const radius = 6371

  const x = radius * Math.cos(latRad) * Math.cos(lonRad)
  const y = radius * Math.sin(latRad)
  const z = radius * Math.cos(latRad) * Math.sin(lonRad)

  position.x = x
  position.y = y
  position.z = z

  return position
}

/**
 *
 * @param {lat, lng} start
 * @param {lat, lng} end
 * @returns angle (degrees)
 */
export const calculateBearingBetweenPoints = (start, end) => {
  const point1 = TURF.point([start.longitude, start.latitude])
  const point2 = TURF.point([end.longitude, end.latitude])
  const angle = TURF.bearing(point1, point2)
  return angle
}

/**
 *
 * @param {lat, lng} start
 * @param {lat, lng} end
 * @returns angle (radian)
 */
export const calculateBearingRad = (start, end) => {
  const lat1 = start.lat
  const lon1 = start.lng
  const lat2 = end.lat
  const lon2 = end.lng

  const lonDiff = lon2 - lon1
  const y = Math.sin(lonDiff) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lonDiff)

  const bearingRad = Math.atan2(y, x)

  // const bearingDeg = (bearingRad * 180) / Math.PI

  // // Convert bearing to a positive value between 0 and 360 degrees
  // const bearing = (bearingDeg + 360) % 360

  // return bearing

  return bearingRad
}
export const wayspotVector3ByDistance = (
  currentPosition,
  wayspotPosition,
  distance
) => {
  const normalizedDistance = new THREE.Vector3()
  const position = new THREE.Vector3()

  const start = {
    lat: currentPosition.lat,
    lng: currentPosition.lng,
  }

  const end = {
    lat: wayspotPosition.lat,
    lng: wayspotPosition.lng,
  }

  const bearingRad = calculateBearingRad(start, end)

  normalizedDistance.copy(new THREE.Vector3(0, 0, distance))

  position.copy(
    normalizedDistance.applyAxisAngle(new THREE.Vector3(0, 1, 0), bearingRad)
  )

  return position
}
