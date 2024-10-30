<!--
 * @Author: zjh
 * @Date: 2024-10-30 15:27:24
 * @LastEditors: zjh
 * @LastEditTime: 2024-10-30 16:55:53
 * @Description: 
-->
<script setup lang="ts">
import { ref } from 'vue'

const inputText = ref()
const viewValue = ref()
function doExecute() {
    try {
        const result = eval(inputText.value)
        setValue(result)
    } catch (error) {
        ElMessage({
            message: error?.message,
            type: 'error',
        })
    }
}
async function setValue(result: any) {
    if (typeof result === 'object') {
        if (result.then) {
            const value = await result
            console.log(value)
            setValue(value)
        } else {
            viewValue.value = JSON.stringify(result)
        }
    } else {
        viewValue.value = result
    }
}
</script>

<template>
    <el-input v-model="inputText" :autosize="{ minRows: 5 }" type="textarea" placeholder="请输入脚本" />
    <div style="margin: 10px 0;">
        <el-button @click="doExecute">执行</el-button>
    </div>
    <el-input v-model="viewValue" :autosize="{ minRows: 2 }" type="textarea" />
</template>