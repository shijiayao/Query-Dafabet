<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDafabetStore } from '@/stores/counter'
import HistoryTable from '@/components/HistoryTable.vue'
import { ElMessage } from 'element-plus'

const store = useDafabetStore()

const { dafabetDatabase } = storeToRefs(store)

let activeName = ref('shuangseqiu')

// 初始化数据，组件挂载时获取最新数据
onMounted(() => {
  store.fetchData({
    RequestType: 'query'
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

/**
 * 准备几个事件函数给组建 HistoryTable使用，包含添加、编辑、删除等功能
 * 这些函数的具体实现可以根据实际需求来编写，目前只是提供了函数
 */
function addGroupBall(params) {
  const addBallArray = []

  for (let index = 0; index < params.serial; index++) {
    addBallArray.push({
      期号: Number(params.phase) + index,
      开奖日期: '',
      开奖号码: '',
      号码: [].concat(params.redBallArray, params.blueBallArray).join(', '),
      倍数: params.multiplying
    })
  }

  store
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

function editGroupBall(row) {
  // Implementation for editing group ball
  console.log('Editing group ball with the following details:', row)
}

function deleteGroupBall(row) {
  store
    .fetchData({
      RequestType: 'delete',
      dafafetName: activeName.value,
      groupBall: row
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
