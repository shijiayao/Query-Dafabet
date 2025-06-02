<script setup>
defineProps(['StatisticsObject'])
</script>

<template>
  <section class="progress-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <section class="progress-item">
          <el-progress
            type="circle"
            v-for="(value, key) in StatisticsObject.redBall"
            :key="key"
            :percentage="Number(((value / StatisticsObject.redTotal) * 100).toFixed(2))"
            :stroke-width="16"
            color="red"
            striped
            striped-flow
            :style="`order: ${((1 - value / StatisticsObject.redTotal) * 10000000).toFixed(0)};`"
          >
            <template #default="{ percentage }">
              <p class="percentage-label" style="color: red">{{ key }}</p>
              <p class="percentage-value">{{ percentage }}%</p>
            </template>
          </el-progress>
        </section>
      </el-col>
      <el-col :span="12">
        <section class="progress-item">
          <el-progress
            type="circle"
            v-for="(value, key) in StatisticsObject.blueBall"
            :key="key"
            :percentage="Number(((value / StatisticsObject.blueTotal) * 100).toFixed(2))"
            :stroke-width="16"
            color="blue"
            striped
            striped-flow
            :style="`order: ${((1 - value / StatisticsObject.blueTotal) * 10000000).toFixed(0)};`"
          >
            <template #default="{ percentage }">
              <p class="percentage-label" style="color: blue">{{ key }}</p>
              <p class="percentage-value">{{ percentage }}%</p>
            </template>
          </el-progress>
        </section>
      </el-col>
    </el-row>
  </section>
</template>

<style scoped lang="scss">
.progress-container {
  .progress-item {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    margin-bottom: 5px;

    .percentage-label {
      margin-bottom: 5px;
      font-size: 16px;
    }
  }
}
</style>
