// components/movableMsg/movableMsg.js
const db = wx.cloud.database()
const app = getApp()
const _ = db.command
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    msgId:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    userMsg:{},
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleDelete(){
      wx.showModal({
        title:'删除消息',
        content:'确认删除',
        confirmText:'删除',
        success:res=>{
          if (res.confirm) {
            // 确认删除时，删除相应的消息
            this.deleteMsg()
          } else {
            console.log('取消删除');
          }
        }
      })
    },
    handleAdd(){
      const myId = app.userInfo._id
      const targetId = this.data.msgId
      wx.showModal({
        title:'添加好友',
        content:'确认添加',
        confirmText:'添加',
        success:res=>{
          if (res.confirm) {
            // 确认添加时
            // 先向自己的数据库中添加
            db.collection('users').doc(myId).update({
              data:{
                friendList:_.push(targetId)
              }
            })
            // 再向对方的数据库中添加（此时因为权限设置，只能使用云函数）
            wx.cloud.callFunction({
              name:'update',
              data:{
                collection:'users',
                doc:targetId,
                data:`{"friendList":_.push('${myId}')}`
              }
            }).then(()=>{
              // 删除消息
              this.deleteMsg()
            })
          } else {
            console.log('取消添加');
          }
        }
      })
      
    },
    deleteMsg(){
       // 修改数据库 （视频是先查询，然后再更新），现在小程序有了查询、更新数组/对象了
      // 这里好像和查询、更新数组/对象关系不大...用 _.pull好像就可以了
      // _.pull是数组的更新操作符，给指定条件将数组中符合条件的移除
      //  ._remove是删除整个字段
      // 好友id仅测试用：05f2c36f5ebd528e00d4bc795d33ac26
      // 因为是更新别人的数据，有权限限制，所以需要调用云函数
      wx.cloud.callFunction({
        name:'update',
        data:{
          collection:'message',
          where:{userId:app.userInfo._id},
          data:`{"list":_.pull('${this.data.msgId}')}`
        }
      }).then(() => {
        // 数据库删除成功后，就要修改页面展现的数据
        // 触发父组件的事件
        this.triggerEvent('delete')
      })
    }
  },
  // 组件的生命周期
  lifetimes: {
    attached: function() {
      console.log('组件实例进入页面节点');
      
      // 在组件实例进入页面节点树时执行
      db.collection('users').doc(this.data.msgId).field({
        nickName:true,
        avatarUrl:true
      }).get({
        success:res=>{;
          this.setData({userMsg:res.data})
        }
      })
    },
  },
})
