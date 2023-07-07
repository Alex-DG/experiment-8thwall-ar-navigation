import DeviceOrientationControls from '../classes/DeviceOrientationControl'
import Geolocation from '../classes/Geolocation'
import Layout from '../classes/Layout'
import Lights from '../classes/Lights'

/**
 * Initialise 3D world content
 */
export const initWorldPipelineModule = () => {
  let controls = null

  const init = () => {
    const { camera } = XR8.Threejs.xrScene()
    controls = new DeviceOrientationControls(camera)
    controls.connect()

    Geolocation.init()

    Layout.init()
    Lights.init()

    console.log('✨', 'World ready!')
  }

  const update = () => {
    controls?.update()
  }

  return {
    name: 'world',

    onStart: () => init(),

    onUpdate: () => update(),
  }
}
