<template>
<div class="t-scroll"
     ref="$scroll"
     :style="{ height: this.scrollViewHeight + 'px' }"
     @scroll.passive="onScroll">
  <div class="t-scroll-padding-top" :style="{height: scrollData.paddingTop + 'px'}"></div>
    
    <div ref="$cell" v-for="item in scrollData.displayCells">
      <slot name="cell" :cell="item"></slot>
    </div>

  <div class="t-scroll-padding-bottom" :style="{height: scrollData.paddingBottom + 'px'}"></div>
</div>
</template>

<script>
import ScrollManager from './ScrollManager'

let manager
let lastScrollTop = 0
let heightFixed = true

export default {
  name: 'InfiniteScroll',
  props: {
    scrollViewHeight: {
      type: Number,
      required: true
    },

    list: {
      type: Array,
      required: true
    },
    // cell缓存数量 即不在可视区域内的预加载数量
    cellCacheNumber: {
      type: Number,
      default: 3
    },
    // cell高度值 如果为0或不传则为动态高度 不为0则为固定高度
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
        scrollViewHeight: this.scrollViewHeight,
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
        if (!heightFixed) manager.updateCellHeight(
          this.$refs.$cell.map(item => item.getBoundingClientRect().height)
        )
      })
    },


    onScroll () {
      lastScrollTop = this.$refs.$scroll.scrollTop
      manager.updateScroll(lastScrollTop)
      this.updateScrollRender()
    }


  },
  watch: {
    list () {
      manager.updateList(this.list)
    }
  },
  mounted () {
    if (!this.cellHeight) heightFixed = false
    this.initScrollManager()
    this.updateScrollRender()
  }
}
</script>

<style scoped>
.t-scroll  {
  position: relative;
  background: #eeeeee;
  overflow: scroll;
}
.t-scroll-cell {
  color: #ffffff;
  font-size: 30px;
  font-weight: bolder;
}
</style>