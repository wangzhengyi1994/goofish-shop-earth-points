import * as THREE from 'three'
import Earth from './Earth'
import { Resources } from './Resources'
import { Basic } from './Basic'
import { lon2xyz } from '@/utils/common'

export default class World {
  constructor(option) {
    this.option = option
    this.basic = new Basic(option.dom)
    this.scene = this.basic.scene
    this.renderer = this.basic.renderer
    this.controls = this.basic.controls
    this.camera = this.basic.camera
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.zjClickTargets = []

    this.updateSize()
    this.resources = new Resources(async () => {
      await this.createEarth()
      this.createZhejiangPoint()
      this.bindEvents()
      this.render()
    })
  }

  async createEarth(data) {
    this.earth = new Earth({
      data: data || this.option.data,
      dom: this.option.dom,
      textures: this.resources.textures,
      earth: {
        radius: 50,
        rotateSpeed: 0.002,
        isRotation: true
      },
      satellite: {
        show: true,
        rotateSpeed: -0.01,
        size: 1,
        number: 2
      },
      punctuation: {
        circleColor: 0x3892ff,
        lightColumn: {
          startColor: 0xe4007f,
          endColor: 0xffffff
        }
      },
      flyLine: {
        color: 0xf3ae76,
        flyLineColor: 0xff7714,
        speed: 0.004
      }
    })

    this.scene.add(this.earth.group)
    await this.earth.init()
  }

  // 在浙江省位置创建特殊标记点
  createZhejiangPoint() {
    const radius = 50
    const lon = 120.15 // 浙江经度
    const lat = 30.29  // 浙江纬度
    const coord = lon2xyz(radius * 1.001, lon, lat)
    const coordVec3 = new THREE.Vector3(coord.x, coord.y, coord.z).normalize()
    const meshNormal = new THREE.Vector3(0, 0, 1)

    this.zjGroup = new THREE.Group()
    this.zjGroup.name = 'zhejiang-point'

    // 底座光圈 - 较大的绿色圈
    const baseGeo = new THREE.PlaneGeometry(1, 1)
    const baseMat = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      map: this.resources.textures.label,
      transparent: true,
      depthWrite: false
    })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    const baseSize = radius * 0.08
    baseMesh.scale.set(baseSize, baseSize, baseSize)
    baseMesh.position.set(coord.x, coord.y, coord.z)
    baseMesh.quaternion.setFromUnitVectors(meshNormal, coordVec3)
    baseMesh.name = 'zj-base'
    this.zjGroup.add(baseMesh)

    // 光柱 - 绿色高光柱
    const pillarHeight = radius * 0.45
    const pillarGeo = new THREE.PlaneGeometry(radius * 0.06, pillarHeight)
    pillarGeo.rotateX(Math.PI / 2)
    pillarGeo.translate(0, 0, pillarHeight / 2)
    const pillarMat = new THREE.MeshBasicMaterial({
      map: this.resources.textures.light_column,
      color: 0x00ffaa,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const pillar1 = new THREE.Mesh(pillarGeo, pillarMat)
    const pillar2 = pillar1.clone()
    pillar2.rotateZ(Math.PI / 2)
    const pillarGroup = new THREE.Group()
    pillarGroup.add(pillar1, pillar2)
    const sphereCoord = lon2xyz(radius, lon, lat)
    pillarGroup.position.set(sphereCoord.x, sphereCoord.y, sphereCoord.z)
    pillarGroup.quaternion.setFromUnitVectors(meshNormal, coordVec3)
    pillarGroup.name = 'zj-pillar'
    this.zjGroup.add(pillarGroup)

    // 点击检测用的透明球体（大一点方便点击）
    const hitGeo = new THREE.SphereGeometry(radius * 0.06, 16, 16)
    const hitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false
    })
    const hitMesh = new THREE.Mesh(hitGeo, hitMat)
    hitMesh.position.set(coord.x, coord.y, coord.z)
    hitMesh.name = 'zj-hit'
    this.zjGroup.add(hitMesh)

    this.zjClickTargets = [baseMesh, hitMesh, pillar1, pillar2]

    // 脉冲动画光圈
    const pulseGeo = new THREE.PlaneGeometry(1, 1)
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      map: this.resources.textures.aperture,
      transparent: true,
      opacity: 1.0,
      depthWrite: false
    })
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat)
    const pulseCoord = lon2xyz(radius * 1.002, lon, lat)
    const pulseSize = radius * 0.15
    pulseMesh.scale.set(pulseSize, pulseSize, pulseSize)
    pulseMesh.userData['size'] = pulseSize
    pulseMesh.userData['scale'] = 1.0
    pulseMesh.position.set(pulseCoord.x, pulseCoord.y, pulseCoord.z)
    pulseMesh.quaternion.setFromUnitVectors(meshNormal, coordVec3)
    this.zjGroup.add(pulseMesh)
    this.zjPulseMesh = pulseMesh

    this.earth.earthGroup.add(this.zjGroup)
  }

  bindEvents() {
    const dom = this.renderer.domElement

    dom.addEventListener('click', (event) => {
      this.updateMouse(event)
      this.raycaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.raycaster.intersectObjects(this.zjClickTargets, true)
      if (intersects.length > 0 && this.option.onZhejiangClick) {
        this.option.onZhejiangClick()
      }
    })

    dom.addEventListener('mousemove', (event) => {
      this.updateMouse(event)
      this.raycaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.raycaster.intersectObjects(this.zjClickTargets, true)
      if (intersects.length > 0) {
        dom.style.cursor = 'pointer'
        if (this.option.onZhejiangHover) {
          this.option.onZhejiangHover({ x: event.clientX, y: event.clientY })
        }
      } else {
        dom.style.cursor = 'default'
        if (this.option.onZhejiangHover) {
          this.option.onZhejiangHover(null)
        }
      }
    })
  }

  updateMouse(event) {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  render() {
    requestAnimationFrame(this.render.bind(this))
    this.renderer.render(this.scene, this.camera)
    this.controls && this.controls.update()
    this.earth && this.earth.render()

    // 浙江脉冲动画
    if (this.zjPulseMesh) {
      this.zjPulseMesh.userData['scale'] += 0.007
      const s = this.zjPulseMesh.userData['size'] * this.zjPulseMesh.userData['scale']
      this.zjPulseMesh.scale.set(s, s, s)
      const scale = this.zjPulseMesh.userData['scale']
      if (scale <= 1.5) {
        this.zjPulseMesh.material.opacity = (scale - 1) * 2
      } else if (scale > 1.5 && scale <= 2) {
        this.zjPulseMesh.material.opacity = 1 - (scale - 1.5) * 2
      } else {
        this.zjPulseMesh.userData['scale'] = 1
      }
    }
  }

  updateSize(width, height) {
    let w = width || this.option.width
    let h = height || this.option.height
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  updateData(data) {
    if (!this.earth.group) return
    this.scene.remove(this.earth.group)
    this.earth.group.traverse((obj) => {
      if (obj.type === 'Mesh') {
        obj.geometry.dispose()
        obj.material.dispose()
      }
    })
    this.createEarth(data)
  }
}
