<!--
 * @Author: zjh
 * @Date: 2022-11-02 15:30:19
 * @LastEditors: zjh
 * @LastEditTime: 2024-10-31 10:37:14
 * @FilePath: \vue3-my-utils\src\views\util\QrCode.vue
 * @Description: 二维码
 * https://github.com/leidenglai/opencv-js-qrcode
 * https://github.com/soldair/node-qrcode
-->
<script setup lang="ts">
import { reactive, ref } from "vue"
import jsqrcode from "@weisenb/jsqrcode"
import jsQR from 'jsqr'
import OpencvQr from "opencv-qr"
import qrcode from 'qrcode'

const placeholder = "解析完成此处显示结果..."

const finish = reactive({
  jsqrcode: false,
  jsQR: false,
  opencvqr: false,
})
const text = reactive<{ jsqrcode: string, jsQR: string, opencvqr: string | string[] }>({
  jsqrcode: placeholder,
  jsQR: placeholder,
  opencvqr: placeholder,
})

const cvQr = new OpencvQr({
  dw: new URL('/qr/detect.caffemodel', import.meta.url).href,
  sw: new URL('/qr/sr.caffemodel', import.meta.url).href
});

let onChange = (e: any) => {
  console.log(e.target.files)
  Object.assign(text, {
    jsqrcode: placeholder,
    jsQR: placeholder,
    opencvqr: placeholder,
  })
  for (let file of e.target.files) {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function (e) {
      // 1.jsqrcode.decode: 仅黑白
      jsqrcode.decode(reader.result, (data: string) => {
        finish.jsqrcode = true
        console.log(data)
        text.jsqrcode = data
      })

      // 2.jsQR: 仅黑白
      const imageTemp = new Image()
      imageTemp.src = e.target?.result as string
      imageTemp.onload = () => {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement
        canvas.width = imageTemp.width
        canvas.height = imageTemp.height
        const context = canvas.getContext('2d')
        context!.drawImage(imageTemp, 0, 0, imageTemp.width, imageTemp.height)
        const imageData = context!.getImageData(0, 0, imageTemp.width, imageTemp.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          // inversionAttempts: "dontInvert",
        })
        finish.jsQR = true
        console.log(code)
        text.jsQR = code ? code.data : ''

        // 3.cvqr
        const result = cvQr.load(imageTemp);
        finish.opencvqr = true
        text.opencvqr = result?.getInfos() || ''
      }
    }
  }
}

const activeTab = ref('0')
const inputText = ref()
const qrOption = ref({
  width: undefined,
  errorCorrectionLevel: 'M',
  margin: 0,
  scale: 4,
  color: {
    dark: '#000000ff',
    light: '#ffffffff',
  }
})
const gen = () => {
  const canvasEl = document.getElementById('canvas-g')
  qrcode.toCanvas(canvasEl, inputText.value, qrOption.value, function (error:any) {
    if (error) {
      ElMessage({
        message: error,
        type: 'error',
      })
    }
  })
}
</script>

<template>
  <div class="page">
    <el-tabs v-model="activeTab" type="card">

      <el-tab-pane label="二维码解码">
        <div><input type="file" :multiple="false" @change="onChange" style="width: 100%;" /></div>
        <div class="method">weisenb</div>
        <div :class="['text', finish.jsqrcode ? '' : 'unfill']">{{ text.jsqrcode }}</div>
        <div class="method">jsQR</div>
        <canvas id="canvas" style="display: none;"></canvas>
        <div :class="['text', finish.jsQR ? '' : 'unfill']">{{ text.jsQR }}</div>
        <div class="method">opencv</div>
        <div :class="['text', finish.opencvqr ? '' : 'unfill']">{{ text.opencvqr }}</div>
      </el-tab-pane>

      <el-tab-pane label="二维码生成">
        <el-form label-width="auto">
          <el-form-item label="text" :rules="{ required: true }">
            <el-input v-model="inputText" :autosize="{ minRows: 2 }" type="textarea" placeholder="请输入文本" />
          </el-form-item>
          <el-form-item label="width">
            <el-input-number v-model="qrOption.width" :controls="false" placeholder="请输入宽度" />
          </el-form-item>
          <el-form-item label="容错率">
            <el-radio-group v-model="qrOption.errorCorrectionLevel">
              <el-radio-button label="L" value="">low</el-radio-button>
              <el-radio-button label="M" value="">medium</el-radio-button>
              <el-radio-button label="Q" value="">quartile</el-radio-button>
              <el-radio-button label="H" value="">high</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="margin">
            <el-input-number v-model="qrOption.margin" />
          </el-form-item>
          <el-form-item label="">
            <template #label>
              <el-tooltip effect="dark" content="比例因子, 值为1表示每个模块（黑点）1px" placement="bottom-start">scale</el-tooltip>
            </template>
            <el-input-number v-model="qrOption.scale" />
          </el-form-item>
          <el-form-item label="码颜色">
            <el-color-picker v-model="qrOption.color.dark" />
          </el-form-item>
          <el-form-item label="码背景色">
            <el-color-picker v-model="qrOption.color.light" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" style="margin-top: 10px" @click="gen">生成</el-button>
          </el-form-item>
        </el-form>
        <div style="padding-top: 20px;">
          <canvas id="canvas-g"></canvas>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="css" scoped>
.method {
  margin-top: 12px;
}

.text {
  line-height: 20px;
}

.text.unfill {
  color: var(--vt-c-divider-light-1);
}
</style>