class _LocalCoordSystem {
  constructor() {
    this.isReady = false
    this.origin = [0, 0] // latitude, longitude of worldspace (0,0,0)
    this.scale = [1, 1] // meters per degree latitude, meters per degree longitude
  }

  // latitude -90..+90, longitude -180..+180
  setOrigin(latitude, longitude) {
    this.origin = [latitude, longitude]

    const earthRadius = 6371e3 // approx radius in meters
    const earthCircumference = 2 * Math.PI * earthRadius // c = 2πr
    const metersPerDegree = earthCircumference / 360
    const latitudeRadians = (Math.PI * latitude) / 180

    this.scale = [metersPerDegree, metersPerDegree * Math.cos(latitudeRadians)]

    this.isReady = true
  }

  // convert a lat/lon to world 3-space (-Z is North, +X is East, +Y is Up)
  // this only works for points near the origin! (like walking distance)
  getPosition(outVec, latitude, longitude, altitude = 0) {
    // const outVec = new THREE.Vector3()
    const dLat = latitude - this.origin[0]
    const dLon = longitude - this.origin[1]

    outVec.z = -this.scale[0] * dLat
    outVec.x = this.scale[1] * dLon
    outVec.y = altitude

    // return outVec
  }
}

const LocalCoordSystem = new _LocalCoordSystem()
export default LocalCoordSystem
