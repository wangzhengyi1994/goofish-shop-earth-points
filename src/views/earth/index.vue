<template>
  <div class="dashboard">
    <!-- 星空粒子背景 canvas -->
    <canvas ref="starCanvasRef" class="star-bg"></canvas>

    <!-- 顶部标题栏 -->
    <m-header title="九章智算云 AlayaNeW 算力全景" sub-text="AlayaNeW Computing Power Panorama">
      <template v-slot:left>
        <div class="m-header-weather"><span>晴</span><span>18℃</span></div>
      </template>
      <template v-slot:right>
        <div class="m-header-date"><span>{{ currentTime }}</span></div>
      </template>
    </m-header>

    <!-- 主体内容 -->
    <div class="main">
      <!-- 左侧图表面板 -->
      <div class="left-wrap">
        <div class="left-wrap-3d">
          <BulkCommoditySalesChart></BulkCommoditySalesChart>
          <YearlyEconomyTrend></YearlyEconomyTrend>
          <EconomicTrendChart></EconomicTrendChart>
          <DistrictEconomicIncome></DistrictEconomicIncome>
        </div>
      </div>

      <!-- 中间地球区域 -->
      <section class="center-section">
        <div class="earth-container" ref="chartRef"></div>
        <!-- 浙江省点位提示 -->
        <div class="zj-tooltip" v-show="zjTooltip.visible" :style="{ left: zjTooltip.x + 'px', top: zjTooltip.y + 'px' }">
          <span>浙江省</span>
          <small>点击进入</small>
        </div>
        <!-- 底部数据指标卡片 -->
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

      <!-- 右侧图表面板 -->
      <div class="right-wrap">
        <div class="right-wrap-3d">
          <PurposeSpecialFunds></PurposeSpecialFunds>
          <ProportionPopulationConsumption></ProportionPopulationConsumption>
          <ElectricityUsage></ElectricityUsage>
          <QuarterlyGrowthSituation></QuarterlyGrowthSituation>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import World from '@/components/Earth/World.js'
import { earth } from '@/config/dataset.js'
import throttle from 'lodash/throttle'
import mHeader from '@/components/mHeader/index.vue'
import BulkCommoditySalesChart from '@/views/gdMap/components/BulkCommoditySalesChart.vue'
import YearlyEconomyTrend from '@/views/gdMap/components/YearlyEconomyTrend.vue'
import EconomicTrendChart from '@/views/gdMap/components/EconomicTrendChart.vue'
import DistrictEconomicIncome from '@/views/gdMap/components/DistrictEconomicIncome.vue'
import PurposeSpecialFunds from '@/views/gdMap/components/PurposeSpecialFunds.vue'
import ProportionPopulationConsumption from '@/views/gdMap/components/ProportionPopulationConsumption.vue'
import ElectricityUsage from '@/views/gdMap/components/ElectricityUsage.vue'
import QuarterlyGrowthSituation from '@/views/gdMap/components/QuarterlyGrowthSituation.vue'

const router = useRouter()
const chartRef = ref()
const starCanvasRef = ref()
let threeClassInstance
let starAnimationId

const zjTooltip = reactive({ visible: false, x: 0, y: 0 })

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
      color: Math.random() < 0.6
        ? `rgba(180,210,255,`
        : Math.random() < 0.5
          ? `rgba(255,255,255,`
          : `rgba(255,220,180,`
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
    height: chartRef.value.offsetHeight,
    onZhejiangClick: () => {
      router.push('/zhejiang')
    },
    onZhejiangHover: (screenPos) => {
      if (screenPos) {
        const rect = chartRef.value.getBoundingClientRect()
        zjTooltip.x = screenPos.x - rect.left
        zjTooltip.y = screenPos.y - rect.top - 60
        zjTooltip.visible = true
      } else {
        zjTooltip.visible = false
      }
    }
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
})
</script>

<style lang="scss">
@import "@/assets/style/font.scss";

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

.star-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.dashboard .m-header {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.m-header-weather,
.m-header-date {
  span {
    padding-right: 10px;
    color: #c4f3fe;
    font-size: 14px;
  }
}

.main {
  flex: 1;
  display: flex;
  position: relative;
  z-index: 5;
  min-height: 0;
}

// 左侧图表面板
.left-wrap {
  width: 398px;
  flex-shrink: 0;
  padding: 10px 0 10px 32px;
  z-index: 10;
  perspective: 500px;
  perspective-origin: 50% 50%;
  pointer-events: none;

  &-3d {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    transform: translate3d(0, 0, 0) rotateY(6deg);

    .left-card {
      flex: 1;
      margin-bottom: 8px;
      pointer-events: all;
    }
  }
}

// 右侧图表面板
.right-wrap {
  width: 398px;
  flex-shrink: 0;
  padding: 10px 32px 10px 0;
  z-index: 10;
  perspective: 800px;
  perspective-origin: 50% 50%;
  pointer-events: none;

  &-3d {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    transform: translate3d(0, 0, 0) rotateY(-6deg);

    .right-card {
      flex: 1;
      margin-bottom: 8px;
      pointer-events: all;
    }
  }
}

// 中间地球区域
.center-section {
  flex: 1;
  position: relative;
  min-width: 0;
  z-index: 5;
}

.earth-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

// 浙江省 tooltip
.zj-tooltip {
  position: absolute;
  z-index: 20;
  pointer-events: none;
  background: rgba(10, 30, 60, 0.85);
  border: 1px solid rgba(67, 200, 255, 0.6);
  border-radius: 6px;
  padding: 6px 14px;
  text-align: center;
  transform: translateX(-50%);
  span { display: block; font-size: 14px; color: #43c8ff; font-weight: bold; }
  small { display: block; font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgba(67, 200, 255, 0.6);
  }
}

// 底部数据指标卡片
.data-cards {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  z-index: 10;
}

.data-card {
  background: rgba(10, 30, 60, 0.6);
  border: 1px solid rgba(67, 144, 209, 0.3);
  border-radius: 6px;
  padding: 10px 20px;
  min-width: 140px;
  backdrop-filter: blur(8px);
  text-align: center;
  .card-label { font-size: 11px; color: rgba(255, 255, 255, 0.6); margin-bottom: 4px; }
  .card-value {
    .value-num { font-size: 22px; font-weight: bold; background: linear-gradient(180deg, #e8a54b 0%, #f0c87a 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 1px; }
    .value-unit { font-size: 12px; color: #e8a54b; margin-left: 2px; }
  }
}
</style>
