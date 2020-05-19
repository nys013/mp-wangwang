// miniprogram/pages/detail/detail.js
const db = wx.cloud.database()
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    isFriend:false,
    userId:'',
    isMe:false
  },
  // 发起添加好友的请求
  handleAdd(){
    // 首先判断有无登录
    const myId = app.userInfo._id
    if (!myId) {
      // 没有登录则跳转到登录界面
      wx.showToast({
        title: '请先登录',
        icon:'none'
      })
      wx.switchTab({
        url: '/pages/my/my',
      })
    } else {
      // 数据库的设计——userId被添加的用户，list申请添加好友的id列表
      // 首先判断数据库中有无该被添加的用户
      const {userId} = this.data
      db.collection('message').where({userId}).get({
        success:res=>{
          // 有就更新
          if (res.data.length > 0 ) {
            // 判断当前用户是否已经申请过了
            if (res.data[0].list.indexOf(myId) !== -1) {
              wx.showToast({
                title: '无需重复申请',
                icon:'none'
              })
            } else {
              // 通过云函数update更新
              wx.cloud.callFunction({
                name:'update',
                data:{
                  collection:"message",
                  where:{userId},
                  data:`{list:_.unshift('${myId}')}`
                }
              }).then(res => {
                wx.showToast({
                  title: '发送申请成功',
                })
              })
              
            }
          } else {
            // 没有就往里添加
            wx.showToast({title:'发送申请成功'})
            db.collection('message').add({
              data:{
                userId,
                list:[myId]
              }
            })
          }
        },
        fail(err){
          console.log('err', err);
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const {userId} = options
    this.setData({userId})
    console.log(userId);
    db.collection('users').doc(userId).get({
      success:res => {
        this.setData({userInfo:res.data})
        if (res.data._id === app.userInfo._id) {
          this.setData({isMe:true})
        }else if (res.data.friendList.indexOf(app.userInfo._id) !== -1){
          this.setData({isFriend:true})
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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