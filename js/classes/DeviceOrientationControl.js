import * as THREE from 'three'

class DeviceOrientationControls {
  camera

  distance = 0
  deltaDistance = 0

  accelerationX = 0
  accelerationY = 0
  accelerationZ = 0

  alphaRad = 0
  alphaDeg = 0

  enabled = true

  alphaOffsetAngle = 0
  betaOffsetAngle = 0
  gammaOffsetAngle = 0
  screenOrientation = 0

  deviceOrientation

  constructor(sceneCamera) {
    this.camera = sceneCamera
    this.camera.rotation.reorder('YXZ')

    this.onScreenOrientationChangeEvent =
      this.onScreenOrientationChangeEvent.bind(this)
    this.onDeviceOrientationChangeEvent =
      this.onDeviceOrientationChangeEvent.bind(this)
    this.onDeviceMotionChangeEvent = this.onDeviceMotionChangeEvent.bind(this)

    this.connect()
  }

  onDeviceMotionChangeEvent(event) {
    this.accelerationX = event.acceleration?.x || 0
    this.accelerationY = event.acceleration?.y || 0
    this.accelerationZ = event.acceleration?.z || 0
  }

  onDeviceOrientationChangeEvent(event) {
    this.deviceOrientation = event
  }

  onScreenOrientationChangeEvent() {
    this.screenOrientation = window.orientation || 0
  }

  setObjectQuaternion = (function () {
    const zee = new THREE.Vector3(0, 0, 1)
    const euler = new THREE.Euler()
    const q0 = new THREE.Quaternion()
    const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)) // - PI/2 around the x-axis

    return function (quaternion, alpha, beta, gamma, orient) {
      euler.set(beta, alpha, -gamma, 'YXZ') // 'ZXY' for the device, but 'YXZ' for us

      quaternion.setFromEuler(euler) // orient the device

      quaternion.multiply(q1) // camera looks out the back of the device, not the top

      quaternion.multiply(q0.setFromAxisAngle(zee, -orient)) // adjust for screen orientation
    }
  })()

  connect() {
    this.onScreenOrientationChangeEvent() // run once on load

    window.addEventListener(
      'orientationchange',
      this.onScreenOrientationChangeEvent,
      false
    )
    window.addEventListener(
      'deviceorientation',
      this.onDeviceOrientationChangeEvent,
      false
    )
    window.addEventListener(
      'devicemotion',
      this.onDeviceMotionChangeEvent,
      true
    )

    this.enabled = true
  }

  disconnect() {
    window.removeEventListener(
      'orientationchange',
      this.onScreenOrientationChangeEvent,
      false
    )

    window.removeEventListener(
      'deviceorientation',
      this.onDeviceOrientationChangeEvent,
      false
    )

    window.removeEventListener(
      'devicemotion',
      this.onDeviceMotionChangeEvent,
      true
    )

    this.enabled = false
  }

  update() {
    if (this.enabled === false) return

    const alpha = this.deviceOrientation?.alpha
      ? THREE.MathUtils.degToRad(this.deviceOrientation.alpha) +
        this.alphaOffsetAngle
      : 0 // Z
    const beta = this.deviceOrientation?.beta
      ? THREE.MathUtils.degToRad(this.deviceOrientation.beta) +
        this.betaOffsetAngle
      : 0 // X'
    const gamma = this.deviceOrientation?.gamma
      ? THREE.MathUtils.degToRad(this.deviceOrientation.gamma) +
        this.gammaOffsetAngle
      : 0 // Y''
    const orient = this.screenOrientation
      ? THREE.MathUtils.degToRad(this.screenOrientation)
      : 0 // O

    this.setObjectQuaternion(this.camera.quaternion, alpha, beta, gamma, orient)

    this.alphaDeg = this.deviceOrientation?.alpha || 0
    this.alphaRad = alpha
  }

  updateAlphaOffsetAngle(angle) {
    this.alphaOffsetAngle = angle
    this.update()
  }

  updateBetaOffsetAngle(angle) {
    this.betaOffsetAngle = angle
    this.update()
  }

  updateGammaOffsetAngle(angle) {
    this.gammaOffsetAngle = angle
    this.update()
  }

  dispose() {
    this.disconnect()
  }
}

export default DeviceOrientationControls
