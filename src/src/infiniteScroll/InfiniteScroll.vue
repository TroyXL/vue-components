<template>
<div ref="$scroll" class="t-scroll" @scroll.passive="onScroll">
  <div class="t-scroll-padding-top" :style="{height: scrollData.paddingTop + 'px'}"></div>
  <div class="t-scroll-cell" ref="$cell"
    v-for="(item, key) in scrollData.displayCells" :key="key"
    :style="item">{{item.text}}</div>
  <div class="t-scroll-padding-bottom" :style="{height: scrollData.paddingBottom + 'px'}"></div>
</div>
</template>

<script>
import ScrollManager from './ScrollManager'

let manager
let inInterval = false
let interval
let lastScrollTop = 0

export default {
  name: 'InfiniteScroll',
  props: {
    list: {
      type: Array,
      required: true
    },
    // cell缓存数量 即不在可视区域内的预加载数量
    cellCacheNumber: {
      type: Number,
      default: 3
    },
    // cell高度值 如果为0则为动态高度 不为0则为固定高度
    cellHeight: {
      type: Number,
      default: 0
    },

  },
  data () {
    return {
      scrollData: {
        scrollHeight: 0,
        paddingTop: 0,
        paddingBottom: 0,

        displayCells: []
      }
    }
  },
  
  methods: {
    initScrollManager () {
      manager = new ScrollManager({
        list: this.list,
        scrollViewHeight: this.$refs.$scroll.offsetHeight,
        cellHeight: this.cellHeight,
        cellCacheNumber: this.cellCacheNumber,
        firstRenderNumber: 10
      })
    },

    updateScrollRender () {
      this.scrollData = manager.getRenderInfo()
      this.$forceUpdate()
      // 更新完成后矫正滚动条位置
      this.$nextTick(() => {
        this.$refs.$scroll.scrollTop = lastScrollTop
      })
    },


    onScroll () {
      // console.log(this.$refs.$cell[0].getBoundingClientRect())
      lastScrollTop = this.$refs.$scroll.scrollTop
      manager.updateScroll(lastScrollTop)
      this.updateScrollRender()
    }


  },
  mounted () {
    this.initScrollManager()
    this.updateScrollRender()
  }
}
</script>

<style scoped>
.t-scroll  {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #eeeeee;
  overflow: scroll;
}
.t-scroll-cell {
  color: #ffffff;
  font-size: 30px;
  font-weight: bolder;
}
</style>