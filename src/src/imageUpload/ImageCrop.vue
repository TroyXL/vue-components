<template>
<div ref="cropBox" class="t-image-crop">
  <p class="t-image-crop-tip t-absolute-center" v-if="loading">处理图片中，请稍候...</p>

  <div class="t-image-crop-body" :class="{ 't-invisible': loading }">
    <img ref="image" class="t-image-crop-image t-absolute-center">
    <div ref="cropper" class="t-image-crop-area t-absolute"></div>
  </div>

  <div class="t-image-crop-buttons" :style="loading ? 'display: none;' : 'display: block;'">
    <a href="javascript:;" class="t-image-crop-buttons-item t-image-crop-buttons-cancel" @click="cancelCrop">取消</a>
    <a href="javascript:;" class="t-image-crop-buttons-item t-image-crop-buttons-rotate" @click="rotateImage">旋转90°</a>
    <a href="javascript:;" class="t-image-crop-buttons-item t-image-crop-buttons-ensure" @click="ensureCrop">剪裁</a>
  </div>
  
</div>
</template>

<script>
import ImageManager from './ImageManager'

let cropBoxWidth = 0 // 剪裁页宽度
let cropBoxHeight = 0 // 剪裁页高度
let cropBoxRatio = 0 // 剪裁页宽高比

let $cropper = null // 剪裁框节点
let cropperSize = 0 // 剪裁框尺寸
let cropperOrientation = 'horizontal' // 剪裁框剪裁方向 horizontal | vertical
let cropperTranslation = 0 // 剪裁框位移的距离
let cropperDomRender = null // 剪裁框节点渲染函数
let cropperListenerTrigger = null // 剪裁框挂载与卸载函数

let touched = false // 鼠标或手指是否按下
let touchPosition = null // 按下的位置

let $image = null // 图片节点
let mimeType = '' // 图片mime类型
let imageWidth = 0 // 图片渲染宽度
let imageHeight = 0 // 图片渲染高度
let imageRatio = 0 // 图片宽高比
let imageDomRender = null // 图片节点渲染函数

let rotateTimes = 0 // 图片旋转次数
let forward = 0 // 图片当前方向 0-0deg 1-90deg 2-180deg 3-270deg

let firstLoad = true // 是否初次渲染
let originImage = null // 原始图片 用于旋转图片时绘制 防止多次旋转后清晰度降低

