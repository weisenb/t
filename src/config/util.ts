/*
 * @Author: zjh
 * @Date: 2023-07-05 18:49:22
 * @LastEditors: zjh
 * @LastEditTime: 2024-10-29 16:40:29
 * @FilePath: \vue3-my-utils\src\config\util.ts
 * @Description:
 */
const utils = [
  { name: "二维码工具", path: "/util/qrcode", description: "二维码生成、解析" },
  { name: "视频播放器", path: "/util/video", description: "m3u8、mp4播放器" },
  {
    name: "图片工具",
    path: "/util/picture",
    description: "图片格子转换、信息",
  },
  {
    name: "文件类型识别",
    path: "/util/filetype",
    description: "真实文件类型识别",
  },
  { name: "text文件读取", path: "/util/fileread", description: "文件读取" },
  { name: "JSON", path: "/util/json", description: "序列化、反序列化" },
  { name: "Api工具", path: "/util/api", description: "接口测试、重发" },
  { name: "加密/解密", path: "/util/encode", description: "md5" },
  { name: "cdn", path: "/util/cdn", description: "动态加载cdn库" },
  
  // h5预览、模拟控制台、手写签名
  { name: "关于工具", path: "/about", description: "" },
];

export default utils;
