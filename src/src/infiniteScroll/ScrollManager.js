export default class ScrollManager {
  constructor ( {
    list,
    scrollViewHeight,
    cellHeight,
    cellCacheNumber,
    firstRenderNumber // 动态高度时初次渲染的列表数量
  } ) {
    // 滚动可视区域与滚动列表高度
    this.scrollViewHeight = this.scrollHeight = scrollViewHeight
    // cell平均高度 等于0则为动态高度
    this.cellHeight = cellHeight
    this.heightFixed = cellHeight ? true : false
    // 预加载的cell数量
    this.cellCacheNumber = cellCacheNumber || 3
    // 渲染数量
    this.renderNumber = firstRenderNumber || 10

    // 滚动区域上下撑开的高度
    this.paddingTop = this.paddingBottom = 0
    // cell高度缓存
    this.heightCache = new Array(list ? list.length : 0).fill(this.cellHeight)
    // 渲染列表
    this.list = list
    // 待渲染列表
    this.displayCells = []
    // 当前待渲染列表的第一个元素为在全部列表中的位置
    this.currentRenderFirstCell = 0

    this.initScroll()
  }

  initScroll () {
    if (this.heightFixed) {
      this.scrollHeight = this.list.length * this.cellHeight
      this.renderNumber = Math.ceil(this.scrollViewHeight / this.cellHeight)
      this.displayCells = this.list.slice(0, this.renderNumber + this.cellCacheNumber * 2)
      this.paddingTop = 0
      this.paddingBottom = this.scrollHeight - this.displayCells.length * this.cellHeight
    }
  }

  // 滚动时更新数据
  updateScroll (scrollTop) {
    let passedCells = Math.floor(scrollTop / this.cellHeight)

    passedCells = passedCells > this.cellCacheNumber ? passedCells - this.cellCacheNumber : 0
    this.displayCells = this.list.slice(passedCells, this.renderNumber + this.cellCacheNumber * 2 + passedCells)
    
    if (this.heightFixed) {
      this.paddingTop = passedCells * this.cellHeight
      this.paddingBottom = this.scrollHeight - this.paddingTop - this.displayCells.length * this.cellHeight
    }
  }

  // 动态高度时根据已缓存的cell高度计算平均高度
  updateCellHeight (cellsRectInfo) {
    if (!this.heightFixed) {
      //
    }
  }

  // 列表数据有更新
  updateList () {

  }

  // 获取待渲染的列表及相关数据
  getRenderInfo () {
    return {
      scrollHeight: this.scrollHeight,
      paddingTop: this.paddingTop,
      paddingBottom: this.paddingBottom,
      displayCells: this.displayCells
    }
  }
}