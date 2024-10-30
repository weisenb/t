<template>
  <div class="video-wrap">
    <input type="text" ref="input" v-model="inputVal" />
    <video
      class="video"
      ref="video"
      playsinline
      preload="auto"
      webkit-playsinline
      x-webkit-airplay="deny"
      :src="videoSrc"
      :controls="true"
      muted
      @loadedmetadata="doLoadedmetadata"
    >
      您的浏览器不支持 video 标签。
    </video>
    <div @click="handleStart">播放</div>
    <div @click="handlePause">暂停</div>
  </div>
</template>
<!-- autoplay -->
<script lang="js">
import Hls from 'hls.js'

export default {
  props: {
    src: {
      type: String,
      default: ''
    },
    m3u8: {
      type: String,
      // default: '/m3u8/imgs/pomen.m3u8'
      default: ''
    },
    poster: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      inputVal: '',

      videoSrc: null,
      hls: null,
    }
  },
  computed: {},
  mounted () {
    if (this.src && !this.m3u8) {
      this.videoSrc = this.src
    } else {
      this.initHls()
    }
  },
  unmounted () {
    this.hls.destroy()
    this.hls = null
  },
  methods: {
    handleStart () {
      console.log(this.inputVal)
      this.$refs.video.play()
    },
    handlePause () {
      this.$refs.video.pause()
    },
    doLoadedmetadata () {
      console.log('loadedmetadata')
    },
    initHls () {
      const video = this.$refs.video
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.info('application/vnd.apple.mpegurl')
        this.videoSrc = this.m3u8
      } else if (Hls.isSupported()) {
        this.hls = new Hls({
          debug: true,
          maxBufferLength: 600 // 以秒为单位的最大缓冲区长度。如果缓冲区长度小于这个值，将加载一个新的片段。这是hls.js将尝试达到的保证缓冲区长度，与maxBufferSize无关。
          // maxBufferSize: 60 MB // 'Minimum'最大缓冲区大小，以字节为单位。如果预先缓冲区大小大于此值，则不会加载任何片段。
        })
        this.hls.attachMedia(video)
        this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.info('Hls.isSupported: MEDIA_ATTACHED')
          this.hls.loadSource(this.m3u8)
          // this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {})
        })
        this.hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
          console.log(
            'manifest loaded, found ' + data.levels.length + ' quality level'
          );
        });
        this.hls.on(Hls.Events.ERROR, (event, data) => {
          console.warn(data)
          if (data.fatal) {
            switch (data.type) {
            // 对于网络相关的错误 Hls.ErrorTypes.NETWORK_ERROR
              case Hls.ErrorTypes.NETWORK_ERROR:
                this.hls.startLoad()
                break
                // 媒体/视频相关错误 Hls.ErrorTypes.MEDIA_ERROR
              case Hls.ErrorTypes.MEDIA_ERROR:
                this.hls.recoverMediaError()
                break
                // 对于所有其他错误 Hls.ErrorTypes.OTHER_ERROR
              default:
                this.hls.destroy()
                break
            }
          }
        })
      }
    }
  },
  created () {}
}
</script>

<style scoped>
.video {
  width: 800px;
  object-fit: cover;
}
</style>
