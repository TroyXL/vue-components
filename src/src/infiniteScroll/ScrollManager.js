export default class ScrollManager {
  constructor ( {
    list, // 待渲染的列表数据 Array
    scrollViewHeight, // 滚动视图的高度，即滚动区域可见部分的高度
    cellHeight, // 每个 item 的高度
    cellCacheNumber, // 上下两方缓冲的item数量
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

  // 初始化滚动列表
  // 计算首屏需要渲染的items和缓冲items
  initScroll () {
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
  // 根据滚动条高度计算已经划出屏幕并且不再需要渲染的items
  // 更新需要渲染的items和缓冲items
  // 并更新列表上方和下方需要支撑起的高度
  updateScroll (scrollTop) {
    if (this.heightFixed) {
      this.passedCells = Math.floor(scrollTop / this.cellHeight)

      this._adjustCells()
      
      this.currentCellsTotalHeight = this.displayCells.length * this.cellHeight
      this.paddingTop = this.passedCells * this.cellHeight 
    } else {
      let passedCellsHeight = 0
      for (let i = 0; i < this.heightCache.length; i++) {
        
        if (scrollTop >= passedCellsHeight) this.passedCells = i
        else break
        passedCellsHeight += this.heightCache[i] ? this.heightCache[i] : this.cellHeight
      }
      
      this._adjustCells()

      this.paddingTop = this.heightCache.reduce((sum, height, index) => {
        if (index < this.passedCells) return sum + height
        return sum
      }, 0)
    }
    this.paddingBottom = this.scrollHeight - this.paddingTop - this.currentCellsTotalHeight
    if (this.paddingBottom < 0) this.paddingBottom = 0
  }

  // 内部调用的调整items相关数据的方法
  // 包括已经不需要渲染的items和需要渲染的items
  _adjustCells () {
    this.passedCells = this.passedCells > this.cellCacheNumber ? this.passedCells - this.cellCacheNumber : 0
    this.displayCells = this.list.slice(this.passedCells, this.renderNumber + this.cellCacheNumber * 2 + this.passedCells)
  }

  // 动态高度时根据已缓存的cell高度计算平均高度，方法接受当前渲染的cells的高度数组
  // 对已经渲染过的cell高度进行缓存，保证上方的支撑高度计算准确
  // 对未渲染过的cell高度进行预估，保证下方的支撑高度尽量靠近实际高度
  // 调整整个滑动列表的总高度
  updateCellHeight (cellsHeightInfo) {
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
  }

  // 列表数据有更新
  // 暂未完成
  // 如果是固定高度列表则根据新的列表计算相关的信息（总高度、支撑高度、滚动条当前位置需要渲染的数据等）
  // 如果是非固定高度则重新预估总高度等信息
  // 即重复上面已有的步骤
  updateList (newList) {
    // this.list = newList
  }

  // 获取待渲染的items及相关数据
  getRenderInfo () {
    return {
      scrollHeight: this.scrollHeight,
      paddingTop: this.paddingTop,
      paddingBottom: this.paddingBottom,
      displayCells: this.displayCells
    }
  }
}