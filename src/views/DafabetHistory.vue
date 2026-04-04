<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDafabetStore, useShuangseqiuStore, useChaojidaletouStore } from '@/stores/counter'
import HistoryTable from '@/components/HistoryTable.vue'
import { ElMessage } from 'element-plus'

const dafabetStore = useDafabetStore()
const shuangseqiuStore = useShuangseqiuStore()
const chaojidaletouStore = useChaojidaletouStore()

const { dafabetDatabase } = storeToRefs(dafabetStore)
const { kjxx: shuangseqiuKjxx } = storeToRefs(shuangseqiuStore)
const { kjxx: chaojidaletouKjxx } = storeToRefs(chaojidaletouStore)

let activeName = ref('shuangseqiu')

// dafabetDatabase, shuangseqiuKjxx, chaojidaletouKjxx api 在 counter.js 中已经初始化请求了，组件加载时直接使用 store 中的数据进行计算和展示
// 组件加载时只需等待 dafabetDatabase, shuangseqiuKjxx, chaojidaletouKjxx api 请求完成后再进行数据处理，避免数据未准备好时进行计算导致错误
onMounted(() => {
  Promise.all([dafabetStore.fetchData({ RequestType: 'query' }), shuangseqiuStore.increment(), chaojidaletouStore.increment()]).then(() => {
    updateDafabetStore()
  })
})

const databaseComputed = computed(() => {
  for (const key in dafabetDatabase.value) {
    // 安全检查：确保数据是数组，否则跳过处理
    if (!Array.isArray(dafabetDatabase.value[key])) {
      console.warn(`数据结构错误: ${key} 不是数组, 获得:`, dafabetDatabase.value[key])
      continue
    }

    dafabetDatabase.value[key].forEach((element) => {
      const 开奖号码Array = (element.开奖号码 || '')
        .split(',')
        .filter((item) => item !== '')
        .map((num) => num.trim().padStart(2, 0))
      const 号码Array = (element.号码 || '')
        .split(',')
        .filter((item) => item !== '')
        .map((num) => num.trim().padStart(2, 0))

      if (key === 'shuangseqiu') {
        element.开奖号码红球 = 开奖号码Array.slice(0, 6)
        element.开奖号码蓝球 = 开奖号码Array.slice(6)
        element.号码红球 = 号码Array.slice(0, 6)
        element.号码蓝球 = 号码Array.slice(6)
      } else if (key === 'chaojidaletou') {
        element.开奖号码红球 = 开奖号码Array.slice(0, 5)
        element.开奖号码蓝球 = 开奖号码Array.slice(5)
        element.号码红球 = 号码Array.slice(0, 5)
        element.号码蓝球 = 号码Array.slice(5)
      }
    })
  }

  return dafabetDatabase.value
})

