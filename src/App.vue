<template>
  <div class="dashboard">
    <!-- 星空粒子背景 canvas -->
    <canvas ref="starCanvasRef" class="star-bg"></canvas>

    <!-- 顶部标题栏 -->
    <header class="header">
      <div class="header-line"></div>
      <h1 class="header-title">九章智算云 AlayaNeW 算力全景</h1>
      <span class="header-time">{{ currentTime }}</span>
    </header>

    <!-- 主体内容 -->
    <div class="main">
      <!-- 左侧面板 -->
      <aside class="left-panel">
        <div class="glass-card">
          <div class="company-header">
            <h2 class="company-name">DataCanvas</h2>
            <p class="company-sub">九章云极</p>
          </div>
          <p class="company-desc">
            领先的人工智能基础设施与智算云提供商，构建完整的AIDC技术栈、智算操作系统及产业链。旗下九章智算云、九章智算操作系统等品牌，面向AI训练与推理提供高性能计算、云服务及AI软件，赋能广大开发者与企业客户。
          </p>
          <div class="tags">
            <div class="tag-item">
              <span class="tag-icon">◎</span>
              <span>国家专精特新重点"小巨人"企业</span>
            </div>
            <div class="tag-item">
              <span class="tag-icon">◎</span>
              <span>普惠算力倡导者</span>
            </div>
            <div class="tag-item">
              <span class="tag-icon">◎</span>
              <span>首个算力按"度"计量标准</span>
            </div>
            <div class="tag-item">
              <span class="tag-icon">◎</span>
              <span>全球首个强化学习云平台</span>
            </div>
          </div>

          <div class="cloud-diagram">
            <div class="diagram-layers">
              <div class="layer layer-top">
                <span class="layer-label">1度电（1千瓦时耗电量）</span>
              </div>
              <div class="layer layer-mid">
                <span class="layer-label">1度水（1立方米水）</span>
              </div>
              <div class="layer layer-bottom">
                <span class="layer-label">1度燃气（1立方米天然气）</span>
              </div>
            </div>
            <div class="diagram-arrow">
              <div class="arrow-body">
                <span class="arrow-text">1度算力</span>
                <span class="arrow-sub">1算力=312TFlops·小时</span>
              </div>
            </div>
            <div class="diagram-cloud">
              <span class="cloud-text">智算云</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右侧地球区域 -->
      <section class="right-section">
        <div class="earth-container" ref="chartRef"></div>
        <!-- 数据指标卡片 -->
        <div class="data-cards">
          <div class="data-card" v-for="item in metrics" :key="item.label">
            <div class="card-label">{{ item.label }}</div>
            <div class="card-value">
              <span class="value-num">{{ item.value }}</span>
              <span class="value-unit" v-if="item.unit">{{ item.unit }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import World from '@/components/Earth/World.js'
import { earth } from '@/config/dataset.js'
import throttle from 'lodash/throttle'

const chartRef = ref()
const starCanvasRef = ref()
let threeClassInstance
let starAnimationId

const metrics = reactive([
  { label: '智算中心数量', value: '10+', unit: '' },
  { label: '覆盖地区', value: '10+', unit: '' },
  { label: '算力规模', value: '10,000', unit: 'P+' },
  { label: 'AI开发者', value: '1000,000+', unit: '' },
  { label: 'IP资产', value: '400+', unit: '' }
])

// 当前时间
const currentTime = ref('')
let timeTimer

function updateTime() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${y}-${m}-${d} ${h}:${min}:${s}`
}

// 星空背景
function initStarField() {
  const canvas = starCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let w = canvas.width = window.innerWidth
  let h = canvas.height = window.innerHeight

  const stars = []
  const starCount = 1200

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.0008 + 0.0002,
      phase: Math.random() * Math.PI * 2,
      // 颜色偏蓝白
      color: Math.random() < 0.6
        ? `rgba(180,210,255,` // 蓝白
        : Math.random() < 0.5
          ? `rgba(255,255,255,` // 纯白
          : `rgba(255,220,180,`  // 暖黄
    })
  }

  function drawStars(time) {
    ctx.clearRect(0, 0, w, h)
    stars.forEach(s => {
      const flicker = Math.sin(time * s.speed * 1000 + s.phase) * 0.3 + 0.7
      const a = s.alpha * flicker
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = s.color + a + ')'
      ctx.fill()
    })
    starAnimationId = requestAnimationFrame(drawStars)
  }

  starAnimationId = requestAnimationFrame(drawStars)

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight
  })
}

function init() {
  threeClassInstance = new World({
    dom: chartRef.value,
    data: earth,
    width: chartRef.value.offsetWidth,
    height: chartRef.value.offsetHeight
  })

  window.addEventListener('resize', throttle(() => {
    if (chartRef.value && threeClassInstance) {
      threeClassInstance.updateSize(chartRef.value.offsetWidth, chartRef.value.offsetHeight)
    }
  }, 100))
}

onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
  initStarField()
  init()
})

onUnmounted(() => {
  clearInterval(timeTimer)
  cancelAnimationFrame(starAnimationId)
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped lang="scss">
.dashboard {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #020a18 0%, #0a1628 40%, #0d1f3c 70%, #081430 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  color: #fff;
}

// 星空背景
.star-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

// 顶部
.header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  flex-shrink: 0;
  padding: 0 40px;

  .header-line {
    position: absolute;
    bottom: 0;
    left: 5%;
    right: 5%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(67, 144, 209, 0.6), rgba(67, 144, 209, 0.8), rgba(67, 144, 209, 0.6), transparent);
  }

  .header-title {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: 6px;
    background: linear-gradient(180deg, #fff 0%, #8ec5e8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
  }

  .header-time {
    position: absolute;
    right: 40px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 1px;
  }
}

// 主体
.main {
  flex: 1;
  display: flex;
  position: relative;
  z-index: 5;
  min-height: 0;
}

// 左侧面板
.left-panel {
  width: 420px;
  flex-shrink: 0;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.glass-card {
  flex: 1;
  background: rgba(10, 30, 60, 0.55);
  border: 1px solid rgba(67, 144, 209, 0.25);
  border-radius: 8px;
  padding: 28px 24px;
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
}

.company-header {
  margin-bottom: 14px;

  .company-name {
    font-size: 24px;
    font-weight: bold;
    font-style: italic;
    color: #fff;
    margin: 0;
  }

  .company-sub {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.7);
    margin: 4px 0 0 0;
    letter-spacing: 3px;
  }
}

.company-desc {
  font-size: 13px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.65);
  margin: 0 0 20px 0;
}

.tags {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  margin-bottom: 24px;

  .tag-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);

    .tag-icon {
      color: #e8a54b;
      font-size: 14px;
    }
  }
}

.cloud-diagram {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: auto;
  padding-top: 16px;

  .diagram-layers {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .layer {
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);

      &.layer-top {
        background: rgba(232, 165, 75, 0.2);
        border: 1px solid rgba(232, 165, 75, 0.4);
      }

      &.layer-mid {
        background: rgba(67, 144, 209, 0.2);
        border: 1px solid rgba(67, 144, 209, 0.4);
      }

      &.layer-bottom {
        background: rgba(180, 80, 80, 0.2);
        border: 1px solid rgba(180, 80, 80, 0.4);
      }
    }
  }

  .diagram-arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 14px;
    background: rgba(232, 165, 75, 0.15);
    border: 1px solid rgba(232, 165, 75, 0.35);
    border-radius: 8px;

    .arrow-text {
      font-size: 14px;
      font-weight: bold;
      color: #e8a54b;
    }

    .arrow-sub {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 4px;
    }
  }

  .diagram-cloud {
    padding: 14px 20px;
    background: linear-gradient(135deg, rgba(232, 165, 75, 0.25), rgba(232, 165, 75, 0.1));
    border: 1px solid rgba(232, 165, 75, 0.5);
    border-radius: 8px;

    .cloud-text {
      font-size: 20px;
      font-weight: bold;
      color: #e8a54b;
      letter-spacing: 4px;
    }
  }
}

// 右侧
.right-section {
  flex: 1;
  position: relative;
  min-width: 0;
}

.earth-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

// 数据卡片
.data-cards {
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 10;
}

.data-card {
  background: rgba(10, 30, 60, 0.5);
  border: 1px solid rgba(67, 144, 209, 0.3);
  border-radius: 6px;
  padding: 12px 24px;
  min-width: 180px;
  backdrop-filter: blur(8px);
  text-align: right;

  .card-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 4px;
  }

  .card-value {
    .value-num {
      font-size: 26px;
      font-weight: bold;
      background: linear-gradient(180deg, #e8a54b 0%, #f0c87a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 1px;
    }

    .value-unit {
      font-size: 14px;
      color: #e8a54b;
      margin-left: 2px;
    }
  }
}
</style>
