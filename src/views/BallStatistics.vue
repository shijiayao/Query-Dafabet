<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import StatisticsProgress from '@/components/StatisticsProgress.vue'
import { useShuangseqiuStore, useChaojidaletouStore } from '@/stores/counter'

const ssqStore = useShuangseqiuStore()
const cjdltStore = useChaojidaletouStore()

const { kjxx: ssqKjxx } = storeToRefs(ssqStore)
const { kjxx: cjdltKjxx } = storeToRefs(cjdltStore)

let activeName = ref('ssq')

const ssqStatisticsObject = computed(() => {
  let redTotal = 0
  let blueTotal = 0
  const result = ssqKjxx.value.reduce(
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
  const result = cjdltKjxx.value.reduce(
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
