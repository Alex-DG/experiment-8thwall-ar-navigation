import AppEventEmitter from './AppEventEmitter'

import {
  distanceBetweenPoints,
  findClosestLocation,
  wayspotVector3ByDistance,
} from '../utils/geo'

class _Geolocation {
  getPosition() {
    return this.position
  }

  getCoordinates() {
    const lat = this.position.coords.latitude
    const lng = this.position.coords.longitude

    return { lat, lng }
  }

  getDistanceBetweenVPSPoints(nearbyWayspots) {
    const distances = []

    nearbyWayspots.forEach((wayspot) => {
      const userLocation = this.getCoordinates()
      const dist = distanceBetweenPoints(userLocation, wayspot)
      distances.push(dist)
    })

    const { distance, closestIndex } = findClosestLocation(distances)

    console.log('---- NEARBY WAYSPOT ----')
    console.log({
      distance,
      closestIndex,
      wayspot: nearbyWayspots[closestIndex],
    })

    this.nearbyWayspot = nearbyWayspots[closestIndex]
    const userLocation = this.getCoordinates()

    const position = wayspotVector3ByDistance(
      userLocation,
      this.nearbyWayspot,
      distance
    )

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(10, 10, 10),
      new THREE.MeshNormalMaterial()
    )

    box.position.copy(position)

    // const { camera } = XR8.Threejs.xrScene()
    // box.lookAt(camera.position)

    const { scene } = XR8.Threejs.xrScene()
    scene.add(box)
  }

  addCube(currentLocation, previousLocation) {
    if (!currentLocation || !previousLocation) return

    const c3 = new THREE.Vector3(
      currentLocation.coords.longitude,
      currentLocation.coords.latitude,
      0
    )
    const p3 = new THREE.Vector3(
      previousLocation.coords.longitude,
      previousLocation.coords.latitude,
      0
    )

    console.log({ c3, p3 })
    console.log({ currentLocation, previousLocation })

    // if (c3.equals(p3)) return

    const start = {
      lng: previousLocation.coords.longitude,
      lat: previousLocation.coords.latitude,
    }

    const end = {
      lng: currentLocation.coords.longitude,
      lat: currentLocation.coords.latitude,
    }

    console.log({ start, end })

    const distance = distanceBetweenPoints(start, end)

    const position = wayspotVector3ByDistance(start, end, distance)

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1 / 2, 1 / 2, 1 / 2),
      new THREE.MeshNormalMaterial()
    )

    position.y = 0

    box.position.copy(position)

    // const { camera } = XR8.Threejs.xrScene()
    // box.lookAt(camera.position)

    const { scene } = XR8.Threejs.xrScene()
    scene.add(box)
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // CURRENT GEOLOCATION
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  successGeoCallback(position) {
    this.position = position

    if (!this.isLog) return

    const latitude = position.coords.latitude
    const longitude = position.coords.longitude
    const accuracy = position.coords.accuracy

    console.log('---- PRECISE GEOLOCATION ----')
    console.log({ data: position })
    console.log('Latitude:', latitude)
    console.log('Longitude:', longitude)
    console.log('Accuracy (in meters):', accuracy)
  }

  errorGeoCallback(error) {
    console.log('Error occurred while retrieving location:', error)
  }

  getPreciseLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.successGeoCallback,
        this.errorGeoCallback,
        {
          enableHighAccuracy: true,
        }
      )
    } else {
      console.log('Geolocation is not supported by this browser.')
    }
  }

  refreshGeolocation() {
    this.getPreciseLocation()
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // WATCH GEOLOCATION
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  successWatchGeoCallback(position) {
    this.previousPosition = this.position
    this.position = position

    const latitude = position.coords.latitude
    const longitude = position.coords.longitude
    const accuracy = position.coords.accuracy

    this.addCube(this.position, this.previousPosition)

    if (!this.isLog) return
    console.log('---- PRECISE WATCH GEOLOCATION ----')
    console.log({ data: position })
    console.log('Latitude:', latitude)
    console.log('Longitude:', longitude)
    console.log('Accuracy (in meters):', accuracy)
  }

  errorWatchGeoCallback(error) {
    console.log('Error occurred while retrieving location:', error)
  }

  startWatchPosition() {
    if (navigator.geolocation) {
      console.log('🌱', 'Start watch position')

      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }

      this.watchPositionID = navigator.geolocation.watchPosition(
        this.successWatchGeoCallback,
        this.errerrorWatchGeoCallbackor,
        options
      )
    } else {
      console.log('Geolocation is not supported by this browser.')
    }
  }

  stopWatchPosition() {
    if (!this.watchPositionID) return
    navigator.geolocation.clearWatch(this.watchPositionID)
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  bind() {
    this.getDistanceBetweenVPSPoints =
      this.getDistanceBetweenVPSPoints.bind(this)

    this.successGeoCallback = this.successGeoCallback.bind(this)
    this.errorGeoCallback = this.errorGeoCallback.bind(this)

    this.successWatchGeoCallback = this.successWatchGeoCallback.bind(this)
    this.errorWatchGeoCallback = this.errorWatchGeoCallback.bind(this)
  }

  init() {
    this.bind()

    AppEventEmitter.on('vpsnearby:pulled', this.getDistanceBetweenVPSPoints)

    this.isLog = false

    this.watchPositionID = null
    this.position = null
    this.previousPosition = null

    this.startWatchPosition()
  }
}
const Geolocation = new _Geolocation()
export default Geolocation
