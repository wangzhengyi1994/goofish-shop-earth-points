import Earth from './Earth'
import { Resources } from './Resources'
import {Basic} from './Basic'

export default class World {
  constructor(option) {
    this.option = option
    this.basic = new Basic(option.dom)
    this.scene = this.basic.scene
    this.renderer = this.basic.renderer
    this.controls = this.basic.controls
    this.camera = this.basic.camera
    this.updateSize()
    this.resources = new Resources(async () => {
      await this.createEarth()
      // 开始渲染
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
          startColor: 0xe4007f, // 起点颜色
          endColor: 0xffffff // 终点颜色
        }
      },
      flyLine: {
        color: 0xf3ae76, // 飞线的颜色
        flyLineColor: 0xff7714, // 飞行线的颜色
        speed: 0.004 // 拖尾飞线的速度
      }
    })

    this.scene.add(this.earth.group)
    await this.earth.init()
  }

  render() {
    requestAnimationFrame(this.render.bind(this))
    this.renderer.render(this.scene, this.camera)
    this.controls && this.controls.update()
    this.earth && this.earth.render()
  }

  // 更新
  updateSize(width, height) {
    let w = width || this.option.width
    let h = height || this.option.height

    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

// 数据更新重新渲染
  updateData(data) {
    if (!this.earth.group) return
    // 先删除旧的
    this.scene.remove(this.earth.group)
    // 递归遍历组对象group释放所有后代网格模型绑定几何体占用内存
    this.earth.group.traverse((obj) => {
      if (obj.type === 'Mesh') {
        obj.geometry.dispose()
        obj.material.dispose()
      }
    })
    // 重新创建
    this.createEarth(data)
  }
}
