// 云函数入口文件
const cloud = require('wx-server-sdk')
// 参考文档位置：云开发-SDK文档-数据库-collection-update
cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

// 引入数据库
const db = cloud.database()
// 小程序提供的一种方法，db.command.inc代表自增的意思，这样我们无需获取后再进行数据处理后插入
const _ = db.command

// 云函数入口函数
// event为该函数调用时传来的参数，context为...不知道（看到了，找不到，大概就是什么上下文之类的吧） 
exports.main = async (event, context) => {
  try{
    if (typeof event.data == 'string') {
      // 解析字符串，但是好像eval不建议使用，因为太容易有漏洞，不知道这里影响大不大
      event.data = eval('(' + event.data + ')')
      // 所以就用了JSON对象,但是发现并不合适，需要作为字符串的是_.inc(1)，如果直接JSON.stringify还是会报错，如果加了''，那就是个字符串了啊，还是需要eval解析的啊
      // event.data = JSON.parse(event.data)
    }
    if (event.doc) {
      return await db.collection(event.collection).doc(event.doc).update({
        data:{
          ...event.data
        }
      })
    } else {
      return await db.collection(event.collection).where({...event.where}).update({
        data:{
          ...event.data
        }
      })
      
    }
  }catch(err){
    console.log(err);
  }
}
