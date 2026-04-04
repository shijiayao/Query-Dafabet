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

export const useDafabetStore = defineStore('dafabetDatabase', () => {
  // 初始化数据结构，确保有默认的数组格式
  const dafabetDatabase = ref({
    shuangseqiu: [],
    chaojidaletou: []
  })

  function fetchData(params = {}) {
    const defaultParams = {
      RequestType: 'query',
      ...params
    }

    console.log(defaultParams)

    return fetch('/api/dafabet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(defaultParams)
    })
      .then((response) => response.json())
      .then((data) => {
        // 确保返回的数据格式正确
        if (data && typeof data === 'object') {
          dafabetDatabase.value = {
            shuangseqiu: Array.isArray(data.shuangseqiu) ? data.shuangseqiu : [],
            chaojidaletou: Array.isArray(data.chaojidaletou) ? data.chaojidaletou : [],
            ...data
          }
        }
        return data
      })
      .catch((error) => {
        console.error('API 请求失败:', error)
      })
  }

  // 初始化时调用
  fetchData()

  return { dafabetDatabase, fetchData }
})

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
      `/gateway/lottery/getHistoryPageListV1.qry?${canshu({
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
