<template>
  <div><input type="file" @change="handleFileChange" /></div>
  <div style="word-break: break-all">{{ content }}</div>
</template>
<script setup>
import { ref } from "vue";

let content = ref("");

function setFileContent(text) {
  content.value = text;
}

// 读取文件内容到ArrayBuffer
function readFileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // 注册文件读取完成后的回调函数
    reader.onload = function (event) {
      const arrayBuffer = event.target.result;
      resolve(arrayBuffer);
    };

    // 读取文件内容到ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
}

// 将ArrayBuffer转为十六进制字符串
function arrayBufferToHexString(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  let hexString = "";
  for (let i = 0; i < uint8Array.length; i++) {
    console.log(uint8Array[i]);
    const hex = uint8Array[i].toString(16).padStart(2, "0");
    hexString += hex;
    // console.log(String.fromCharCode(uint8Array[i]));
    // hexString += String.fromCharCode(uint8Array[i]);
  }
  return hexString;
}

// 读取文件内容到text
function readFileToText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // 注册文件读取完成后的回调函数
    reader.onload = function (event) {
      const text = event.target.result;
      resolve(text);
    };

    // 读取文件内容到ArrayBuffer
    reader.readAsText(file, "gb2312");
  });
}

// 处理文件选择事件
function handleFileChange(event) {
  const file = event.target.files[0]; // 获取选中的文件

  if (file) {
    // readFileToArrayBuffer(file)
    //   .then((arrayBuffer) => {
    //     const hexString = arrayBufferToHexString(arrayBuffer);
    //     setFileContent(hexString);
    //   })
    //   .catch((error) => {
    //     console.error("文件读取失败:", error);
    //   });
    readFileToText(file).then((text) => {
      setFileContent(text);
    });
  } else {
    setFileContent("请选择一个文件");
  }
}
</script>
