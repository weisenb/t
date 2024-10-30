<!--
 * @Author: zjh
 * @Date: 2022-11-02 14:03:04
 * @LastEditors: zjh
 * @LastEditTime: 2024-10-29 16:40:17
 * @FilePath: \vue3-my-utils\src\App.vue
 * @Description: 
-->
<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <header>
    <nav class="nav container">
      <RouterLink to="/">首页</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
/* @media (min-width: 1024px) {

} */
.nav {
  padding-top: 15px;
  padding-bottom: 15px;
}
</style>
