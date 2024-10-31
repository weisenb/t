/*
 * @Author: zjh
 * @Date: 2022-11-02 14:03:04
 * @LastEditors: zjh
 * @LastEditTime: 2024-10-31 10:15:01
 * @FilePath: \vue3-my-utils\src\router\index.ts
 * @Description:
 */
import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import utils from '@/config/util'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    ...utils,
    {
      path: "/table",
      name: "table",
      component: () => import("@/views/table/MergeTable.vue"),
    },
  ],
});

export default router;
