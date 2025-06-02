import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

function canshu(object) {
  let resultArray = []

  for (const key in object) {
    resultArray.push(`${key}=${object[key]}`)
  }

  return resultArray.join('&')
}

export const useShuangseqiuStore = defineStore('shuangseqiu', () => {
  const kjxx = ref([])
  function increment() {
    fetch(
      `/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?${canshu({
        name: 'ssq',
        issueCount: '',
        issueStart: '',
        issueEnd: '',
        dayStart: '',
        dayEnd: '',
        pageNo: 1,
        pageSize: 100,
        week: '',
        systemType: 'PC'
      })}`
    )
      .then((response) => response.json())
      .then((data) => {
        kjxx.value = data.result
      })
  }

  increment()

  return { kjxx, increment }
})

export const useChaojidaletouStore = defineStore('chaojidaletou', () => {
  const kjxx = ref([])
  function increment() {
    fetch(
      `https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?${canshu({
        gameNo: 85,
        provinceId: 0,
        pageSize: 100,
        isVerify: 1,
        pageNo: 1,
        termLimits: 100
      })}`
    )
      .then((response) => response.json())
      .then((data) => {
        kjxx.value = data.value.list
      })
  }

  increment()

  return { kjxx, increment }
})
