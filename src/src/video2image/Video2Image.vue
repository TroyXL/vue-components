<template>
<div ref="videoBox" class="t-video-box">
  <video ref="videoBackup" class="t-video-backup" autoplay></video>
  <div class="t-video-wrap">
    <video ref="video" class="t-video" autoplay></video>
  </div>
</div>
</template>

<script>
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
let cemareInit = false
let videoDefaultWidth = 0
let videoDefaultHeight = 0

export default {
  name: 'Video2Image',
  props: {
    compress: {
      type: Number,
      default: 1,
      validator (value) {
        return value <= 1 && value > 0
      }
    },
    size: {
      type: Number,
      default: 400
    }
  },
  data () {
    return {
      cameraId: ''
    }
  },
  methods: {
    // 初始化摄像头
    cameraInit () {
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = (constraints) => {
          var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia
          if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
          }
          return new Promise((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject)
          })
        }
      }

      navigator.mediaDevices.enumerateDevices().then(this.getCamera).then(this.getStream).catch(err => {
        this.triggerError(err)
      })
    },

    // 获取摄像头
    getCamera (devices) {
      for (let i = 0; i < devices.length; i++) {
        if (devices[i].kind === 'videoinput') {
          this.cameraId = devices[i].deviceId
          return
        }
      }
      if (!this.cameraId) {
        this.triggerError('摄像头不存在')
      }
    },

    // 获取媒体流
    getStream () {
      navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: this.cameraId,
          width: 1080,
          height: 1080
        }
      }).then(stream => {
        this.$refs.video.srcObject = stream
        this.$refs.videoBackup.srcObject = stream

        // 解决摄像画面初始化问题
        if (!cemareInit) {  
          setTimeout(() => {
            videoDefaultWidth = videoDefaultHeight = 0
            cemareInit = true
          }, 1000)
        }
      }).catch(err => {
        this.triggerError(err)
      })
    },

    // 获取当前可视区域画布
    getCanvas () {
      if (!videoDefaultWidth && !videoDefaultHeight) {
        const videoDefaultStyle = window.getComputedStyle(this.$refs.videoBackup, null)
        videoDefaultWidth = Number(videoDefaultStyle.width.replace('px', ''))
        videoDefaultHeight = Number(videoDefaultStyle.height.replace('px', ''))
      }

      ctx.clearRect(0, 0, this.size, this.size)
      ctx.drawImage(this.$refs.video, (videoDefaultWidth - videoDefaultHeight) / 2, 0, videoDefaultHeight, videoDefaultHeight, 0, 0, this.size, this.size)
      return canvas
    },

    // 获取当前可视区域图片
    getImageDataUrl () {
      this.getCanvas()
      return canvas.toDataURL('image/jpeg', this.compress)
    },

    triggerError (err) {
      this.$emit('on-error', err)
    }
  },
  mounted () {
    canvas.width = canvas.height = this.size
    this.cameraInit()
  }
}
</script>

<style scoped>
.t-video-box {
  position: relative;
  width: 100%;
  height: 100%;
}

.t-video-backup {
  position: absolute;
  display: block;
  opacity: 0;
}

.t-video-wrap {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  overflow: hidden;
}

.t-video {
  position: absolute;
  display: block;
  height: 100%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>