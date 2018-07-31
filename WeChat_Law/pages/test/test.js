var util = require('../../utils/util.js')
Page({
  data: {
    ifhidden:true,
    searchKeyword: "",  //需要搜索的字符  
    inputShowed: false,
    searchPageNum: 0,   // 设置加载的第几次，默认是第一次    
    callbackcount: 7,      //返回数据的个数  
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏  
    sumdata_g: {},         //保存条件查询的条件  用在滚动带条件查询处
    sumdata_gtest:{},
    pageheight:0,
    
    lastscrollTop:0,
    tothetop:true,
    navBacksearch:false,

    searchSongList1: [], //放置返回数据的数组  
    searchSongList2: [], //放置返回数据的数组  
    searchSongList3: [], //放置返回数据的数组  
    isFromSearch: true,   // 用于判断searchSongList数组是不是空数组，默认true，空的数组   下拉事件时 设false 每次查询都要设true
    islist1: false,      //用于判断是否显示近一周
    islist2:false,
    islist3: false,

    islist2icon : false,
    islist3icon : false,
    
    isfirst:[],
    toView: 'top',

    titleInpt_disabled: false,
    institution_disabled:false,
    section_disabled:false,
    data_start_disabled:false,
    data_end_disabled:false,

    
    tmp:"",
    section_index: 0,
    institution_index: 0,
    choiceInstitution:[],
    choicename:"无",
    showView:true,
    test:true,
    title:'',
    name: '搜索',
    list: [
      {
        id: 'form',
        open: false,
 
      }, 
    ]
  },
  // onHide:function()
  // {
  //   getApp().globalData.allOrPortion=true;
  // },
  onUnload:function()
  {
    getApp().globalData.allOrPortion = true;
  },

  scroll: function (scroll){
    var self = this;
 
    if (self.data.lastscrollTop - scroll.detail.scrollTop>0)
    {
      self.setData({
        tothetop: true,
      })
    } else if (self.data.searchSongList1.length + self.data.searchSongList2.length + self.data.searchSongList3.length >= 15){
      self.setData({
        tothetop: false,
      })
    }
    self.data.lastscrollTop = scroll.detail.scrollTop;

  },

  onShow: function ()
  {
    var self = this;
    try {
      var res = wx.getSystemInfoSync()
      console.log("高度",res)
      self.setData({
        pageheight: res.windowHeight-100
      })
      var temradio = self.getSubscribe();
    } catch (e) {
      // Do something when catch error
    }
    if (getApp().globalData.isChSubscribe){
      var self = this;
      wx.showToast({
        title: '订阅已生效',
        icon: 'loading',
        mask: true,
      });
      self.getSubscribeInsi();
      console.log("订阅的机构", JSON.stringify(this.data.choiceInstitution));

      self.data.isfirst[0] = true;
      self.data.isfirst[1] = false;
      self.data.isfirst[2] = false;

      self.setData({
        isFromSearch: true,           //每次查询都刷新数组
        searchLoading: false,         //"上拉加载"的变量，默认false，隐藏  
        searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏  
        searchPageNum: 0,            //查询显示的，需回归默认
        navBacksearch: false,
        searchSongList1: [], //放置返回数据的数组  
        searchSongList2: [], //放置返回数据的数组  
        searchSongList3: [], //放置返回数据的数组
      })

      console.log("无条件查询：", getApp().globalData.allOrPortion);

      getApp().globalData.isChSubscribe = false;
      self.fetchSearchList();
      
    }

  },

getSubscribeInsi:function(){
  var self = this;
 
  var tmpSubscribes = this.getSubscribe();
  if (tmpSubscribes.length!=0){
    for (var i in tmpSubscribes) {
      if (tmpSubscribes[i].isChoice) {
        this.data.choiceInstitution = tmpSubscribes[i].institutionarrayrel;
       // this.dischsubToast(tmpSubscribes[i].name);
        self.setData({
          choicename: tmpSubscribes[i].name
        })
        break;
      }else{
        this.data.choiceInstitution = [];
       // this.dischsubToast("无");
        self.setData({
          choicename: "无"
        })
      }
    }
  }else{
    console.log("null subscirbe")
    this.data.choiceInstitution=[];
  }


},
  onLoad: function (content) {
    // 页面渲染后 执行
    var self = this;
    self.showloading();
    self.getSubscribeInsi();
    console.log("订阅的机构",JSON.stringify(this.data.choiceInstitution));
    console.log("名称:", self.data.choicename)
    self.data.isfirst[0] = true;
    self.data.isfirst[1] = false;
    self.data.isfirst[2] = false;

    self.setData({
      isFromSearch: true,           //每次查询都刷新数组
      searchLoading: false,         //"上拉加载"的变量，默认false，隐藏  
      searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏  
      searchPageNum: 0,            //查询显示的，需回归默认
      navBacksearch: false,
      searchSongList1: [], //放置返回数据的数组  
      searchSongList2: [], //放置返回数据的数组  
      searchSongList3: [], //放置返回数据的数组
    })
    
    console.log("test",self.data.test)
    if (getApp().globalData.allOrPortion) {    //用于判断是查询数据还是默认显示全部，默认为true为无条件查询
      console.log("无条件查询：", getApp().globalData.allOrPortion);
      
      self.fetchSearchList();
      wx.hideLoading()
     } else {
      console.log("redirectTo", self.data.navBacksearch);
      console.log("条件查询：", getApp().globalData.allOrPortion);
      console.log("初始：",self.data.searchSongList1.length) 

      self.lookupSumit(JSON.parse(content.title), self.data.searchPageNum, self.data.callbackcount, JSON.stringify(self.data.isfirst));
      wx.hideLoading()
    }

  },

  displaydata: function(data)
  {
    var self = this;
   //判断是否有数据，有则取数据  
    if (data[0].length != 0) {
      self.data.islist1 = true
      let searchList = [];
      //如果isFromSearch是true从data中取出数据，否则先从原来的数据继续添加  
      self.data.isFromSearch ? searchList = data[0] : searchList = self.data.searchSongList1.concat(data[0])
      console.log("开始0：" + self.data.isFromSearch)
      self.setData({
        searchSongList1: searchList, //获取数据数组  
        searchLoading: true   //把"上拉加载"的变量设为false，显示  
      });
     
        self.setData({
          islist2icon: true,
          islist3icon: true
        })
      
      //没有数据了，把“没有数据”显示，把“上拉加载”隐藏  
    } 
    if (data[1].length != 0) {
      
      self.setData({
        islist2icon: false
      })
      console.log("开始1：" + self.data.searchPageNum)
      self.data.islist2 = true
      let searchList = [];
      //如果isFromSearch是true从data中取出数据，否则先从原来的数据继续添加  
      console.log("开始1：" + self.data.isFromSearch)
      self.data.isFromSearch ? searchList = data[1] : searchList = self.data.searchSongList2.concat(data[1])
      self.setData({
        searchSongList2: searchList, //获取数据数组  
        searchLoading: true,   //把"上拉加载"的变量设为false，显示  
      });
    }
    if (data[2].length != 0) {

      self.setData({
        islist3icon: false
      })

      console.log("开始2：" + self.data.searchPageNum)
      self.data.islist3 = true

      let searchList = [];
      //如果isFromSearch是true从data中取出数据，否则先从原来的数据继续添加  
      self.data.isFromSearch ? searchList = data[2] : searchList = self.data.searchSongList3.concat(data[2])
      self.setData({
        searchSongList3: searchList, //获取数据数组  
        searchLoading: true   //把"上拉加载"的变量设为false，显示  
      });
    }

    if (self.data.searchSongList1.length + self.data.searchSongList2.length + self.data.searchSongList3.length >= 15)
    {
      self.setData({
        tothetop:false
      })
    }
    
    if (data[0].length < 7 && self.data.isfirst[0]) {   //第一个列表没有数据时
      console.log("bian1")
      self.data.searchPageNum = -1;
      self.data.isfirst[0] = false;
      self.data.isfirst[1] = true;
      
      self.setData({
        searchLoading: true ,
        islist2icon: false,
      });
      self.searchScrollLower();               //自动加载下一个

    } else if (data[1].length < 7 && self.data.isfirst[1]) {//第二个列表没有数据时
      console.log("bian2")
      self.data.searchPageNum = -1;
      self.data.isfirst[1] = false;
      self.data.isfirst[2] = true;
      self.searchScrollLower();

      self.setData({
        islist3icon: false,

      })
    } else if (data[2].length < 7 && self.data.isfirst[2]) {
      self.data.isfirst[2] = false;
     
    }
    if ((self.data.searchSongList1 == 0 && self.data.searchSongList2 == 0 && self.data.searchSongList3 == 0) && !self.data.isfirst[0] && !self.data.isfirst[1] && !self.data.isfirst[2])
    {
      wx.showToast({
        title: '没有相关数据',
        icon: 'none',
        duration: 1500
      })
    }
    //没有数据了，把“没有数据”显示，把“上拉加载”隐藏  
    if (!self.data.isfirst[0] && !self.data.isfirst[1] && !self.data.isfirst[2]) {
      console.log("00000000000")
      console.log(self.data.searchSongList1.length)
      self.setData({
        searchLoadingComplete: true, //把“没有数据”设为true，显示  
        searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
      });
    }
  },
  fetchSearchList: function () {
    var self = this;

    let searchKeyword = self.data.searchKeyword,//输入框字符串作为参数  
      searchPageNum = self.data.searchPageNum,//把第几次加载次数作为参数   
      callbackcount = self.data.callbackcount; //返回数据的个数  
    console.log("123213", searchPageNum)
    console.log(self.data.isfirst[0], self.data.isfirst[1], self.data.isfirst[2])
    //访问网络  
    util.getSearchMusic(searchKeyword, searchPageNum, callbackcount,JSON.stringify(this.data.choiceInstitution), JSON.stringify(self.data.isfirst), function (data){
      console.log(data[0].length)
      self.displaydata(data);
    
    })
  },


  lookupSumit: function (sumdata, pageindex, callbackcount, isfirst) {
    var self = this;
    self.sumdata_g = sumdata;
    
    console.log('查询条件:222', sumdata, isfirst,'pageindex', pageindex, 'callbackcount', callbackcount, )
    wx.request({
      url: 'https://legal1.cratedb.tech/lookup',
      data: {
        title: sumdata.title,
        issuing_authority: sumdata.issuing_authority,
        section1: sumdata.section[0],
        date_start: sumdata.date_start,
        date_end: sumdata.date_end,
        backnum: callbackcount,  //返回数据的个数  
        loadnum: pageindex,    //第几次加载
        isfirst: isfirst,
      },
      method: 'POST',
      header: { 'content-Type': 'application/x-www-form-urlencoded' },
      success: function (data) {
        
        console.log('查询内容：', data.data)
        self.displaydata(data.data)
      }
    })

  },
  bindSubscribeTap:function(){
    let pages = getCurrentPages();//当前页面
    if (pages.length >= 2) {
      wx.redirectTo({
        url: '../subscribe/subscribe'
      })

    } else {
      wx.navigateTo({
        url: '../subscribe/subscribe'
      })
    }
  },
  bindViewTap: function () {
    let pages = getCurrentPages();//当前页面
    if (pages.length >= 2) {
      wx.redirectTo({
        url: '../lookup/lookup'
      })

    } else {
      
    wx.navigateTo({
      url: '../lookup/lookup'
    })
   }
  },
  showInput: function () {

    this.bindViewTap();
    this.setData({
      navBacksearch:true,
    })
  },


  shrink1:function(){
    var self=this;
    if (self.data.searchSongList2.length > 0 || self.data.searchSongList3.length > 0){
      self.setData({
        islist1: !self.data.islist1
      }); 
    }
    
  },
  showsubscribe:function(){
    this.bindSubscribeTap();
  },
  shrink2: function () {
    var self = this;
    if ( self.data.searchSongList3.length > 0) {
      self.setData({
        islist2: !self.data.islist2
      });
    }
  },
  shrink3: function () {
    var self = this;

    self.setData({
      islist3: !self.data.islist3
    });
  },
  gettop:function(){
    this.setData({
      toView: 'top',
      tothetop: true,
    })
  }, 
  getSubscribe: function () {
    var tmp = [];
    tmp = wx.getStorageSync("subscribeList");
    console.log("subscribeList", tmp)
    return tmp;
  },


//滚动到底部触发事件  
  searchScrollLower: function () {
    var self = this;
    if (getApp().globalData.allOrPortion)       //用于判断是查询数据还是默认显示全部，默认为true为无条件查询
    {
      console.log('无条件查询', getApp().globalData.allOrPortion);
      console.log('上拉加载1', self.data.searchLoading, !self.data.searchLoadingComplete);
      if (self.data.searchLoading && !self.data.searchLoadingComplete) {
        self.setData({
          searchPageNum: self.data.searchPageNum + 1,  //每次触发上拉事件，把searchPageNum+1  
          isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false  
        });
        console.log("分页", self.data.searchPageNum)
        self.fetchSearchList();
      }
    } else {
      console.log('条件查询', getApp().globalData.allOrPortion);
      console.log('上拉加载1', self.data.searchLoading,!self.data.searchLoadingComplete);
      if (self.data.searchLoading && !self.data.searchLoadingComplete) {
          console.log('上拉加载2', self.data.searchLoading);
          self.setData({
            searchPageNum: self.data.searchPageNum + 1,  //每次触发上拉事件，把searchPageNum+1  
            isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false  
          });
          console.log('查询条件111', self.sumdata_g, '几页',self.data.searchPageNum);
          self.lookupSumit(self.sumdata_g, self.data.searchPageNum, self.data.callbackcount, JSON.stringify(self.data.isfirst));
      }
    }

  }, 
  showloading: function () {
    wx.showLoading({
      title: '数据加载中',
      icon: 'loading',
      mask: true,
    });
  },
  
});
