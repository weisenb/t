<!--
 * @Author: zjh
 * @Date: 2024-10-30 10:49:56
 * @LastEditors: zjh
 * @LastEditTime: 2024-10-31 10:36:47
 * @Description: 
-->

<script setup lang="ts">
import { ref } from 'vue'
import crypto from 'crypto-js'
// console.log(crypto)
const activeTab = ref('0')

// JSON
const inputText = ref()
const viewText = ref()
function handleParse() {
    try {
        const obj = JSON.parse(inputText.value)
        viewText.value = JSON.stringify(obj, null, 2)
    } catch (error: any) {
        ElMessage({
            message: error?.message,
            type: 'error',
        })
    }
}
function handleStringify() {
    try {
        let _a
        const obj = eval(`_a=${inputText.value}`)
        viewText.value = JSON.stringify(obj)
    } catch (error: any) {
        ElMessage({
            message: error?.message,
            type: 'error',
        })
    }
}

// URL编码
const inputText2 = ref()
const viewText2 = ref()
function handleEncode(isComponent: boolean) {
    const method = isComponent ? encodeURIComponent : encodeURI
    viewText2.value = method(inputText2.value)
}
function handleDecode(isComponent: boolean) {
    const method = isComponent ? decodeURIComponent : decodeURI
    viewText2.value = method(inputText2.value)
}

// 加解密decrypt
const inputText3 = ref()
const viewText3 = ref()
function handleEncrypt(type?: string) {
    if (type) {
        viewText3.value = crypto.MD5(inputText3.value).toString()
    }
}
</script>


<template>
    <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="JSON">
            <el-input v-model="inputText" :autosize="{ minRows: 3 }" type="textarea" placeholder="请输入文本" />
            <div style="padding: 10px 0;">
                <el-button type="primary" @click="handleParse">parse</el-button>
                <el-button type="primary" @click="handleStringify">stringify</el-button>
            </div>
            <el-input v-model="viewText" :autosize="{ minRows: 3 }" type="textarea" />
        </el-tab-pane>

        <el-tab-pane label="URL编码">
            <el-input v-model="inputText2" :autosize="{ minRows: 3 }" type="textarea" placeholder="请输入文本" />
            <div style="padding: 10px 0;">
                <el-button type="primary" @click="handleDecode(false)">decodeURI</el-button>
                <el-button type="primary" @click="handleEncode(false)">endecodeURI</el-button>
                <el-button type="primary" @click="handleDecode(true)">decodeURIComponent</el-button>
                <el-button type="primary" @click="handleEncode(true)">encodeURIComponent</el-button>
            </div>
            <el-input v-model="viewText2" :autosize="{ minRows: 3 }" type="textarea" />
        </el-tab-pane>

        <el-tab-pane label="HASH">
            <el-input v-model="inputText3" :autosize="{ minRows: 3 }" type="textarea" placeholder="请输入文本" />
            <div style="padding: 10px 0;">
                <el-button type="primary" @click="handleEncrypt('md5')">MD5</el-button>
                <!-- <el-button type="primary" @click="handleEncrypt">AES</el-button> -->
            </div>
            <el-input v-model="viewText3" :autosize="{ minRows: 3 }" type="textarea" />
        </el-tab-pane>

        <!-- 进制转换 -->
    </el-tabs>
</template>
