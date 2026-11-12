<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCrawlerDrawStore } from '@/stores/counter'
import { toChineseNumber } from '@/utils/utils.js'

const crawlerDrawStore = useCrawlerDrawStore()

const { crawlerDatabase } = storeToRefs(crawlerDrawStore)
let kjxx_chaojidaletou = ref([])
const redBallArray = ref(['', '', '', '', '']) // 红球数组
const blueBallArray = ref(['', '']) // 蓝球数组
let multiplying = ref(5) // 倍数
let phase = ref('') // 期号
let serial = ref(3) // 连续几期
let appendValue = ref(true) // 追加

// 奖品等级
const prizegradesArray = ref([
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
])

function initValue() {
  kjxx_chaojidaletou.value = crawlerDatabase.value.kjxx_chaojidaletou.map((elemment) => {
    return {
      id: elemment.id,
      ...elemment.detailed_content
    }
  })
  redBallArray.value = ['', '', '', '', '']
  blueBallArray.value = ['', '']
}

watch(
  () => [crawlerDrawStore.crawlerDatabase],
  ([crawlerDatabase]) => {
    if (crawlerDatabase.kjxx_chaojidaletou.length > 0) {
      phase.value = crawlerDatabase.kjxx_chaojidaletou[0].detailed_content.code - 2

      initValue()
    }
  },
  { immediate: true }
)

function tableRowClassName_Phase(rowObject) {
  return Number(rowObject.row.lotteryDrawNum) >= Number(phase.value) && Number(rowObject.row.lotteryDrawNum) < Number(phase.value) + Number(serial.value)
    ? 'target-row'
    : ''
}

function isHitOrMiss(ball, row) {
  return row.includes(String(ball).padStart(2, 0)) ? '-hit' : '-miss'
}

function computePrizegradesObject(row) {
  const redBallTargetArray = row.lotteryDrawResult.split(' ').slice(0, 5)
  const blueBallTargetArray = row.lotteryDrawResult.split(' ').slice(5)
  const redBallCrossArray = [...new Set(redBallTargetArray.filter((it) => redBallArray.value.includes(it)))]
  const blueBallCrossArray = [...new Set(blueBallTargetArray.filter((it) => blueBallArray.value.includes(it)))]

  const digitalCombination = `${redBallCrossArray.length} + ${blueBallCrossArray.length}`
  let prizegradesIndex = prizegradesArray.value.findIndex((element) => element.ruleArray.includes(digitalCombination))

  prizegradesIndex = prizegradesIndex > -1 && prizegradesIndex < prizegradesArray.value.length ? prizegradesIndex : prizegradesArray.value.length - 1

  const type = prizegradesArray.value[prizegradesIndex].type
  const group = prizegradesArray.value[prizegradesIndex].group

  return {
    type,
    group,
    prizegradesIndex,
    digitalCombination,
    chineseLevel: `${toChineseNumber(type)}等奖`
  }
}

function computePrizegrades(row) {
  const resultObject = computePrizegradesObject(row)

  return `${resultObject.digitalCombination} ${resultObject.chineseLevel}`
}

function computeMoney(row) {
  const resultObject = computePrizegradesObject(row)

  let preTaxMoney = Number(row.prizeLevelList.filter((element) => Number(element.group) === Number(resultObject.group))[0]?.stakeAmountFormat ?? 0)

  if (appendValue.value && (resultObject.type === 1 || resultObject.type === 2)) {
    preTaxMoney += parseInt(preTaxMoney * 0.8)
  }

  const afterTaxMoney = preTaxMoney >= 10000 ? preTaxMoney * 0.8 : preTaxMoney

  return {
    preTaxMoney: preTaxMoney.toFixed(0) * multiplying.value,
    afterTaxMoney: afterTaxMoney.toFixed(0) * multiplying.value
  }
}
</script>

