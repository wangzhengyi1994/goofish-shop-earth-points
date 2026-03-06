/**
 * 资源文件
 * 把模型和图片分开进行加载
 */

const textures = []

const modules = import.meta.glob("./images/earth/*", { eager: true })

for(let item in modules) {
  const n = item.split('/').pop()
  if(n) {
    textures.push({
      name: n.split('.')[0],
      url: modules[item].default
    })
  }
}

const resources = {
  textures
}

export { resources }
