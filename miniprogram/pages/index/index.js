// miniprogram/pages/index/index.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 这里用绝对路径就会报错，相对路径就不会
    // swiperPics:[
    //   '../../images/swiper/01.jpg',
    //   '../../images/swiper/02.jpg',
    //   '../../images/swiper/03.jpg'
    // ],
    // 之前都是用本地数据，弄了cms之后，就可以从数据库中读取更新了
    swiperPics:[],
    userList:[],
    tab:'thumbs'
  },
  handleThumbs(event){
    const {_id} = event.target.dataset
    // 因为小程序数据库权限，最高也只是改自己的数据，读所有数据，但是是没有办法修改别人的数据的
    // 所以我们不能在前端修改数据库，而是在服务端云开发中
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'update',
      // 传递给云函数的参数
      data:{
        doc:_id,
        collection:'users',
        data:"{thumbs : _.inc(1)}"
      },
      success: res => {
        if (res.result.stats.updated) {
          // 从data中取出，但不能直接修改userList（应该通过setData）,所以就拷贝克隆了一份
          const userList = [...this.data.userList]
          for(let i = 0 ; i < userList.length ;i++){
            if (userList[i]._id === _id) {
              userList[i].thumbs++
            }
          }
          // 还要更新data中的
          this.setData({userList})
        }
      },
      fail: err => {
        console.log(err);
      }
    })
  },
  getData(tab){
    this.setData({tab},()=>{
      // 更新数据库
      db.collection('users')
      .orderBy(tab,'desc')
      .field({
        avatarUrl:true,
        nickName:true,
        thumbs:true,
      }).get({
        success:(res)=>{
          this.setData({userList:res.data})
        }
      })
    })
  },
  handleTab(event){
    const {tab} = event.target.dataset
    this.getData(tab)
  },
  toDetail(event){
    const {id} = event.target.dataset
    wx.navigateTo({
      url: '/pages/detail/detail?userId=' + id,
    })
  },
  getBanner(){
    db.collection('banner').get({
      success:res=>{
        this.setData({swiperPics:res.data})
        // console.log(res.data);
        
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData(this.data.tab)
    this.getBanner()
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