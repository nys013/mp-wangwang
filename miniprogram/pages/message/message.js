// miniprogram/pages/message/message.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logged:false,
    messageList:[]
  },
  deleteEvent(){
    this.setData({messageList:app.messageList})
  },
  messageWatch(){
    db.collection('message').where({userId:app.userInfo._id}).watch({
      onChange:(snapshot)=>{
        if (snapshot.docChanges.length) {
          this.setData({messageList:app.messageList})
        }
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad');
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('onReady');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 不断监听消息变化----------记得想为什么
    // 因为其他生命周期仅在初次触发一遍，而onShow在进入该页面就触发，那么当我们接受到消息，到该页面就可以获取到最新的消息了，不过就是和qq的在当前页面就接受到消息有些差距，这里是即使有新消息，也要重新触发onShow才能获取到
    if (!app.userInfo._id) {
      // 没有登录则跳转到登录界面
      wx.showToast({
        title: '请先登录',
        icon:'none'
      })
      setTimeout(()=>{
        wx.switchTab({
          url: '/pages/my/my',
        })
      },600)
    } else {
      this.setData({logged:true})
          // 启动监听app的数据变化(采用的是再次监听数据库的方式)
      this.messageWatch()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})