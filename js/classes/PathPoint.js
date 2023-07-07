class PathPoint extends THREE.Mesh {
  constructor(options = { radius: 2, detail: 1 }) {
    const { radius, detail } = options

    const geometry = new THREE.IcosahedronGeometry(radius, detail)
    const material = new THREE.MeshNormalMaterial()

    super(geometry, material)
  }

  update() {
    this.position.x += 0.01
    this.position.z += 0.01
  }
}

export default PathPoint