<template>
  <section>
    <el-tag>[ 每周 一、三、六 开奖 ]</el-tag>

    <section class="input-container">
      <el-input class="red-ball-input" v-model="redBallArray[index]" style="width: 40px" v-for="(item, index) in redBallArray" :key="index" />
      <el-tag type="info" size="large">+</el-tag>
      <el-input class="blue-ball-input" v-model="blueBallArray[index]" style="width: 40px" v-for="(item, index) in blueBallArray" :key="index" />
      <section class="param-group">
        <el-input v-model="multiplying" style="width: 130px">
          <template #prepend>倍数</template>
        </el-input>
      </section>
      <section class="param-group">
        <el-input v-model="phase" style="width: 150px">
          <template #prepend>期号</template>
        </el-input>
      </section>
      <section class="param-group">
        <el-input v-model="serial" style="width: 160px">
          <template #prepend>连续</template>
          <template #append>期</template>
        </el-input>
      </section>
      <section class="param-group">
        <el-switch v-model="appendValue" class="ml-2" inline-prompt active-text="追加" inactive-text="追加" />
      </section>
    </section>
  </section>

  <el-table :data="kjxx_chaojidaletou" stripe border style="width: 100%" class="cjdlt-el-table" :row-class-name="tableRowClassName_Phase">
    <el-table-column type="index" align="center" width="50" class-name="column-phase"></el-table-column>
    <el-table-column prop="lotteryDrawNum" label="期号" align="center" width="100" class-name="column-phase"></el-table-column>
    <el-table-column prop="lotteryDrawTime" label="开奖日期" align="center" width="140" class-name="column-phase"></el-table-column>
    <el-table-column prop="red" label="开奖号码" align="center" width="240">
      <template #default="scope">
        <ul class="ball-gurp">
          <li :class="index < 5 ? 'ball-item ball-red' : 'ball-item ball-blue'" v-for="(item, index) in scope.row.lotteryDrawResult.split(' ')" :key="item">
            {{ item }}
          </li>
        </ul>
      </template>
    </el-table-column>
    <el-table-column prop="red" label="中奖号码" align="center" width="240">
      <template #default="scope">
        <ul class="ball-gurp">
          <li
            class="ball-item"
            :class="'ball-red' + isHitOrMiss(item, scope.row.lotteryDrawResult.split(' ').slice(0, 5))"
            v-for="item in redBallArray"
            :key="item"
          >
            {{ item }}
          </li>
          <li
            class="ball-item"
            :class="'ball-blue' + isHitOrMiss(item, scope.row.lotteryDrawResult.split(' ').slice(5))"
            v-for="item in blueBallArray"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
      </template>
    </el-table-column>
    <el-table-column label="奖品等级" align="center" width="120">
      <template #default="scope">
        {{ computePrizegrades(scope.row) }}
      </template>
    </el-table-column>
    <el-table-column label="倍数" align="center" width="100">
      <template #default>
        {{ multiplying }}
      </template>
    </el-table-column>
    <el-table-column label="中奖金额" align="center" width="140">
      <template #default="scope">
        {{ computeMoney(scope.row).preTaxMoney }}
      </template>
    </el-table-column>
    <el-table-column label="扣税后金额" align="center" width="140">
      <template #default="scope">
        {{ computeMoney(scope.row).afterTaxMoney }}
      </template>
    </el-table-column>
    <el-table-column label="扣税后金额" align="center">
      <template #default="scope">
        {{ toChineseNumber(parseInt(computeMoney(scope.row).afterTaxMoney)) }}
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss">
.input-container {
  padding-top: 10px;
  display: flex;

  .red-ball-input {
    margin-right: 10px;
  }

  .blue-ball-input {
    margin-left: 10px;
  }

  .param-group {
    margin-left: 15px;
  }
}

.cjdlt-el-table {
  margin-top: 20px;

  :deep(.target-row) {
    .column-phase {
      color: red;
    }
  }

  .ball-gurp {
    display: flex;
    justify-content: space-between;

    .ball-item {
      width: 23px;
      height: 23px;
      text-align: center;
      color: #fff;
      border-radius: 50%;
      background-size: contain;
      background-repeat: no-repeat;
    }

    .ball-red {
      background-image: linear-gradient(180deg, #fe8a5c 0%, #ff4d4d 100%);
    }

    .ball-blue {
      background-image: linear-gradient(180deg, #31caf5 0%, #198cff 100%);
    }

    .ball-red-miss {
      background-image: linear-gradient(180deg, #fe8a5c 0%, #ff4d4d 100%);
      opacity: 0.3;
    }

    .ball-blue-miss {
      background-image: linear-gradient(180deg, #31caf5 0%, #198cff 100%);
      opacity: 0.3;
    }

    .ball-red-hit {
      background-image: linear-gradient(180deg, #ff4d4d 0%, #eb2635 100%);
    }

    .ball-blue-hit {
      background-image: linear-gradient(180deg, #198cff 0%, #226cd2 100%);
    }
  }
}
</style>
