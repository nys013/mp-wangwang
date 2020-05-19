// components/search/search.js
const db = wx.cloud.database()
Component({
  // 设置组件样式间隔为apply-shared
  options: {
    styleIsolation: 'apply-shared'
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    focus:false,
    value:'',
    historyList:[],
    searchList:[],
    isDelete:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleFocus(){
      this.setData({focus:true})
    },
    handleCancel(){
      this.setData({focus:false,value:'',searchList:[]})
    },
    handleConfirm(){
      let {value , historyList} = this.data
      historyList = [...historyList]
      historyList.unshift(value)
      historyList = [...new Set(historyList)]
      // 进行历史记录存储
      wx.setStorage({
        data: historyList,
        key: 'historyList',
        success:()=>{
          this.setData({historyList})
        }
      })
      // 进行数据库搜索功能
      db.collection('users').where({
        nickName:db.RegExp({
          regexp: value,
          options: 'i',
        })
      }).field({
        avatarUrl:true,
        nickName:true
      }).get({
        success:res=>{
          this.setData({searchList:res.data})
        }
      })
    },
    handleDelete(){
      wx.showModal({
        content: '清空历史记录',
        confirmText:'删除',
        success:res=>{
          if (res.confirm) {
            wx.removeStorage({
              key: 'historyList',
              success:()=>{
                this.setData({historyList:[]})
              }
            })
          }
        }
      })
    },
    historySearch(event){
      if (!this.data.isDelete) {
        console.log(event.target.dataset.historyvalue);
        const value = event.target.dataset.historyvalue
        this.setData({value},()=>{
          this.handleConfirm()
        })
      }
    },
    handleShowDel(event){
      // console.log(event,'长按删除');
      this.setData({isDelete:true})
    },
    deleteOne(event){
      const {historyvalue} = event.target.dataset
      const historyList = [...this.data.historyList]
      const start = historyList.indexOf(historyvalue)
      if (start !== -1) {
        historyList.splice(start,1)
        wx.setStorage({
          data: historyList,
          key: 'historyList',
          success:()=>{
            this.setData({historyList})
          }
        })
      }
    },
    handleHideDel(){
      this.setData({isDelete:false})
    },
    handleInput(){} //因为进行了数据的双向绑定，这个事件就没什么用了，但是不写会有警告，虽然警告也不影响但还是写了
  },
  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
      const historyList = wx.getStorageSync('historyList') || []
      this.setData({historyList})
      // console.log(historyList);
    }
  }
})
