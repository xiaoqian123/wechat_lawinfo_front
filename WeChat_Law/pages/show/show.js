const app = getApp()
Page({
  data: {
    load_time : 3000,
    text:''
  },
  onLoad: function (optionse) {
    // 页面渲染后 执行
 
    var self = this;
   // var str = '{"name":"huangxiaojian","age":"23"}';  
    console.log("进入show",optionse);
    self.testSumit(optionse.id);

  },
  onShow: function (){
    
  },
  onReady:function(){
    var self = this;
  },
  getUrl:function(url)
  {
    var self=this;
    console.log("url",self.data.content_website)
    wx.setClipboardData({
      data: self.data.content_website,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '成功复制原文链接',
              icon: 'none',
              duration: 1500
            });
          }
        })
      }
    })
  },
  testSumit: function (dataid)
  {
    var self = this;
    self.showloading()
    console.log('form发生了submit事件，携带数据为：', dataid)
    wx.request({
      url: 'https://legal1.cratedb.tech/selectContent',
      data: { dataid: dataid},
      method: 'GET',
      header: { 'content-Type': 'application/json' },
      success: function (res) {
        console.log('content：',res)
        if (res.data=='')
        {
          console.log('content：Null')
          self.setData({
            title: "此文章暂无",
          })
         
        }else{
          console.log('content：', res.data)
          var content_test = "";
          for (var i = 1; i < res.data[4].length; i++)       //字典转字符串
            content_test = content_test + res.data[4][i];
          console.log('content_json：', content_test)

          self.setData({
            title: res.data[0],
            issuing_department: res.data[1],
            time: res.data[2],
            content: content_test,
            content_website: res.data[5],
            text: '点击获取原文链接'
          })
         
        }
        wx.hideLoading();
      }, 
      fail:function(){
        wx.hideLoading();
      }
    })
   // console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },
    showloading: function () {
    wx.showLoading({
      title: '数据加载中',
      icon: 'loading',
      mask: true,
    });
  },

})