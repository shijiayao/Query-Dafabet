<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  HistoryObject: Object
})

const editGroupBallDialogVisible = ref(false)

const addBallArray = ref({
  shuangseqiu: {
    redBallArray: ['', '', '', '', '', ''],
    blueBallArray: [''],
    multiplying: 5,
    phase: '',
    serial: 3
  },
  chaojidaletou: {
    redBallArray: ['', '', '', '', ''],
    blueBallArray: ['', ''],
    multiplying: 5,
    phase: '',
    serial: 3,
    appendValue: true
  }
})

const groupballInfoChace = ref(null)
const groupBallInfo = ref(null)

const addBallObject = computed(() => {
  return addBallArray.value[props.HistoryObject.activeName]
})

function isHitOrMiss(ball, row) {
  return row.includes(String(ball).padStart(2, 0)) ? '-hit' : '-miss'
}

// 验证球号数据
function validateAddBallData(ballData) {
  // 验证倍数、期号、连续期数
  if (isNaN(ballData.phase) || !ballData.phase) {
    return { valid: false, message: '期号必填且必须为数字' }
  }
  if (isNaN(ballData.multiplying) || !ballData.multiplying) {
    return { valid: false, message: '倍数必填且必须为数字' }
  }
  if (isNaN(ballData.serial) || !ballData.serial) {
    return { valid: false, message: '连续期数必填且必须为数字' }
  }

  // 验证红球
  if (ballData.redBallArray.some((item) => !item || isNaN(item))) {
    return { valid: false, message: '红球号码必填且必须为数字' }
  }

  // 验证蓝球
  if (ballData.blueBallArray.some((item) => !item || isNaN(item))) {
    return { valid: false, message: '蓝球号码必填且必须为数字' }
  }

  return { valid: true, message: '验证成功' }
}

function addGroupBall() {
  const validation = validateAddBallData(addBallObject.value)

  if (!validation.valid) {
    ElMessage({
      type: 'warning',
      message: validation.message
    })
    return
  }

  props.HistoryObject.addGroupBall(addBallObject.value)
}

function editGroupBall(row) {
  editGroupBallDialogVisible.value = true

  groupballInfoChace.value = JSON.parse(JSON.stringify(row))
  groupBallInfo.value = row
}

function deleteGroupBall(row) {
  ElMessageBox.confirm(`要删除期号为【${row.期号}】的记录吗？`, `删除记录`, {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      props.HistoryObject.deleteGroupBall(row)
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除'
      })
    })
}

// 确认编辑按钮事件
function confirmEditGroupBall() {
  editGroupBallDialogVisible.value = false

  // 检查数据是否变更，如果没有变更则不做任何操作，如有变更调用接口更新数据
  if (JSON.stringify(groupballInfoChace.value) === JSON.stringify(groupBallInfo.value)) {
    ElMessage({
      type: 'info',
      message: '数据没有更新'
    })
    return
  }
}
</script>

<template>
  <section>
    <section class="input-container">
      <el-input
        class="red-ball-input"
        v-model="addBallObject.redBallArray[index]"
        style="width: 40px"
        v-for="(item, index) in addBallObject.redBallArray"
        :key="index"
      />
      <el-tag type="info" size="large">+</el-tag>
      <el-input
        class="blue-ball-input"
        v-model="addBallObject.blueBallArray[index]"
        style="width: 40px"
        v-for="(item, index) in addBallObject.blueBallArray"
        :key="index"
      />
      <section class="param-group">
        <el-input v-model="addBallObject.multiplying" style="width: 130px">
          <template #prepend>倍数</template>
        </el-input>
      </section>
      <section class="param-group">
        <el-input v-model="addBallObject.phase" style="width: 150px">
          <template #prepend>期号</template>
        </el-input>
      </section>
      <section class="param-group">
        <el-input v-model="addBallObject.serial" style="width: 160px">
          <template #prepend>连续</template>
          <template #append>期</template>
        </el-input>
      </section>
      <section class="param-group" v-if="props.HistoryObject.activeName === 'chaojidaletou'">
        <el-switch v-model="addBallObject.appendValue" class="ml-2" inline-prompt active-text="追加" inactive-text="追加" />
      </section>
      <section class="param-group">
        <el-button type="success" v-on:click="addGroupBall">添加</el-button>
      </section>
    </section>
  </section>

  <el-table :data="props.HistoryObject.tableData" border stripe style="width: 100%" class="data-el-table">
    <el-table-column align="center" prop="期号" label="期号" width="100"></el-table-column>
    <el-table-column align="center" prop="开奖日期" label="开奖日期" width="140"></el-table-column>
    <el-table-column align="center" label="开奖号码" width="240">
      <template #default="scope">
        <ul class="ball-gurp">
          <li class="ball-item ball-red" v-for="item in scope.row.开奖号码红球" :key="item">{{ item }}</li>
          <li class="ball-item ball-blue" v-for="item in scope.row.开奖号码蓝球" :key="item">{{ item }}</li>
        </ul>
      </template>
    </el-table-column>
    <el-table-column align="center" prop="号码" label="号码" width="240">
      <template #default="scope">
        <ul class="ball-gurp">
          <li class="ball-item" :class="'ball-red' + isHitOrMiss(item, scope.row.开奖号码红球)" v-for="item in scope.row.号码红球" :key="item">{{ item }}</li>
          <li class="ball-item" :class="'ball-blue' + isHitOrMiss(item, scope.row.开奖号码蓝球)" v-for="item in scope.row.号码蓝球" :key="item">{{ item }}</li>
        </ul>
      </template>
    </el-table-column>
    <el-table-column prop="倍数" label="倍数" align="center" width="100"></el-table-column>
    <el-table-column align="center" prop="金额" label="金额"></el-table-column>
    <el-table-column align="center" label="操作" width="160">
      <template #default="scope">
        <el-button type="primary" size="small" v-on:click="editGroupBall(scope.row)">编辑</el-button>
        <el-button type="danger" size="small" v-on:click="deleteGroupBall(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-dialog v-model="editGroupBallDialogVisible" align-center>
    <section class="input-container">
      <el-input
        class="red-ball-input"
        v-model="groupBallInfo.号码红球[index]"
        style="width: 40px"
        v-for="(item, index) in groupBallInfo.号码红球"
        :key="index"
      />
      <el-tag type="info" size="large">+</el-tag>
      <el-input
        class="blue-ball-input"
        v-model="groupBallInfo.号码蓝球[index]"
        style="width: 40px"
        v-for="(item, index) in groupBallInfo.号码蓝球"
        :key="index"
      />
      <section class="param-group">
        <el-input v-model="groupBallInfo.期号" style="width: 150px">
          <template #prepend>期号</template>
        </el-input>
      </section>
      <section class="param-group">
        <el-input v-model="groupBallInfo.倍数" style="width: 130px">
          <template #prepend>倍数</template>
        </el-input>
      </section>
    </section>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="editGroupBallDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEditGroupBall">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.input-container {
  padding-bottom: 10px;
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

.data-el-table {
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
