<template>
<div style="padding: 10px;">
  <EasyMd style="width: 500px; margin-bottom: 10px; border: 1px solid #999;"
          @on-change="mdChanged"></EasyMd>
  <EasyMd style="width: 500px;" readonly :defaultContent="content"></EasyMd> 
</div>
</template>

<script>
import EasyMd from '@/src/easyMarkdown/EasyMd'

export default {
  name: 'Markdown',
  components: { EasyMd },
  data () {
    return {
      content: ''
    }
  },
  methods: {
    mdChanged (content) {
      this.content = content
    }
  }
}
</script>