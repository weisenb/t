<!--
 * @Author: zjh
 * @Date: 2022-11-02 14:03:04
 * @LastEditors: zjh
 * @LastEditTime: 2024-10-31 10:23:19
 * @FilePath: \vue3-my-utils\src\views\Home.vue
 * @Description: 
-->
<script setup lang="ts">
import utils from "@/config/util";

const homeUtils = utils.filter(item => !item.meta.hide)

</script>

<template>
  <main class="page">
    <div class="blocks">
      <RouterLink class="block" v-for="util in homeUtils" :key="util.path" :to="util.path" :title="util.meta.description">{{
        util.name }}</RouterLink>
    </div>
  </main>
</template>

<style lang="less" scoped>
.blocks {
  display: grid; // inline-grid
  // grid-template-columns: repeat(auto-fill, 200px);
  // 至少 200px，如果还有空余则一起等分
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-gap: 10px;
  grid-auto-rows: 90px;

  .block {
    overflow: hidden;
    background: rgb(110, 110, 201);
    border-radius: 5px;
    color: #fff;
    text-align: center;
    line-height: 90px;
  }
}

a {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
}

@media (hover: hover) {
  a:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
  }
}
</style>
