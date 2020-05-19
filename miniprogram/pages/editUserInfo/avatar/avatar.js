// miniprogram/pages/editUserInfo/avatar/avatar.js
const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:''
  },
  uploadPic(){
    wx.chooseImage({
      success:(res)=>{
        const avatarUrl = res.tempFilePaths[0]
        this.setData({avatarUrl})
      }
    })
  },
  handleEdit(){
    wx.showLoading({
      title: '更新中',
    })
    // 因为上面上传后，地址是本地临时地址，所以要传到数据库中
    wx.cloud.uploadFile({
      cloudPath: 'avatar/' + app.userInfo._openid + Date.now() + '.jpg', // 上传至云端的路径
      filePath: this.data.avatarUrl , // 小程序临时文件路径
      success: res => {
        // 修改数据库，app
        db.collection('users').doc(app.userInfo._id).update({
          data:{
            avatarUrl:res.fileID
          },
          success:()=>{
            wx.hideLoading()
            wx.showToast({
              title: '更新成功',
            })
            app.userInfo.avatarUrl = res.fileID
          }
        })
      },
      fail(err){
        wx.hideLoading()
        wx.showToast({
          title: '请先选择图片',
          icon:'none'
        })
        console.log('---',err)
      }
    })
  },
  bindgetuserinfo(event){
    wx.showLoading({
      title: '更新中',
    })
    const {avatarUrl} = event.detail.userInfo
    if (avatarUrl) {
      // 更新数据，可传第二个参数为回调，可在数据更新后调用
      this.setData({avatarUrl},()=>{
        // 修改数据库，app
        db.collection('users').doc(app.userInfo._id).update({
          data:{
            avatarUrl
          },
          success:()=>{
            wx.hideLoading()
            wx.showToast({
              title: '更新成功',
            })
            app.userInfo.avatarUrl = avatarUrl
          }
        })
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({avatarUrl:app.userInfo.avatarUrl})
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