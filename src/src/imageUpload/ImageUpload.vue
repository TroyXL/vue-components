<template>
<div class="t-image-upload">
  <slot></slot>
  <input ref='input' type="file" class="t-upload-input" 
         :accept="accept"
         @click="inputClicked"
         @change="inputChanged">

  <ImageCrop ref="cropper"
             v-if="crop && showCrop"
             @on-crop="imageCroped"
             @on-cancel="imageCropCancel"></ImageCrop>
</div>
</template>

<script>
import ImageCrop from './ImageCrop'

import ImageManager from './ImageManager'

let mimeType = ''

export default {
  name: 'ImageUpload',
  components: { ImageCrop },
  props: {
    url: {
      type: String,
      required: true
    },
    accept: {
      type: String,
      default: 'image/jpg; image/jpeg; image/png;'
    },
    quality: {
      type: Number,
      default: 0.5,
      validator (value) {
        return value <= 1 && value > 0
      }
    },
    fileKeyName: {
      type: String,
      default: 'file'
    },
    crop: {
      type: Boolean,
      default: false
    },
    maxWidth: {
      type: Number
    },
    maxSize: {
      type: Number
    },
    params: {
      type: Array,
      default: () => [] // [key, value]
    }
  },
  data () {
    return {
      showCrop: false,
      imageDataUrl: ''
    }
  },
  methods: {
    // 重置 input
    resetInput () {
      this.$refs.input.value = ''
    },
    inputChanged (e) {
      let imageFile = this.$refs.input.files[0]

      this.resetInput()
      this.uploadBefore()

      if (!ImageManager.checkFileSize(imageFile, this.maxSize)) {
        this.onOversize(imageFile.size)
        return
      }

      ImageManager.file2DataUrl(imageFile)
                  .then(res => {
                    mimeType = res.mimeType
                    return ImageManager.url2Image(res.dataUrl)
                  })
                  .then(image => {
                    this.triggerCropper(ImageManager.compressImage(image, mimeType, this.maxWidth, this.quality))
                  })
                  .catch(err => {
                    console.error(err)
                    this.onError(typeof err === 'string' ? err.split('-')[0] : '图片处理出错')
                  })
      imageFile = null
    },

    triggerCropper (dataUrl) {
      if (this.crop) {
        this.showCrop = true
        this.$nextTick(() => {
          this.$refs.cropper.setImageDataUrl(dataUrl, mimeType)
        })
      } else this.imageDataUrl = dataUrl
    },

    // 确认剪裁
    imageCroped (imageDataUrl) {
      this.imageDataUrl = imageDataUrl
      this.imageCropCancel()
    },
    // 取消剪裁
    imageCropCancel () {
      this.showCrop = false
    },

    inputClicked () {
      this.$emit('on-click')
    },
    onOversize (fileSize) {
      this.$emit('on-oversize', fileSize)
    },
    onError (err) {
      this.$emit('on-error', err)
    },
    // 文件选取完毕时触发
    uploadBefore () {
      this.$emit('upload-before')
    },
    // 文件上传前触发
    uploadStart () {
      this.$emit('upload-start', this.imageDataUrl)
    },
    // 文件上传进度
    uploadProgress (progress) {
      this.$emit('upload-progress', progress)
    },
    // 文件上传成功
    uploadSuccess (res) {
      this.$emit('upload-success', res)
      this.uploadComplete()
    },
    // 文件上传失败
    uploadFail (err) {
      this.$emit('upload-fail', err)
      this.uploadComplete()
    },
    // 上传流程完成
    uploadComplete () {
      this.$emit('upload-complete')
    }
  },
  watch: {
    imageDataUrl () {
      const imageBlob = ImageManager.base64Url2Blob(this.imageDataUrl, mimeType)
      this.uploadStart()
      ImageManager.uploadImage({
        url: this.url,
        fileKey: this.fileKeyName,
        file: imageBlob,
        params: this.params,
        onProgress: e => {
          this.uploadProgress(e)
        }
      })
      .then(res => { this.uploadSuccess(res) })
      .catch(err => { this.uploadFail(err) })
    }
  }
}
</script>

<style scoped>
.t-image-upload {
  position: relative;
}

.t-upload-input {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  opacity: 0;
  z-index: 999;
}
</style>