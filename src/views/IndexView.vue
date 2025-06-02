<script setup>
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

function menuHandleSelect() {
  console.log(route.name, route.path)
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header class="index-el-header">
        <el-menu
          :default-active="route.name"
          class="el-menu-demo"
          mode="horizontal"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          @select="menuHandleSelect"
          router
        >
          <el-menu-item v-for="item in router.options.routes" :index="item.name" :key="item.name">
            <RouterLink :to="item.path">{{ item.title }}</RouterLink>
          </el-menu-item>
        </el-menu>
      </el-header>
      <el-main>
        <RouterView v-slot="{ Component }">
          <KeepAlive>
            <component :is="Component"></component>
          </KeepAlive>
        </RouterView>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
.index-el-header {
  padding: 0;
}
</style>
