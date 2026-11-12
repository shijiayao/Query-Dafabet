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

export const useDafabetStore = defineStore('DafabetStore', () => {
  // 初始化数据结构，确保有默认的数组格式
  const dafabetDatabase = ref({
    shuangseqiu: [],
    chaojidaletou: []
  })

  function increment(params = {}) {
    const defaultParams = {
      RequestType: 'query',
      ...params
    }

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
  increment()

  return { dafabetDatabase, increment }
})

export const useCrawlerDrawStore = defineStore('CrawlerDrawStore', () => {
  const crawlerDatabase = ref({
    kjxx_shuangseqiu: [],
    kjxx_chaojidaletou: []
  })

  function increment() {
    fetch('/api/crawler/draw')
      .then((response) => response.json())
      .then((data) => {
        crawlerDatabase.value = data
      })
  }

  increment()

  return { crawlerDatabase, increment }
})