const shuangseqiuHistoryObject = computed(() => {
  return {
    activeName: activeName.value,
    tableData: databaseComputed.value.shuangseqiu,
    addGroupBall,
    editGroupBall,
    deleteGroupBall
  }
})
const chaojidaletouHistoryObject = computed(() => {
  return {
    activeName: activeName.value,
    tableData: databaseComputed.value.chaojidaletou,
    addGroupBall,
    editGroupBall,
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
    return normalizeBall(`${row.red || ''},${row.blue || ''}`).join(', ')
  }

  if (key === 'chaojidaletou') {
    return normalizeBall(row.lotteryDrawResult || '', /\s+/).join(', ')
  }

  return ''
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
  { type: 2, group: 301, ruleArray: ['5 + 1'] },
  { type: 3, group: 501, ruleArray: ['5 + 0'] },
  { type: 4, group: 601, ruleArray: ['4 + 2'] },
  { type: 5, group: 701, ruleArray: ['4 + 1'] },
  { type: 6, group: 801, ruleArray: ['3 + 2'] },
  { type: 7, group: 901, ruleArray: ['4 + 0'] },
  { type: 8, group: 1001, ruleArray: ['3 + 1', '2 + 2'] },
  { type: 9, group: 1101, ruleArray: ['3 + 0', '2 + 1', '1 + 2', '0 + 2'] }
]

function calcSsqPrize(row, ticketNumbers, multiplier = 1) {
  if (!row || !ticketNumbers) return null

  const winningReds = normalizeBall(row.red || '')
  const winningBlues = normalizeBall(row.blue || '')
  const ticketBalls = normalizeBall(ticketNumbers, /[\s,]+/)
  const ticketReds = ticketBalls.slice(0, 6)
  const ticketBlues = ticketBalls.slice(6)

  if (ticketReds.length < 6 || ticketBlues.length < 1) return 0

  const redCount = ticketReds.filter((num) => winningReds.includes(num)).length
  const blueCount = ticketBlues.filter((num) => winningBlues.includes(num)).length
  const digitalCombination = `${redCount} + ${blueCount}`

  const ruleIndex = ssqPrizeRules.findIndex((item) => item.ruleArray.includes(digitalCombination))
  const prizeEntry = (row.prizegrades || [])[ruleIndex]
  if (!prizeEntry || !prizeEntry.typemoney) return 0

  return Number(prizeEntry.typemoney) * multiplier
}

function calcCjdltPrize(row, ticketNumbers, multiplier = 1, append = false) {
  if (!row || !ticketNumbers) return null

  const drawBalls = normalizeBall(row.lotteryDrawResult || '', /\s+/)
  const winningReds = drawBalls.slice(0, 5)
  const winningBlues = drawBalls.slice(5)
  const ticketBalls = normalizeBall(ticketNumbers, /[\s,]+/)
  const ticketReds = ticketBalls.slice(0, 5)
  const ticketBlues = ticketBalls.slice(5)

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
    shuangseqiu: shuangseqiuKjxx.value,
    chaojidaletou: chaojidaletouKjxx.value
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

      const drawDate = key === 'shuangseqiu' ? source.date : source.lotteryDrawTime
      const drawResult = buildDrawResult(source, key)
      const multiplier = Number(record.倍数) || 1
      const payload = {}

      if (drawDate && !record.开奖日期) {
        payload.开奖日期 = drawDate
      }
      if (drawResult && !record.开奖号码) {
        payload.开奖号码 = drawResult
      }

      if (record.号码) {
        const prize = key === 'shuangseqiu' ? calcSsqPrize(source, record.号码, multiplier) : calcCjdltPrize(source, record.号码, multiplier, false)

        if (prize !== null && prize > 0 && !record.中奖金额) {
          payload.中奖金额 = String(prize)
        }
      }

      if (Object.keys(payload).length === 0) return

      Object.assign(record, payload)

      updateRequests.push({
        dafafetName: key,
        期号: record.期号,
        开奖日期: payload.开奖日期,
        开奖号码: payload.开奖号码,
        中奖金额: payload.中奖金额
      })
    })
  })

  if (!updateRequests.length) {
    return Promise.resolve()
  }

  return dafabetStore.fetchData({
    RequestType: 'update',
    groupBall: updateRequests
  })
}

function addGroupBall(params) {
  const addBallArray = []

  for (let index = 0; index < params.serial; index++) {
    addBallArray.push({
      期号: Number(params.phase) + index,
      开奖日期: '',
      开奖号码: '',
      号码: [].concat(params.redBallArray, params.blueBallArray).join(', '),
      倍数: params.multiplying,
      中奖金额: ''
    })
  }

  dafabetStore
    .fetchData({
      RequestType: 'add',
      dafafetName: activeName.value,
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
      dafafetName: activeName.value,
      期号: params.期号
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

function editGroupBall(params) {
  dafabetStore
    .fetchData({
      RequestType: 'edit',
      dafafetName: activeName.value,
      groupBall: [].concat(params.号码红球, params.号码蓝球).join(', '),
      phase: params.期号
    })
    .then(() => {
      ElMessage({
        type: 'success',
        message: '编辑成功！'
      })
    })
    .catch(() => {
      ElMessage({
        type: 'error',
        message: '编辑失败，请重试！'
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
