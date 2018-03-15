<template>
<InfiniteScroll :list="cells">
  <div slot="cell" slot-scope="props"
  :style="props.cell.style">{{props.cell.text}}</div>
</InfiniteScroll>
</template>

<script>
import InfiniteScroll from '@/src/infiniteScroll/InfiniteScroll'

export default {
  name: 'Scroll',
  components: { InfiniteScroll },
  computed: {
    cells () {
      return new Array(100).fill(1).map((item, index) => {
        return {
          style: {
            height: Math.floor(Math.random() * 100 + 100) + 'px',
            // height: '100px',
            color: '#ffffff',
            fontSize: '30px',
            background: this.getRandomColor()
          },
          text: '#' + (index + 1)
        }
      })
    }
  },
  methods: {
    getRandomColor () {
      const colors = new Array(3).fill(1).map(item => Math.floor(Math.random() * 255))
      return `rgb(${colors.join(',')})`
    }
  }
}
</script>