<template>
<div class="t-md-box">
  <textarea v-if="!readonly"
            class="t-md-textarea"
            v-model="content"></textarea>

  <div v-else class="t-md-readarea"
       v-html="renderedContent"></div>
</div>
</template>

<script>
import mdRender from './MdManager'
import { markdown } from 'markdown'

export default {
  name: 'EasyMd',
  props: {
    readonly: {
      type: Boolean,
      default: false
    },
    defaultContent: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      content: '',
      renderedContent: ''
    }
  },
  methods: {
    parseMd () {
      // this.renderedContent = markdown.toHTML(this.content)
      this.renderedContent = mdRender(this.content)
    }
  },
  watch: {
    defaultContent () {
      this.content = this.defaultContent
      this.parseMd()
    },
    content () {
      this.$emit('on-change', this.content)
    }
  },
  created () {
    this.content = this.defaultContent
  }
}
</script>

<style>
.t-md-textarea, .t-md-readarea {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 200px;
  padding: 10px;
  line-height: 1.5;
  border-style: none;
  font-size: 14px;
  resize: none;
}

.t-md-style-h1 {
  font-size: 20px;
  font-weight: bolder;
  line-height: 2;
}

.t-md-style-h2 {
  font-size: 18px;
  font-weight: bolder;
  line-height: 1.8;
}

.t-md-style-h3 {
  font-size: 16px;
  font-weight: bolder;
  line-height: 1.6;
}

.t-md-style-bolder {
  font-weight: bolder;
}

.t-md-style-italic {
  font-style: italic;
}

.t-md-style-underline {
  text-decoration: underline;
}

.t-md-style-throughline {
  text-decoration: line-through;
}

.t-md-style-list {
  padding-left: 20px;
  list-style: initial;
}
</style>