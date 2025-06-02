<script setup>
import { ref } from 'vue'
import { toChineseNumber } from '@/utils/utils.js'

const ssqArray = ref([
  { AwardLevel: 1, bonus: '浮动', ruleArray: ['6 + 1'] },
  { AwardLevel: 2, bonus: '浮动', ruleArray: ['6 + 0'] },
  { AwardLevel: 3, bonus: '3,000元', ruleArray: ['5 + 1'] },
  { AwardLevel: 4, bonus: '200元', ruleArray: ['5 + 0', '4 + 1'] },
  { AwardLevel: 5, bonus: '10元', ruleArray: ['4 + 0', '3 + 1'] },
  { AwardLevel: 6, bonus: '5元', ruleArray: ['2 + 1', '1 + 1', '0 + 1'] },
  { AwardLevel: 7, bonus: '0元', ruleArray: [] }
])

const cjdltArray = ref([
  { AwardLevel: 1, bonus: '浮动', ruleArray: ['5 + 2'] },
  { AwardLevel: 2, bonus: '浮动', ruleArray: ['5 + 1'] },
  { AwardLevel: 3, bonus: '10,000元', ruleArray: ['5 + 0'] },
  { AwardLevel: 4, bonus: '3,000元', ruleArray: ['4 + 2'] },
  { AwardLevel: 5, bonus: '300元', ruleArray: ['4 + 1'] },
  { AwardLevel: 6, bonus: '200元', ruleArray: ['3 + 2'] },
  { AwardLevel: 7, bonus: '100元', ruleArray: ['4 + 0'] },
  { AwardLevel: 8, bonus: '15元', ruleArray: ['3 + 1', '2 + 2'] },
  { AwardLevel: 9, bonus: '5元', ruleArray: ['3 + 0', '2 + 1', '1 + 2', '0 + 2'] },
  { AwardLevel: 10, bonus: '0元', ruleArray: [] }
])

function mergeSpanMethod({ rowIndex, columnIndex }) {
  if (columnIndex === 3) {
    if (rowIndex === 0) {
      return {
        rowspan: 2,
        colspan: 1
      }
    } else if (rowIndex === 2) {
      return {
        rowspan: 8,
        colspan: 1
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0
      }
    }
  }
}
</script>

<template>
  <section class="table-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <h1 class="table-title">双色球</h1>
        <el-table :data="ssqArray" border style="width: 100%">
          <el-table-column prop="AwardLevel" label="奖等" align="center" width="100">
            <template #default="scope">
              {{ toChineseNumber(scope.row.AwardLevel) + '等奖' }}
            </template>
          </el-table-column>
          <el-table-column prop="bonus" label="奖金" align="center" width="120"></el-table-column>
          <el-table-column prop="address" label="中奖条件" align="center">
            <template #default="scope">
              <ul v-for="(item01, index01) in scope.row.ruleArray" :key="index01" class="ball-list">
                <li
                  v-for="(item02, index02) in new Array(6)"
                  :key="index02"
                  class="ball-item"
                  :class="{
                    'ball-red ': index02 < 5 && item01.split(' + ')[0] > index02,
                    'ball-blue': index02 >= 5 && item01.split(' + ')[1] > index02 - 5
                  }"
                ></li>
                <li class="rule-text">{{ item01 }}</li>
              </ul>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="12">
        <h1 class="table-title">超级大乐透</h1>
        <el-table :data="cjdltArray" border style="width: 100%" :span-method="mergeSpanMethod">
          <el-table-column prop="AwardLevel" label="奖等" align="center" width="100">
            <template #default="scope">
              {{ toChineseNumber(scope.row.AwardLevel) + '等奖' }}
            </template>
          </el-table-column>
          <el-table-column prop="bonus" label="奖金" align="center" width="120"></el-table-column>
          <el-table-column prop="address" label="中奖条件" align="center">
            <template #default="scope">
              <ul v-for="(item01, index01) in scope.row.ruleArray" :key="index01" class="ball-list">
                <li
                  v-for="(item02, index02) in new Array(6)"
                  :key="index02"
                  class="ball-item"
                  :class="{
                    'ball-red ': index02 < 4 && item01.split(' + ')[0] > index02,
                    'ball-blue': index02 >= 4 && item01.split(' + ')[1] > index02 - 4
                  }"
                ></li>
                <li class="rule-text">{{ item01 }}</li>
              </ul>
            </template>
          </el-table-column>
          <el-table-column label="追加奖金" align="center" width="120">
            <template #default="scope">
              {{ scope.$index < 2 ? '单注0.8倍' : '无' }}
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </section>
</template>

<style scoped lang="scss">
.table-container {
  .table-title {
    margin-bottom: 5px;
    line-height: 24px;
    text-align: center;
  }

  .ball-list {
    display: flex;
    justify-content: center;
    margin-bottom: 1px;

    &:last-child {
      margin-bottom: 0;
    }

    .ball-item {
      margin-top: 4px;
      margin-right: 5px;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background-color: #ccc;

      &:last-child {
        margin-right: 0;
      }
    }

    .ball-red {
      background-color: red;
    }

    .ball-blue {
      background-color: blue;
    }

    .rule-text {
      margin-left: 10px;
    }
  }
}
</style>