export default {
  name: 'ImageCrop',
  data () {
    return {
      loading: true,
      imageDataUrl: ''
    }
  },
  methods: {
    setImageDataUrl (dataUrl, mime) {
      mimeType = mime
      this.imageDataUrl = dataUrl
    },
    // 渲染图片
    renderImage () {
      let image = new Image()
      image.onload = () => {
        imageWidth = image.width
        imageHeight = image.height
        imageRatio = imageWidth / imageHeight

        if (firstLoad) {
          originImage = image
          firstLoad = false
          ImageManager.getOrientation(originImage)
                      .then(orientation => {
                        this.checkOrientation(orientation)
                      })
        } else {
          this.computeImageSize()
          image = null
        }
      }
      $image.src = image.src = this.imageDataUrl
    },
    // 计算图片尺寸信息
    computeImageSize () {
      if (imageRatio > cropBoxRatio) {
        imageWidth = cropBoxWidth
        imageHeight = cropBoxHeight * (cropBoxRatio / imageRatio)
      } else {
        imageHeight = cropBoxHeight
        imageWidth = cropBoxWidth * (imageRatio / cropBoxRatio)
      }
      imageDomRender('width', imageWidth + 'px')('height', imageHeight + 'px')

      this.computedCropAreaSize()
      this.loading = false
    },
    // 计算剪裁区域尺寸信息
    computedCropAreaSize () {
      if (imageWidth > imageHeight) {
        cropperSize = imageHeight
        cropperOrientation = 'horizontal'
        cropperTranslation = (imageWidth - cropperSize) / 2 + (cropBoxWidth - imageWidth) / 2

        cropperDomRender('left', cropperTranslation + 'px')
      } else {
        cropperSize = imageWidth
        cropperOrientation = 'vertical'
        cropperTranslation = (imageHeight - cropperSize) / 2 + (cropBoxHeight - imageHeight) / 2

        cropperDomRender('top', cropperTranslation + 'px')
      }

      // 校正剪裁框位置，使其垂直居中
      if (imageRatio < cropBoxRatio && cropperOrientation === 'vertical') cropperDomRender('left', (cropBoxWidth - imageWidth) / 2 + 'px')
      if (imageRatio > cropBoxRatio && cropperOrientation === 'vertical') cropperDomRender('left', 0)
      if (imageRatio > cropBoxRatio && cropperOrientation === 'horizontal') cropperDomRender('top', (cropBoxHeight - imageHeight) / 2 + 'px')
      if (imageRatio < cropBoxRatio && cropperOrientation === 'horizontal') cropperDomRender('top', 0)

      cropperDomRender('width', cropperSize + 'px')('height', cropperSize + 'px')
      this.listenCropperMoved()
    },

    // 剪裁框移动操作
    listenCropperMoved () {
      const events = ['mousedown', 'mouseup', 'mousemove', 'touchstart', 'touchend', 'touchmove']
      const fns = [this.startMove, this.endMove, this.cropperOnMoving, this.startMove, this.endMove, this.cropperOnMoving]
      cropperListenerTrigger('remove', events, fns)('add', events, fns)
    },
    startMove (e) {
      e.preventDefault()
      touched = true
      const touch = e.touches ? e.touches[0] : e
      touchPosition = { x: touch.clientX, y: touch.clientY }
    },
    endMove (e) {
      e.preventDefault()
      touched = false
      touchPosition = null
    },
    // 移动剪裁框
    cropperOnMoving (e) {
      if (!touched) return

      e.preventDefault()
      const touch = e.touches ? e.touches[0] : e
      const currentPosition = { x: touch.clientX, y: touch.clientY }
      const differ = this.getTouchDiffer(currentPosition)

      if (cropperOrientation === 'vertical') { // 剪裁框垂直移动
        cropperTranslation += differ.dy

        // 上边界校验
        if (cropperTranslation <= (cropBoxHeight - imageHeight) / 2) {
          cropperTranslation = (cropBoxHeight - imageHeight) / 2
        }
        // 下边界校验
        if (cropperTranslation + cropperSize >= cropBoxHeight - (cropBoxHeight - imageHeight) / 2) {
          cropperTranslation = cropBoxHeight - (cropBoxHeight - imageHeight) / 2 - cropperSize
        }

        cropperDomRender('top', cropperTranslation + 'px')
      } else { // 剪裁框水平移动
        cropperTranslation += differ.dx

        // 左边界校验
        if (cropperTranslation <= (cropBoxWidth - imageWidth) / 2) {
          cropperTranslation = (cropBoxWidth - imageWidth) / 2
        }
        // 右边界校验
        if (cropperTranslation + cropperSize >= cropBoxWidth - (cropBoxWidth - imageWidth) / 2) {
          cropperTranslation = cropBoxWidth - (cropBoxWidth - imageWidth) / 2 - cropperSize
        }

        cropperDomRender('left', cropperTranslation + 'px')
      }

      touchPosition = currentPosition
    },
    // 计算两次触摸事件之间的位置差距
    getTouchDiffer (touch) {
      return {
        dx: touch.x - touchPosition.x,
        dy: touch.y - touchPosition.y
      }
    },

    // 旋转图片
    rotateImage () {
      rotateTimes++
      this.renderRotatedImage()
    },
    // 校正图片方向
    checkOrientation (orientation) {
      switch (orientation) {
        case 6: // 90deg
          rotateTimes = 1
          this.renderRotatedImage()
          break

        case 3: // 180deg
          rotateTimes = 2
          this.renderRotatedImage()
          break

        case 8: // 270deg
          rotateTimes = 3
          this.renderRotatedImage()
          break

        default:
          this.computeImageSize()
      }
    },
    // 渲染旋转后的图片
    renderRotatedImage () {
      this.loading = true
      forward = rotateTimes % 4

      this.imageDataUrl = ImageManager.rotateImage({
        image: originImage,
        mimeType,
        forward
      })
    },

    // 取消剪裁
    cancelCrop () {
      this.$emit('on-cancel')
    },
    // 确定剪裁
    ensureCrop () {
      // 剪裁框位移距离需要减去图片与屏幕上边与左边的黑色部分的距离
      if (cropperOrientation === 'vertical') cropperTranslation -= ((cropBoxHeight - imageHeight) / 2)
      else cropperTranslation -= ((cropBoxWidth - imageWidth) / 2)

      // 计算剪裁的起始位置
      let cropPosition = 0
      if (originImage.width > originImage.height) {
        if (forward === 0) cropPosition = cropperTranslation / imageWidth * originImage.width
        if (forward === 1) cropPosition = cropperTranslation / imageHeight * originImage.width
        if (forward === 2) cropPosition = (imageWidth - cropperSize - cropperTranslation) / imageWidth * originImage.width
        if (forward === 3) cropPosition = (imageHeight - cropperSize - cropperTranslation) / imageHeight * originImage.width
      } else {
        if (forward === 0) cropPosition = cropperTranslation / imageHeight * originImage.height
        if (forward === 1) cropPosition = (imageWidth - cropperSize - cropperTranslation) / imageWidth * originImage.height
        if (forward === 2) cropPosition = (imageHeight - cropperSize - cropperTranslation) / imageHeight * originImage.height
        if (forward === 3) cropPosition = cropperTranslation / imageWidth * originImage.height
      }

      this.$emit('on-crop', ImageManager.cropImage(originImage, mimeType, forward, cropPosition, originImage.width > originImage.height ? originImage.height : originImage.width))
    }
  },
  watch: {
    imageDataUrl () {
      this.$nextTick(() => {
        this.renderImage()
      })
    }
  },
  mounted () {
    cropBoxWidth = this.$refs.cropBox.clientWidth
    cropBoxHeight = this.$refs.cropBox.clientHeight
    cropBoxRatio = cropBoxWidth / cropBoxHeight
    $image = this.$refs.image
    $cropper = this.$refs.cropper
    imageDomRender = ImageManager.renderStyle($image)
    cropperDomRender = ImageManager.renderStyle($cropper)
    cropperListenerTrigger = ImageManager.triggerListener($cropper)
  },
  destroyed () {
    originImage = null
    firstLoad = true
    rotateTimes = forward = 0
  }
}
</script>

