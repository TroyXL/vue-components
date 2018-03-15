<template>
<InfiniteScroll :list="cells" :cellHeight="100" />
</template>

<script>
import InfiniteScroll from '@/src/infiniteScroll/InfiniteScroll'

export default {
  name: 'Scroll',
  components: { InfiniteScroll },
  computed: {
    cells () {
      return new Array(1000).fill(1).map((item, index) => {
        return {
          // height: Math.floor(Math.random() * 100 + 100) + 'px',
          height: '100px',
          background: this.getRandomColor(),
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