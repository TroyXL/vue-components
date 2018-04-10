<template>
<div style="padding: 10px;">
  <EasyMd style="width: 500px; margin-bottom: 10px; border: 1px solid #999;"
          @on-change="mdChanged"></EasyMd>
  <EasyMd style="width: 500px;" readonly :defaultContent="content"></EasyMd> 
  <Markdown></Markdown>
</div>
</template>

<script>
import EasyMd from '@/src/easyMarkdown/EasyMd'
import Markdown from '@/src/markdown/Markdown'

export default {
  name: 'MyMarkdown',
  components: { EasyMd, Markdown },
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