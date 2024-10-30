<!--
 * @Author: zjh
 * @Date: 2023-07-06 14:15:05
 * @LastEditors: zjh
 * @LastEditTime: 2024-10-29 16:39:18
 * @FilePath: \vue3-my-utils\src\views\util\FileType.vue
 * @Description: 通过魔数（Magic Number）来区分文件类型
 * https://github.com/sindresorhus/file-type
 * https://www.jianshu.com/p/51ef1b2e82aa
 * https://blog.csdn.net/ccj2020/article/details/87603903
-->
<template>
  <div>
    <input type="file" @change="handleFileChange" />
  </div>
  <div>ext：{{ fileSuffix }}</div>
  <div>MIME Type：{{ fileType }}</div>
</template>

<script setup>
import { ref } from "vue";

const FileMagicMap = {
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/gif": [0x47, 0x49, 0x46, 0x38],
  "image/bmp": [0x42, 0x4d],
  "application/pdf": [0x25, 0x50, 0x44, 0x46],
  "video/mp4": [
    [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d],
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
    [0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70],
  ],
  "video/x-flv": [0x46, 0x4c, 0x56],
};
let fileSuffix = ref("");
let fileType = ref("");

// 读取文件中指定范围的二进制数据
function readBuffer(file, start = 0, end = 2) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file.slice(start, end));
  });
}
function check(headers) {
  return (buffers, options = { offset: 0 }) =>
    headers.every(
      (header, index) => header === buffers[options.offset + index]
    );
}
async function handleFileChange(event) {
  // const files = (event.target as HTMLInputElement).files;
  const files = event.target.files;
  const file = files && files[0];
  if (file) {
    fileSuffix.value = file.type;
    const buffers = await readBuffer(file, 0, 8);
    const uint8Array = new Uint8Array(buffers);

    let arr = [];
    // console.log(FileMagicMap);
    uint8Array.forEach((item) => {
      // console.log(item);
      arr.push(`${item.toString(16)}`);
    });
    // console.log(arr);

    let result = Object.entries(FileMagicMap).find(([k, v]) => {
      // console.log(v);
      if (Array.isArray(v[0])) {
        return v.find((item) => check(item)(uint8Array));
      } else {
        return check(v)(uint8Array);
      }
    });
    fileType.value = result ? result[0] : `暂未支持, 联系开发者补充${arr}`;
  }
}
</script>
