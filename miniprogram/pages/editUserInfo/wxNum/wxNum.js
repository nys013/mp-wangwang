// miniprogram/pages/editUserInfo/wxNum/wxNum.js
const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    value:0
  },
  handleEdit(){
    wx.showLoading({title:'修改中'})
    // 修改数据库数据
    const {value} = this.data
    db.collection('users').doc(app.userInfo._id).update({
      data:{
        wxNum:value
      },
      success:()=>{
        wx.hideLoading()
        // 成功后修改app的数据
        app.userInfo.wxNum = value
        wx.showToast({title:'修改成功'})
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(app.userInfo.wxNum);
    this.setData({value:app.userInfo.wxNum})
    
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