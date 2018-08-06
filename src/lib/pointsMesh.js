const THREE = window.THREE

const INIT = Symbol('INIT')
const INIT_MESH = Symbol('INIT_MESH')
const BIND_EVENTS = Symbol('BIND_EVENTS')

const width = 180
const height = 90

const cellWidth = 5
const widthSegments = width / 5 + 1
const heightSegments = height / 5 + 1

function getStyle(el, name) {
  if (window.getComputedStyle) {
    return window.getComputedStyle(el, null)[name]
  } else {
    return el.currentStyle[name]
  }
}

function makeData () {
  let data = {}
  for (let j = 0; j < heightSegments; j++) {
    for (let i = 0; i < widthSegments; i++) {
      data[i * cellWidth + ',' + j * cellWidth] = Math.random() * 10
    }
  }
  return data
}

class PointsMesh {
  constructor (el) {
    this.el = el
    this[ INIT ]()
    this[ INIT_MESH ]()
    this[ BIND_EVENTS ]()
    this._render()
  }

  [ INIT ] () {
    this.time = 0

    this.width = parseInt(getStyle(this.el, 'width'))
    this.height = parseInt(getStyle(this.el, 'height'))

    this.scene = new THREE.Scene()

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(this.width, this.height)
    this.el.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000)
    this.camera.position.z = 200

    this.cameraControl = new THREE.TrackballControls(this.camera, this.renderer.domElement)
  }
  [ INIT_MESH ] () {

    this.lnglatMap = {}
    let geometry = new THREE.Geometry()
    let lineGeometry = new THREE.Geometry()

    for (let j = 0; j < heightSegments; j++) {
      for (let i = 0; i < widthSegments; i++) {
        let vector = new THREE.Vector3(i * cellWidth, j * cellWidth, 0)
        this.lnglatMap[i * cellWidth + ',' + j * cellWidth] = vector
        geometry.vertices.push(vector)
      }
    }

    this.vertices = geometry.vertices

    for (let i = 1; i < widthSegments; i++) {
      for (let j = 0; j < heightSegments; j++) {
        let vector1 = geometry.vertices[j * widthSegments + i - 1]
        lineGeometry.vertices.push(vector1)
        let vector2 = geometry.vertices[j * widthSegments + i]
        lineGeometry.vertices.push(vector2)
      }
    }

    for (let j = 1; j < heightSegments; j++) {
      for (let i = 0; i < widthSegments; i++) {
        let vector1 = geometry.vertices[j * widthSegments + i]
        lineGeometry.vertices.push(vector1)
        let vector2 = geometry.vertices[(j - 1) * widthSegments + i]
        lineGeometry.vertices.push(vector2)
      }
    }

    let pointsMaterial = new THREE.PointsMaterial({
      size: 3,
      color: 0xff0000,
    })
    let lineMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
    })

    let points = new THREE.Points(geometry, pointsMaterial)
    this.scene.add(points)

    let line = new THREE.LineSegments(lineGeometry, lineMaterial)
    this.scene.add(line)

    this.points = points
    this.line = line

    this.newData = makeData()
  }

  update () {
    if (!this.time) {
      this.oldData = this.newData
      this.newData = makeData()
    }

    let percent = this.time % 1
    for (let loc in this.lnglatMap) {
      let vec = this.lnglatMap[loc]
      let z = this.oldData[loc] + (this.newData[loc] - this.oldData[loc]) * percent
      vec.z = z
    }

    this.points.geometry.verticesNeedUpdate = true
    this.line.geometry.verticesNeedUpdate = true
    this.time += 0.008
    if (this.time >= 1) {
      this.time = 0
    }

  }

  render () {
    this.renderer.render(this.scene, this.camera)
    this.cameraControl.update()
  }

  _render () {
    this.update()
    this.render()
    requestAnimationFrame(this._render.bind(this))
  }

  [ BIND_EVENTS ] () {
    window.addEventListener('resize', this.resize.bind(this))
  }

  resize () {
    this.width = parseInt(getStyle(this.el, 'width'))
    this.height = parseInt(getStyle(this.el, 'height'))
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.width, this.height)
  }
}

export default PointsMesh
