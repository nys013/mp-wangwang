// components/copyText.js
Component({
  // 配置页面的样式能影响组件的样式
  options:{
    styleIsolation:"apply-shared"
  },
  /**
   * 组件的属性列表
   */
  properties: {
    phoneNum:String
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleCall(){
      // console.log(this.data.phoneNum);
      wx.makePhoneCall({
        phoneNumber:this.data.phoneNum,
        fail(){
          console.log('取消拨打');
        }
      })
    }
  }
})
