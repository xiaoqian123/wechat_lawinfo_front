function getSearchMusic(keyword, pageindex, callbackcount, choiceInstitution,isfirst, callback) {
  console.log("213123123")
  wx.request({
    url: 'https://legal1.cratedb.tech/test',
    data: {
      lpkeyword : keyword,           //搜索关键字  
      backnum: callbackcount,  //返回数据的个数  
      loadnum: pageindex,    //第几次加载
      isfirst: isfirst,
      choiceInstitution: choiceInstitution,
    },
    method: 'GET',
    header: { 'content-Type': 'application/json' },
    success: function (res) {
      console.log('content：', res.data)
      if (res.statusCode == 200) {
        callback(res.data);
      }
    }
  })
}

module.exports = {
  getSearchMusic: getSearchMusic
}  

