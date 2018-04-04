export default function mdRender (content) {
  let contentArr = content.split(/\n/).map(content => ({
    text: content,
    rendered: content,
    isHeader: false
  }))
  console.log(contentArr)
  return contentArr.map(content => Parsers.parse(content))
                   .map(content => `<div>${content.rendered}</div>`).join('')
}

const Parsers = {
  isHeader: true,
  rendered: '',

  parse (content) {
    this.rendered = content.rendered
    this.isHeader = content.isHeader
    this.renderHeader()
    this.renderBolder()
    // this.renderItalic()
    return {
      text: content.text,
      rendered: this.rendered,
      isHeader: this.isHeader
    }
  },
  // 标题渲染
  renderHeader () {
    const length = this.rendered.length - 1
    const origin = this.rendered
    this.rendered = this.rendered.replace(/^#\s(.{1,})/, `<h1 class="t-md-style-h1">$1</h1>`)
    this.rendered = this.rendered.replace(/^##\s(.{1,})/, `<h1 class="t-md-style-h2">$1</h1>`)
    this.rendered = this.rendered.replace(/^###\s(.{1,})/, `<h1 class="t-md-style-h3">$1</h1>`)
    if (this.rendered === origin) this.isHeader = false
  },

  // 加粗
  renderBolder () {
    if (this.isHeader) return // 如果当前为标题，则不再对里面的内容进行解析

    while (this._warkWithReg(/[\*]{2}(.{1,})[\*]{2}?/)) {
      this.rendered = this.rendered.replace(/[\*]{2}(.{1,})[\*]{2}?/,
                                            (matched, content) => `<span class="t-md-style-bolder">${content}</span>`)
      console.log('---', this.rendered)
    }
  },

  // 斜体
  renderItalic () {
    console.log(this.rendered)
    this.rendered = this.rendered.replace(/[\*]{1}([^*]{1,})[\*]{1}/g,
                                          (matched, content) => `<span class="t-md-style-italic">${content}</span>`)
  },



  _warkWithReg (reg) {
    console.log(this.rendered, reg.exec(this.rendered))
    return reg.exec(this.rendered) !== null
  }









}