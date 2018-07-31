var util = require('../../utils/util.js')
Page({
  data: {
    searchKeyword: "",  //需要搜索的字符  
    searchSongList: [], //放置返回数据的数组  
    isFromSearch: true,   // 用于判断searchSongList数组是不是空数组，默认true，空的数组  
    searchPageNum: 0,   // 设置加载的第几次，默认是第一次  
    callbackcount: 10,      //返回数据的个数  
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false , //“没有数据”的变量，默认false，隐藏  
    sumdata_g:{},         //保存条件查询的条件
  },
  onLoad: function (optionse) {
    // 页面渲染后 执行
    var self = this;
    console.log(getApp().globalData.allOrPortion);
    if (getApp().globalData.allOrPortion){
      self.fetchSearchList();
    }else{
      self.data.searchPageNum=1;        //查询显示的，需回归默认
      self.data.callbackcount = 10;;
      var sumdata = JSON.parse(optionse.data);
      self.lookupSumit(sumdata, self.data.searchPageNum, self.data.callbackcount);
    }    


  },
  // getLookupStr:function(sumdata)         //得到查询条件 待考虑-------------------
  // {
  //   var str="";
  //   if (umdata.title)
  //   {
  //     str = str + 'title:'+umdata.title+'/';
  //   }
  //   if (sumdata.issuing_authority[0] != '0')
  //   {
  //     str = str + '发布机构:' + sumdata.issuing_authority[0] + '/';
  //   }
  //   if (sumdata.section[0] != '0')
  //   {
  //     str = str + '所属分类:' + sumdata.section[0] + '/';
  //   }
  //   if (sumdata.date_start && sumdata.date_end)
  //     str = str + sumdata.date_start + ':' + sumdata.date_end;
  // },
  lookupSumit: function (sumdata, pageindex, callbackcount) {
    var self = this;
    self.sumdata_g = sumdata;
    console.log('pageindex', pageindex, 'callbackcount', callbackcount,)
    wx.request({
      url: 'https://xiaoqian.cratedb.tech/lookup',
      data: { 
        title: sumdata.title,
        issuing_authority: sumdata.issuing_authority[0],
        section1: sumdata.section[0],
        date_start: sumdata.date_start,
        date_end: sumdata.date_end,
        backnum: callbackcount,  //返回数据的个数  
        loadnum: pageindex,    //第几次加载
             },
      method: 'POST',
      header: { 'content-Type': 'application/x-www-form-urlencoded' },
      success: function (data) {
       JSON.stringify(data.data)
        console.log('查询内容：', data.data) 
      
        if (data.data.length != 0) {
              let searchList = [];
              //如果isFromSearch是true从data中取出数据，否则先从原来的数据继续添加  
              self.data.isFromSearch ? searchList = data.data : searchList = self.data.searchSongList.concat(data.data) 
              self.setData({
                searchSongList: searchList, //获取数据数组  
              });
            //没有数据了，把“没有数据”显示，把“上拉加载”隐藏  
              if (data.data.length <= 9) {
                self.setData({
                  searchLoadingComplete: true, //把“没有数据”设为true，显示  
                  searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
                });
           } else {
                self.setData({
                  //searchSongList: searchList, //获取数据数组  
                  searchLoading: true   //把"上拉加载"的变量设为false，显示  
                });
              }
          }else{
            wx.showToast({
              title: '没有相关数据',
              icon: 'none',
              duration: 2000
            })
            self.setData({
              searchLoadingComplete: true, //把“没有数据”设为true，显示  
              searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
            });
        }
       }
    })

   },

  // //输入框事件，每输入一个字符，就会触发一次  
  // bindKeywordInput: function (e) {
  //   console.log("输入框事件")
  //   this.setData({
  //     searchKeyword: e.detail.value
  //   })
  // },
  lookupInput:function(){
    var self = this;
    console.log(getApp().globalData.allOrPortion);
    wx.navigateTo({
      url: '../lookup/lookup'
    })
  },
  // 搜索，访问网络  
  fetchSearchList: function () {
    var self = this;
    let searchKeyword = self.data.searchKeyword,//输入框字符串作为参数  
      searchPageNum = self.data.searchPageNum,//把第几次加载次数作为参数  
      callbackcount = self.data.callbackcount; //返回数据的个数  
    //访问网络  
    util.getSearchMusic(searchKeyword, searchPageNum, callbackcount, function (data) {
     // console.log('预加载:'+data)
      //判断是否有数据，有则取数据  
      if (data.length != 0) {
        let searchList = [];
        //如果isFromSearch是true从data中取出数据，否则先从原来的数据继续添加  
        self.data.isFromSearch ? searchList = data : searchList = self.data.searchSongList.concat(data)
        self.setData({
          searchSongList: searchList, //获取数据数组  
          searchLoading: true   //把"上拉加载"的变量设为false，显示  
        });
        //没有数据了，把“没有数据”显示，把“上拉加载”隐藏  
      } else {
        self.setData({
          searchLoadingComplete: true, //把“没有数据”设为true，显示  
          searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
        });
      }
    })
  },

  //点击搜索按钮，触发事件  
  keywordSearch: function (e) {
    this.setData({
      searchPageNum: 1,   //第一次加载，设置1  
      searchSongList: [],  //放置返回数据的数组,设为空  
      isFromSearch: true,  //第一次加载，设置true  
      searchLoading: true,  //把"上拉加载"的变量设为true，显示  
      searchLoadingComplete: false //把“没有数据”设为false，隐藏  
    })
    getApp().globalData.allOrPortion=true;
    this.fetchSearchList();
  },
  //滚动到底部触发事件  
  searchScrollLower: function () {
    var self = this;
    
    if (getApp().globalData.allOrPortion)       //用于判断是查询数据还是默认显示全部，默认为true为无条件查询
    {
      console.log('无条件查询', getApp().globalData.allOrPortion); 
      if (self.data.searchLoading && !self.data.searchLoadingComplete) {
        self.setData({
          searchPageNum: self.data.searchPageNum + 1,  //每次触发上拉事件，把searchPageNum+1  
          isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false  
        });
        self.fetchSearchList();
      }
    }else{
      console.log('条件查询', getApp().globalData.allOrPortion); 
      if (self.data.searchLoading && !self.data.searchLoadingComplete) {
        self.setData({
          searchPageNum: self.data.searchPageNum + 1,  //每次触发上拉事件，把searchPageNum+1  
          isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false  
        });
        console.log('查询条件111', self.sumdata_g); 
        self.lookupSumit(self.sumdata_g, self.data.searchPageNum, self.data.callbackcount);
      }
    }
      
  }
})  