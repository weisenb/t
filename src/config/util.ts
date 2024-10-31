/*
 * @Author: zjh
 * @Date: 2023-07-05 18:49:22
 * @LastEditors: zjh
 * @LastEditTime: 2024-10-31 10:22:54
 * @FilePath: \vue3-my-utils\src\config\util.ts
 * @Description:
 */
const utils = [
  {
    path: "/js",
    name: "UtilJs",
    component: () => import("@/views/util/Js.vue"),
    meta: {
      title: 'JavaScript',
      description: "脚本执行"
    },
  },
  {
    path: "/qrcode",
    name: "UtilQrCode",
    component: () => import("@/views/util/QrCode.vue"),
    meta: {
      title: '二维码',
      description: "二维码生成、解析"
    },
  },
  {
    path: "/text",
    name: "UtilText",
    component: () => import("@/views/util/Text.vue"),
    meta: {
      title: '文本',
      description: "解码、编码"
    },
  },
  {
    path: "/filetype",
    name: "UtilFileType",
    component: () => import("@/views/util/FileType.vue"),
    meta: {
      title: '文件类型',
      description: "识别真实文件类型"
    },
  },
  {
    path: "/fileread",
    name: "UtilFileRead",
    component: () => import("@/views/util/FileRead.vue"),
    meta: {
      title: 'text文件读取',
      description: "text文件读取",
      hide: true
    },
  },
  {
    path: "/hls",
    name: "UtilHls",
    component: () => import("@/views/util/hls/HlsIndex.vue"),
    meta: {
      title: '视频播放器',
      description: "m3u8、mp4播放器",
      hide: true
    },
  },
  // { name: "", path: "/api", description: "接口测试、重发" },
  // { name: "cdn", path: "/util/cdn", description: "动态加载cdn库" },
  // 图片格式转换、h5预览、模拟控制台、手写签名、编码转换、视频流
];

export default utils;
