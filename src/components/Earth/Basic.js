import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export class Basic {
  constructor(dom) {
    this.dom = dom
    this.initScenes()
    this.setControls()
  }

  /**
   * 初始化场景
   */
  initScenes() {
    this.scene = new THREE.Scene()

    const w = this.dom.offsetWidth || window.innerWidth
    const h = this.dom.offsetHeight || window.innerHeight

    this.camera = new THREE.PerspectiveCamera(45, w / h, 1, 100000)
    this.camera.position.set(0, 30, -200)

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(w, h)
    this.dom.appendChild(this.renderer.domElement)
  }

  /**
   * 设置控制器
   */
  setControls() {
    // 鼠标控制      相机，渲染dom
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.controls.autoRotateSpeed = 3
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    this.controls.enableDamping = true
    // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
    this.controls.dampingFactor = 0.05
    // 是否可以缩放
    this.controls.enableZoom = true
    // 设置相机距离原点的最远距离
    this.controls.minDistance = 100
    // 设置相机距离原点的最远距离
    this.controls.maxDistance = 300
    // 是否开启右键拖拽
    this.controls.enablePan = false
  }
}
