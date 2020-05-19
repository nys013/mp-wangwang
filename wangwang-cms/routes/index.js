const router = require('koa-router')()
const config = require('../config.js')
const request = require('request-promise')
const fs = require('fs')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

// 后台写前台传文件的对应接口

router.post('/uploadBannerImg', async (ctx , next) => {
  // ctx包含express中的res和req
  // 从ctx的request，请求中取出文件
  var files = ctx.request.files;
  // files为对象，里面有file文件为我们请求上传的文件信息
  var file = files.file;
  // console.log( files );

  // try{} catch(){} 容错
  try {
    // 文件后台获取到还不够，还需要存到云存储，以及将云存储的地址存到数据库中
    /* 总共发四次请求，配置四次：
    1.获取到access_token 
    2.获取文件上传链接 
    3.将文件相关存入数据库 
    4.将文件相关存入云存储
    */

    // 查阅文档，第一步，获取access_token，这是包含appid，secret（密钥）这些重要信息，意通过凭证
    // 小程序开发文档-服务端-接口调用凭证
    // 定义发送请求的配置
    let options = {
        // 
        uri: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + config.appid +'&secret=' + config.secret + '',
        json:true // Automatically parses the JSON string in the response 大概就是配置了这一项就会默认返回的是json对象，会自动JSON.parse
    }
    // 用第三方库request-promise来发送请求，可在github上搜
    // 将配置选项传入后发送请求，获取到token
    let {access_token} = await request(options);
    // 上传的文件名
    let fileName = `${Date.now()}.jpg`;
    // 上传到云存储中的路径
    let filePath = `banner/${fileName}`;
    // 第二步，配置上传文件发送请求所有的参数
    options = {
        method: 'POST',
        // 请求地址文档上有
        uri: 'https://api.weixin.qq.com/tcb/uploadfile?access_token=' + access_token + '',
        // 除了请求地址，还需要env和path，在请求体中
        body: {
            "env": 'dev-cloud-nys',
            "path": filePath,
        },
        json: true  //文档上也有写返回值是JSON数据包，所以就配置这样，自动转化为对象
    }
    // 发送请求得到相应的数据
    let res = await request(options);
    // 取出文件的_id
    let file_id = res.file_id;

    // 第三步，将文件id存入数据库（文档有：云开发-HTTP API文档-数据库-导入）
    // 记得在小程序云开发中也要创建一下banner集合
    options = {
      method : 'POST',
      uri : 'https://api.weixin.qq.com/tcb/databaseadd?access_token=' + access_token + '',
      body : {
        "env": 'dev-cloud-nys',
        "query" : "db.collection(\"banner\").add({data:{fileId:\""+ file_id +"\"}})"
      },
      json : true
    }
    // 发送请求，这里不需要相应数据
    await request(options)

    // 第四步，真正将文件上传上去，第二步只是获取到文件上传的连接以及一些相关配置
    // 用户获取到uploadFile返回数据后，需拼装一个 HTTP POST 请求
    // 其中 url 为返回包的 url 字段，Body 部分格式为 multipart/form-data...文档都有写，直接从res中取出对应上即可
    options = {
        method: 'POST',
        uri: res.url,
        formData: {
            "Signature": res.authorization,
            "key": filePath,
            "x-cos-security-token": res.token,
            "x-cos-meta-fileid": res.cos_file_id,
            // file是文件内容（讲真，这个file的要写什么内容文档没看到，看得懂，但下次怎么写就不确定了）
            "file": {
                // 创建可读流得到文件，参数为请求的文件本地路径
                value: fs.createReadStream(file.path),
                // 配置选项
                options: {
                    filename: fileName,
                    contentType: file.type
                }
            }
        }
    }
    await request(options);
    ctx.body = res;

  } catch (err) {
      console.log(err.stack)
  }

})

module.exports = router
