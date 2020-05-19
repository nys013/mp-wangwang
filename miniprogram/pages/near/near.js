// miniprogram/pages/near/near.js
const db = wx.cloud.database()
const app = getApp()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    longitude:0,
    latitude:0,
    markers:[]
  },
  getLocation(){
    // 光这样设置还不行，会弹出在app.json中声明permission字段，详细见框架-小程序配置-全局配置-permission
    wx.getLocation({
      type: 'gcj02',
      success: (res)=> {
        const latitude = res.latitude
        const longitude = res.longitude
        this.setData({latitude,longitude},()=>{
          // 更新到数据库
          if (app.userInfo._id) {
            db.collection('users').doc(app.userInfo._id).update({
              data:{
                latitude,
                longitude,
                location:db.Geo.Point(longitude,latitude)
              },
              success:res=>{
                // 获取附近的用户
                this.getNearLocation()
              }
            })
          }else{
            // 获取附近的用户
            this.getNearLocation()
          }
        })
      },
      fail:err=>{
        wx.showModal({
          title: '授权地理位置',
          content:'您需要授权地理位置才能看到附近的人',
          success:res=>{
            if (res.confirm) {
              wx.openSetting({
                success:res=>{
                  console.log(res);
                }
              })
            }
          }
        })
      }
    })
  },
  getNearLocation(){
    // 获取在我附近一定范围的经纬度
    // console.log(this.data.longitude,this.data.latitude);
    db.collection('users').where({
      location: _.geoNear({
        geometry: db.Geo.Point(this.data.longitude,this.data.latitude),
        minDistance: 0,
        maxDistance: 1000000,
      }),
      isLocationOpen:true
    }).field({
      avatarUrl:true,
      latitude:true,
      longitude:true
    }).get({
      success:(res)=>{
        const markers = res.data.reduce((pretotal,item) => {
          pretotal.push({
            // 视频上iconPath不支持云地址，但是现在这个时间已经支持了
            iconPath: item.avatarUrl,
            id: item._id,
            latitude: item.latitude,
            longitude: item.longitude,
            width: 50,
            height: 50
          })
          return pretotal
        },[])
        this.setData({markers})
      }
    })
  },
  handleMarkerTap(event){
    wx.navigateTo({
      url: '/pages/detail/detail?userId=' + event.markerId,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    this.getLocation()
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