<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDafabetStore, useCrawlerDrawStore } from '@/stores/counter'
import HistoryTable from '@/components/HistoryTable.vue'
import { ElMessage } from 'element-plus'

const dafabetStore = useDafabetStore()
const crawlerDrawStore = useCrawlerDrawStore()

const { dafabetDatabase } = storeToRefs(dafabetStore)
const { crawlerDatabase } = storeToRefs(crawlerDrawStore)

let activeName = ref('shuangseqiu')

watch(
  () => [dafabetStore.dafabetDatabase, crawlerDrawStore.crawlerDatabase],
  ([dafabetDatabase, crawlerDatabase]) => {
    if (dafabetDatabase.shuangseqiu.length > 0 && crawlerDatabase.kjxx_shuangseqiu.length > 0) {
      updateDafabetStore()
    }
  },
  { immediate: true }
)

const databaseComputed = computed(() => {
  for (const key in dafabetDatabase.value) {
    // 安全检查：确保数据是数组，否则跳过处理
    if (!Array.isArray(dafabetDatabase.value[key])) {
      console.warn(`数据结构错误: ${key} 不是数组, 获得:`, dafabetDatabase.value[key])
      continue
    }
  }

  return dafabetDatabase.value
})

const shuangseqiuHistoryObject = computed(() => {
  return {
    activeName: activeName.value,
    tableData: databaseComputed.value.shuangseqiu,
    addGroupBall,
    deleteGroupBall
  }
})
const chaojidaletouHistoryObject = computed(() => {
  return {
    activeName: activeName.value,
    tableData: databaseComputed.value.chaojidaletou,
    addGroupBall,
    deleteGroupBall
  }
})

function normalizeBall(value, separator = /[\s,]+/) {
  return String(value || '')
    .split(separator)
    .filter((item) => item !== '')
    .map((num) => num.trim().padStart(2, '0'))
}

function buildDrawResult(row, key) {
  if (!row) return ''

  if (key === 'shuangseqiu') {
    return normalizeBall(`${row.red || ''},${row.blue || ''}`)
  }

  if (key === 'chaojidaletou') {
    return normalizeBall(row.lotteryDrawResult || '', /\s+/)
  }

  return []
}

const ssqPrizeRules = [
  { ruleArray: ['6 + 1'] },
  { ruleArray: ['6 + 0'] },
  { ruleArray: ['5 + 1'] },
  { ruleArray: ['5 + 0', '4 + 1'] },
  { ruleArray: ['4 + 0', '3 + 1'] },
  { ruleArray: ['2 + 1', '1 + 1', '0 + 1'] }
]

const cjdltPrizeRules = [
  { type: 1, group: 101, ruleArray: ['5 + 2'] },
  { type: 2, group: 201, ruleArray: ['5 + 1'] },
  { type: 3, group: 301, ruleArray: ['5 + 0'] },
  { type: 4, group: 401, ruleArray: ['4 + 2'] },
  { type: 5, group: 501, ruleArray: ['4 + 1'] },
  { type: 6, group: 601, ruleArray: ['3 + 2'] },
  { type: 7, group: 701, ruleArray: ['4 + 0'] },
  { type: 8, group: 801, ruleArray: ['3 + 1', '2 + 2'] },
  { type: 9, group: 901, ruleArray: ['3 + 0', '2 + 1', '1 + 2', '0 + 2'] },
  { type: 10, group: 0, ruleArray: [] }
]

function calcSsqPrize(row, ticketReds, ticketBlues, multiplier = 1) {
  if (!row || ticketReds.length === 0 || ticketBlues.length === 0) return null

  const winningReds = normalizeBall(row.red || '')
  const winningBlues = normalizeBall(row.blue || '')

  if (ticketReds.length < 6 || ticketBlues.length < 1) return 0

  const redCount = ticketReds.filter((num) => winningReds.includes(num)).length
  const blueCount = ticketBlues.filter((num) => winningBlues.includes(num)).length
  const digitalCombination = `${redCount} + ${blueCount}`

  const ruleIndex = ssqPrizeRules.findIndex((item) => item.ruleArray.includes(digitalCombination))
  const prizeEntry = (row.prizegrades || [])[ruleIndex]
  if (!prizeEntry || !prizeEntry.typemoney) return 0

  return Number(prizeEntry.typemoney) * multiplier
}

function calcCjdltPrize(row, ticketReds, ticketBlues, multiplier = 1, append = false) {
  if (!row || ticketReds.length === 0 || ticketBlues.length === 0) return null

  const drawBalls = normalizeBall(row.lotteryDrawResult || '', /\s+/)
  const winningReds = drawBalls.slice(0, 5)
  const winningBlues = drawBalls.slice(5)

  if (ticketReds.length < 5 || ticketBlues.length < 2) return 0

  const redCount = ticketReds.filter((num) => winningReds.includes(num)).length
  const blueCount = ticketBlues.filter((num) => winningBlues.includes(num)).length
  const digitalCombination = `${redCount} + ${blueCount}`

  const rule = cjdltPrizeRules.find((item) => item.ruleArray.includes(digitalCombination))
  if (!rule) return 0

  const prizeItem = (row.prizeLevelList || []).find((item) => Number(item.group) === Number(rule.group))
  if (!prizeItem || !prizeItem.stakeAmountFormat) return 0

  let preTaxMoney = Number(prizeItem.stakeAmountFormat)
  if (append && (rule.type === 1 || rule.type === 2)) {
    preTaxMoney += parseInt(preTaxMoney * 0.8, 10)
  }

  return preTaxMoney * multiplier
}

