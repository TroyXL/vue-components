export default class ScrollManager {
  constructor ( {
    list,
    scrollViewHeight,
    cellHeight,
    cellCacheNumber,
    firstRenderNumber // 动态高度时单屏初次渲染的列表数量
  } ) {
    // 滚动可视区域与滚动列表高度
    this.scrollViewHeight = this.scrollHeight = scrollViewHeight
    // cell平均高度 等于0则为动态高度
    this.cellHeight = cellHeight
    this.heightFixed = cellHeight ? true : false
    // 预加载的cell数量
    this.cellCacheNumber = cellCacheNumber || 3
    // 单屏渲染数量
    this.renderNumber = firstRenderNumber || 10

    // 滚动区域上下撑开的高度
    this.paddingTop = this.paddingBottom = 0
    // cell的高度数据缓存，只在不固定高度时有效
    this.heightCache = new Array(list ? list.length : 0).fill(this.cellHeight)
    // 渲染列表
    this.list = list
    // 待渲染列表
    this.displayCells = []
    // 当前待渲染列表的第一个元素为在全部列表中的位置
    this.passedCells = 0
    // 当前渲染的cells的总高度
    this.currentCellsTotalHeight = 0

    this.initScroll()
  }

  initScroll () {
    console.log(this.heightCache)
    if (this.heightFixed) { // cell高度固定时，校正滑动区域总高度，计算单屏渲染的cell数量及底部支撑高度
      this.scrollHeight = this.list.length * this.cellHeight
      this.renderNumber = Math.ceil(this.scrollViewHeight / this.cellHeight)
      this.displayCells = this.list.slice(0, this.renderNumber + this.cellCacheNumber * 2)
      this.paddingBottom = this.scrollHeight - this.displayCells.length * this.cellHeight
    } else { // cell高度不固定时，渲染初次加载的单屏cell数量
      this.displayCells = this.list.slice(0, this.renderNumber + this.cellCacheNumber * 2)
    }
  }

  // 滚动时更新数据
  updateScroll (scrollTop) {
    this.passedCells = Math.floor(scrollTop / this.cellHeight)

    this.passedCells = this.passedCells > this.cellCacheNumber ? this.passedCells - this.cellCacheNumber : 0
    this.displayCells = this.list.slice(this.passedCells, this.renderNumber + this.cellCacheNumber * 2 + this.passedCells)
    
    if (this.heightFixed) {
      this.currentCellsTotalHeight = this.displayCells.length * this.cellHeight
      this.paddingTop = this.passedCells * this.cellHeight 
    } else {
      this.paddingTop = this.heightCache.reduce((sum, height, index) => {
        if (index < this.passedCells) return sum + height
        return sum
      }, 0)
    }
    this.paddingBottom = this.scrollHeight - this.paddingTop - this.currentCellsTotalHeight
  }

  // 动态高度时根据已缓存的cell高度计算平均高度
  updateCellHeight (cellsHeightInfo) {
    console.log(cellsHeightInfo)
    if (this.heightFixed) return

    // 更新平均cell高度
    this.currentCellsTotalHeight = cellsHeightInfo.reduce((sum, height) => sum + height, 0)
    this.cellHeight = Math.round(this.currentCellsTotalHeight / cellsHeightInfo.length)
    this.renderNumber = Math.ceil(this.scrollViewHeight / this.cellHeight)
    // 保存已知cell的高度信息
    this.heightCache.splice(this.passedCells, cellsHeightInfo.length, ...cellsHeightInfo)
    // 预估滑动区域总高度
    this.scrollHeight = this.heightCache.reduce((sum, height) => {
      if (height) return sum + height
      return sum + this.cellHeight
    }, 0)
    console.log(this.heightCache.length, this.passedCells, cellsHeightInfo.length)
  }

  // 列表数据有更新
  updateList (newList) {
    this.list = newList
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