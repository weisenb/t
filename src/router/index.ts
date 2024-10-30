/*
 * @Author: zjh
 * @Date: 2022-11-02 14:03:04
 * @LastEditors: zjh
 * @LastEditTime: 2024-10-30 15:27:18
 * @FilePath: \vue3-my-utils\src\router\index.ts
 * @Description:
 */
import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/js",
      name: "UtilJs",
      component: () => import("@/views/util/Js.vue"),
    },
    {
      path: "/qrcode",
      name: "UtilQrCode",
      component: () => import("@/views/util/QrCode.vue"),
    },
    {
      path: "/text",
      name: "UtilText",
      component: () => import("@/views/util/Text.vue"),
    },
    {
      path: "/filetype",
      name: "UtilFileType",
      component: () => import("@/views/util/FileType.vue"),
    },
    {
      path: "/fileread",
      name: "UtilFileRead",
      component: () => import("@/views/util/FileRead.vue"),
    },
    {
      path: "/hls",
      name: "UtilHlsIndex",
      component: () => import("@/views/util/hls/HlsIndex.vue"),
    },
    {
      path: "/about",
      name: "about",
      component: () => import("@/views/AboutView.vue"),
    },
    {
      path: "/table",
      name: "table",
      component: () => import("@/views/table/MergeTable.vue"),
    },
  ],
});

export default router;