function updateDafabetStore() {
  const sourceData = {
    shuangseqiu: crawlerDatabase.value.kjxx_shuangseqiu.map((elemment) => {
      return {
        id: elemment.id,
        ...elemment.detailed_content
      }
    }),
    chaojidaletou: crawlerDatabase.value.kjxx_chaojidaletou.map((elemment) => {
      return {
        id: elemment.id,
        ...elemment.detailed_content
      }
    })
  }

  const updateRequests = []

  Object.entries(dafabetDatabase.value).forEach(([key, records]) => {
    if (!Array.isArray(records)) return

    const lookup = new Map()
    ;(sourceData[key] || []).forEach((item) => {
      const phase = key === 'shuangseqiu' ? item.code : item.lotteryDrawNum
      if (phase !== undefined && phase !== null && phase !== '') {
        lookup.set(String(phase), item)
      }
    })

    records.forEach((record) => {
      const phase = String(record.期号)
      const source = lookup.get(phase)
      if (!source) return

      const 号码长度 = key === 'shuangseqiu' ? 6 : 5
      const drawDate = key === 'shuangseqiu' ? source.date : source.lotteryDrawTime
      const drawResult = buildDrawResult(source, key)
      const multiplier = Number(record.倍数) || 1
      const payload = {}

      if (drawDate && !record.开奖日期) {
        payload.开奖日期 = drawDate
      }
      if (drawResult.length > 0 && record.开奖号码红球.length === 0 && record.开奖号码蓝球.length === 0) {
        payload.开奖号码红球 = drawResult.slice(0, 号码长度)
        payload.开奖号码蓝球 = drawResult.slice(号码长度)
      }

      if (record.投注号码红球.length > 0 && record.投注号码蓝球.length > 0) {
        const prize =
          key === 'shuangseqiu'
            ? calcSsqPrize(source, record.投注号码红球, record.投注号码蓝球, multiplier)
            : calcCjdltPrize(source, record.投注号码红球, record.投注号码蓝球, multiplier, false)

        if (prize !== null && prize > 0 && !record.中奖金额) {
          payload.中奖金额 = String(prize)
        }
      }

      if (Object.keys(payload).length === 0) return

      Object.assign(record, payload)

      updateRequests.push({
        dafafetName: key,
        id: record.id,
        期号: record.期号,
        开奖日期: payload.开奖日期,
        开奖号码红球: payload.开奖号码红球,
        开奖号码蓝球: payload.开奖号码蓝球,
        中奖金额: payload.中奖金额
      })
    })
  })

  if (!updateRequests.length) {
    return Promise.resolve()
  }

  return dafabetStore
    .increment({
      RequestType: 'update',
      groupBall: updateRequests
    })
    .then(() => {
      ElMessage({
        type: 'success',
        message: '更新开奖信息成功！'
      })
    })
    .catch(() => {
      ElMessage({
        type: 'error',
        message: '更新开奖信息失败，请检查！'
      })
    })
}

function addGroupBall(params) {
  const addBallArray = []

  for (let index = 0; index < params.serial; index++) {
    addBallArray.push({
      dafafetName: activeName.value,
      期号: Number(params.phase) + index,
      开奖日期: '',
      开奖号码: '',
      投注号码红球: params.redBallArray,
      投注号码蓝球: params.blueBallArray,
      倍数: params.multiplying,
      中奖金额: ''
    })
  }

  dafabetStore
    .fetchData({
      RequestType: 'add',
      groupBall: addBallArray
    })
    .then(() => {
      ElMessage({
        type: 'success',
        message: '添加成功！'
      })
    })
    .catch(() => {
      ElMessage({
        type: 'error',
        message: '添加失败，请重试！'
      })
    })
}

function deleteGroupBall(params) {
  dafabetStore
    .fetchData({
      RequestType: 'delete',
      groupBall: [
        {
          dafafetName: activeName.value,
          id: params.id
        }
      ]
    })
    .then(() => {
      ElMessage({
        type: 'success',
        message: '删除成功！'
      })
    })
    .catch(() => {
      ElMessage({
        type: 'error',
        message: '删除失败，请重试！'
      })
    })
}
</script>

<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="双色球" name="shuangseqiu">
      <HistoryTable :HistoryObject="shuangseqiuHistoryObject"></HistoryTable>
    </el-tab-pane>
    <el-tab-pane label="超级大乐透" name="chaojidaletou">
      <HistoryTable :HistoryObject="chaojidaletouHistoryObject"></HistoryTable>
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped lang="scss"></style>
