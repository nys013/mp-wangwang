// miniprogram/pages/my/my.js
// 引入数据库
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName:'小汪汪',
    avatarUrl:'../../images/icon/我的.png',
    logged:false,
    id:''
  },

  bindgetuserinfo(event){
    if (event.detail.userInfo) {
      const {nickName,avatarUrl} = event.detail.userInfo
      // 存入数据库
      db.collection('users').add({
        data:{
          nickName,
          avatarUrl,
          phoneNum:'',
          wxNum:'',
          thumbs:0,
          signature:'',
          time: new Date(),
          friendList:[],
          isLocationOpen:true,
          latitude:this.latitude,
          longitude:this.longitude,
          // 存的时候就要存地理位置点
          location:db.Geo.Point(this.longitude, this.latitude)
        }
      }).then((res) => {
        // res中有_id为当前数据的唯一标识，所以可以通过它取出
        db.collection('users').doc(res._id).get({
          success:(res)=>{
            // 然后放入app中供其他页面共用
            app.userInfo = {...app.userInfo,...res.data}
            // 更新当前页面数据
            this.setData({
              nickName,
              avatarUrl,
              logged:true,
              id:res.data._id
            })
          }
        })
      })
    }
  },

  messageWatch(){
    db.collection('message').where({userId:app.userInfo._id}).watch({
      onChange(snapshot){
        if (snapshot.docChanges.length) {
          const {list} = snapshot.docChanges[0].doc
          if (list.length) {
            // 如果长度不为0，那么就是有消息，显示圆点，并将消息存到App中供其他页面使用
            wx.showTabBarRedDot({index:2})
            app.messageList = list
          }else{
            wx.hideTabBarRedDot({index:2})
            app.messageList = []
          }
        }
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })
  },
  getLocation(){
    wx.getLocation({
      type: 'gcj02',
      success: (res)=> {
        console.log(res);
        this.latitude = res.latitude
        this.longitude = res.longitude
      },
      fail:err=>{
        // 不授权，那就设为默认值
        this.latitude = 0
        this.longitude = 0
      }
     })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 首先获取经纬度（感觉时机不是很对，但是不管啦）
    console.log("getLocation");
    
    this.getLocation()
    // 通过login云函数得到openid,查询数据库来判断是否登录
    wx.cloud.callFunction({
      name:'login',
      success:(res)=>{
        // console.log(res);
        // 查找数据库
        db.collection('users').where({
          _openid:res.result.openid
        }).get({
          success:(res) => {
            const userInfo = res.data[0]
            // 然后放入app中供其他页面共用
            app.userInfo = {...app.userInfo,...userInfo}
            const {nickName,avatarUrl} = userInfo
            // 更新当前页面数据
            this.setData({
              nickName,
              avatarUrl,
              logged:true,
              id:userInfo._id
            })
            // 登录成功，则开启消息监听
            this.messageWatch()
          }
        })
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
    const {nickName,avatarUrl} = app.userInfo
    if (nickName) {
      this.setData({nickName,avatarUrl})
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