<style scoped>
.t-image-crop {
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background: #000;
  z-index: 1000;
}

.t-absolute {
  position: absolute;
}

.t-invisible {
  opacity: 0;
}

.t-absolute-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.t-image-crop-tip {
  color: #fff;
  font-size: 10px;
}

.t-image-crop-image {
  position: absolute;
}

.t-image-crop-area {
  border: 1px solid rgba(255, 255, 255, .5);
  box-shadow: 0 1px 10px rgba(0,0,0,1);
}

.t-image-crop-area:before, .t-image-crop-area:after {
  content: "";
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.t-image-crop-area:before {
  width: 100%;
  height: 33.333333%;
  border-top: 1px dashed rgba(255, 255, 255, .5);
  border-bottom: 1px dashed rgba(255, 255, 255, .5);
}

.t-image-crop-area:after {
  width: 33.333333%;
  height: 100%;
  border-left: 1px dashed rgba(255, 255, 255, .5);
  border-right: 1px dashed rgba(255, 255, 255, .5);
}

.t-image-crop-mask {
  background: rgba(255, 255, 255, .5)
}

.t-image-crop-buttons-item {
  position: absolute;
  bottom: 10px;
  padding: 5px 10px;
  color: rgba(255, 255, 255, 1);
  border: 1px solid rgba(255, 255, 255, 1);
  border-radius: 4px;
  text-shadow: 1px 1px 0 rgba(0,0,0,1);
  box-shadow: 0 1px 10px rgba(0,0,0,1);
  z-index: 1;
}

.t-image-crop-buttons-cancel {
  left: 10px;
}

.t-image-crop-buttons-ensure {
  right: 10px;
}

.t-image-crop-buttons-rotate {
  left: 50%;
  transform: translateX(-50%);
}
</style>