<script setup>
import { ref, computed, watch } from 'vue'
import StatisticsProgress from '@/components/StatisticsProgress.vue'
import { useCrawlerDrawStore } from '@/stores/counter'

const crawlerDrawStore = useCrawlerDrawStore()

let kjxx_shuangseqiu = ref([])
let kjxx_chaojidaletou = ref([])

watch(
  () => [crawlerDrawStore.crawlerDatabase],
  ([crawlerDatabase]) => {
    if (crawlerDatabase.kjxx_shuangseqiu.length > 0) {
      kjxx_shuangseqiu.value = crawlerDatabase.kjxx_shuangseqiu.map((elemment) => {
        return {
          id: elemment.id,
          ...elemment.detailed_content
        }
      })
      kjxx_chaojidaletou.value = crawlerDatabase.kjxx_chaojidaletou.map((elemment) => {
        return {
          id: elemment.id,
          ...elemment.detailed_content
        }
      })
    }
  },
  { immediate: true }
)

let activeName = ref('ssq')

const ssqStatisticsObject = computed(() => {
  let redTotal = 0
  let blueTotal = 0
  const result = kjxx_shuangseqiu.value.reduce(
    (Statistics, element) => {
      const redBallArray = element.red.split(',')
      const blueBallArray = element.blue.split(',')

      redBallArray.forEach((element) => {
        redTotal++
        if (Statistics.redBall[element]) {
          Statistics.redBall[element]++
        } else {
          Statistics.redBall[element] = 1
        }
      })

      blueBallArray.forEach((element) => {
        blueTotal++
        if (Statistics.blueBall[element]) {
          Statistics.blueBall[element]++
        } else {
          Statistics.blueBall[element] = 1
        }
      })

      return Statistics
    },
    { redBall: {}, blueBall: {} }
  )

  return { redTotal, blueTotal, ...result }
})

const cjdltStatisticsObject = computed(() => {
  let redTotal = 0
  let blueTotal = 0
  const result = kjxx_chaojidaletou.value.reduce(
    (Statistics, element) => {
      const redBallArray = element.lotteryDrawResult.split(' ').slice(0, 5)
      const blueBallArray = element.lotteryDrawResult.split(' ').slice(5)

      redBallArray.forEach((element) => {
        redTotal++
        if (Statistics.redBall[element]) {
          Statistics.redBall[element]++
        } else {
          Statistics.redBall[element] = 1
        }
      })

      blueBallArray.forEach((element) => {
        blueTotal++
        if (Statistics.blueBall[element]) {
          Statistics.blueBall[element]++
        } else {
          Statistics.blueBall[element] = 1
        }
      })

      return Statistics
    },
    { redBall: {}, blueBall: {} }
  )

  return { redTotal, blueTotal, ...result }
})
</script>

<template>
  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane label="双色球" name="ssq">
      <StatisticsProgress :StatisticsObject="ssqStatisticsObject"></StatisticsProgress>
    </el-tab-pane>
    <el-tab-pane label="超级大乐透" name="cjdlt">
      <StatisticsProgress :StatisticsObject="cjdltStatisticsObject"></StatisticsProgress>
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped lang="scss"></style>
