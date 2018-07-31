var util = require('../test/test.js')
//查询界面
const app = getApp()

Page({
  data: {

    title: '',
    date_new: "2017-01-01",
    date_start: '1999-01-01',
    date_end: '0000-00-00',
    section: ['选择分类'],
    institution: ['选择机构'],
    section_index: 0,
    institution_index: 0,
    inputShowed: true,

    tmphistory : [],
    institutionarray: [],
    isinstitutionarraytmp: [],
    isinstitutionarrayrel: [],
    isinstitutionlist: true,
    iscanvas: true,
    pageheight: 0,
    isinscolor: false,
    isseccolor: false,
    isstacolor: false,
    isendcolor: false,
  },
  onShow: function () {
    var self = this;
    try {
      var res = wx.getSystemInfoSync()
      console.log("高度", res)
      self.setData({
        pageheight: res.windowHeight / 1.8
      })
    } catch (e) {
      // Do something when catch error
    }
  },

  onLoad: function () {
    var self = this;
    console.log("test", util.data)

    self.get_section();
    var datatoday = new Date();
    var month = datatoday.getMonth() + 1;
    var datatime = datatoday.getFullYear() + '-' + month + '-' + datatoday.getDate();
    getApp().globalData.allOrPortion = true;
    self.setData({
      date_new: datatime,
      date_end: datatime,
    })

  },
  //得到查询条件进行再控件中显示
  get_section: function () {
    var self = this;
    self.showloading();
    wx.request({
      url: 'https://legal1.cratedb.tech/getsection',
      data: { isTrue: true },
      method: 'GET',
      header: { 'content-Type': 'application/json' },
      success: function (res) {
        console.log('res', res.data[0])
        var section_data = [];
        var institution_data = [];
        section_data.push('选择分类');

        section_data = section_data.concat(res.data[0]);
        institution_data = institution_data.concat(res.data[1]);

        console.log('section_data', section_data);
        console.log('institution_data', institution_data);
        self.setData({
          section: section_data,
          institutionarray: institution_data
        })
        wx.hideLoading();
      },
      fail:function(){
        wx.hideLoading();
      }

    })
  },
  AntiSqlValid: function (oField) {         //防恶意输入
    var inj = new RegExp("#|--|and|exec|'|create|insert|select|delete|update", 'g')
    console.log('test:', oField)

    var test = inj.exec(oField);
    if (test) {
      console.log('抓住')
      return false;
    } else {
      console.log('没抓住')
      return true;
    }

  },
  Trim: function (str) {
    var result;
    result = str.replace(/(^\s+)|(\s+$)/g, "");
    result = result.replace(/\s/g, "");
    return result;
  },
  //查询之前的判断
  saw_info_sumit: function () {         //提交一系列判断
    var self = this;
    console.log('form发生了submit事件，携带数据为：', self.data.title);
    var lookup_title = self.data.title;
    var title1 = self.Trim(lookup_title);
    if (!self.AntiSqlValid(title1)) {
      wx.showToast({
        title: '请勿输入非法字符',
        icon: 'none',
        duration: 1500
      })
    } else {
      var data_lookup = { title: '', section: '0', issuing_authority: "", date_start: '', date_end: '' };
      //判断是否没有输入查询内容
      if (title1 == '' && self.data.section_index == '0' &&
        self.data.institution[0] == '选择机构' && self.data.date_start == '1999-01-01' && self.data.date_end == self.data.date_new) {

        getApp().globalData.allOrPortion = true;
        self.bindViewTap();           //当没有输入任何数据时 默认查询所有


      } else {
        if (title1 != '') {
          data_lookup.title = title1;
        }
        if (self.data.section_index != '0') {
          data_lookup.section = self.data.section[self.data.section_index];
        }
        if (self.data.institution[0] != '选择机构') {
          data_lookup.issuing_authority = JSON.stringify(self.data.institution);
        }
        if (self.data.date_start != '1999-01-01' || self.data.date_end != 'self.data.date_new') {
          if (self.data.date_start <= self.data.date_end) {
            console.log('小')
            data_lookup.date_start = self.data.date_start;
            data_lookup.date_end = self.data.date_end;
            console.log('判断时间成功', self.data.date_start <= self.data.date_end);
          } else {
            console.log('大')
            console.log('判断时间失败', self.data.date_start <= self.data.date_end);
            wx.showToast({
              title: '请选择正确的时间范围',
              icon: 'none',
              duration: 1500
            });
            return;
          }
        }

        console.log(data_lookup);
        getApp().globalData.allOrPortion = false;       //用于判断进行条件查询

        self.storageHistoryAll(data_lookup.title)       //存储搜索记录

        // let pages = getCurrentPages();//当前页面
        // console.log("页面数", pages.length)

        // let prevPage = pages[pages.length - 2];//上一页面
        // prevPage.setData({//直接给上移页面赋值
        //   sumdata_gtest: JSON.stringify(data_lookup),
        // });

        wx.redirectTo({
          url: '../test/test?title=' + JSON.stringify(data_lookup)
          //delta: 1
        })


      }
    }
  },
  storageHistoryAll: function (title) {//先读取，去重，在整合，判断是否超过长度，后存储
    var self = this;
    if (title != "") {
      console.log("保存title", title)

      var historylist = []
      historylist = self.getHistory();
      console.log("historylist1", historylist)
      if (historylist) {
        console.log("have data")
        for (var i in historylist){
          if (title == historylist[i]){
            console.log("删除", historylist[i],i)
            historylist.splice(i,1)
          }
        }
        if (historylist.length < 5){
          historylist.push(title)    
        }else{
          console.log(">5 删除第一个")
          historylist.splice(0, 1)
          historylist.push(title) 
          console.log("删除后",historylist)
        }
        self.storageHistory(historylist)
         
       
      } else {
        console.log("data null")
        self.storageHistory([title])
      }
      console.log("historylist2", self.getHistory())
    }
  },
  storageHistory: function (titlelist) {
    try {
      wx.setStorageSync("history",titlelist)
    } catch (e) {
      console.log("storageErr:", e);
    }
  },
  getHistory: function () {      
    var tmp = [];
    tmp = wx.getStorageSync("history");
    return tmp;
  },
  clearhistory:function()
  {
    wx.clearStorage()
    this.setData({
      tmphistory: []
    })
    console.log("clear history")
  },
  //事件处理函数
  bindViewTap: function () {

    wx.redirectTo({
      url: '../test/test'
      // delta: 1
    })
  },
  //搜索框事件
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  clearInput: function () {
    this.setData({
      title: ""
    });
  },

  //查询条件picker控件动态显示事件
  bindDateStartChange: function (e) {
    console.log('data发送选择改变，携带值为', e.detail.value)
    this.setData({
      date_start: e.detail.value,

    })
  },
  bindDateEndChange: function (e) {
    console.log('data发送选择改变，携带值为', e.detail.value)
    this.setData({
      date_end: e.detail.value
    })
  },

  bindSectionChange: function (e) {
    var self = this;
    this.setData({
      isseccolor: true,
      section_index: e.detail.value
    })
  },
  getTitle_Input: function (e) {        //获取输入值，并查询历史纪录
    this.setData({
      title: e.detail.value
    })
    
    if (this.data.title.length==1){
      console.log("title length", 1)
      var tmp = this.getHistory()
      if (tmp){
        this.setData({
          tmphistory: tmp.reverse()
        })
      }
      console.log("加载后的", this.data.tmphistory)
    } else if (this.data.title.length == 0){
      this.setData({
        tmphistory: []
      })
    }
    console.log("tmp", this.data.tmphistory)
    if (this.data.tmphistory){              //list搜索
      console.log("open search history")
      var listResult = [];
      for (var i in this.data.tmphistory){
        if (this.data.tmphistory[i].match(this.data.title))
         {
          console.log("find", this.data.tmphistory[i])
          listResult.push(this.data.tmphistory[i])
        }
      }
      console.log("findResult", listResult)
      this.setData({
        tmphistory: listResult
      })
      console.log("findResult", this.data.tmphistory)
    }else{                               //无历史纪录
      console.log("first search")
    }
  },
  supplementTitle:function(e){
    console.log(this.data.tmphistory[e.target.id]) 
    this.setData({
      title: this.data.tmphistory[e.target.id],
      tmphistory:[]
    })

  },

  bindIssauthChange: function (e) {        //首先读取institutionlist有没有数据，有数据则进行高亮 
    var self = this;
    if (this.data.isinstitutionarrayrel) {
      self.setData({
        isinstitutionarraytmp: this.data.isinstitutionarrayrel
      })
    }
    console.log(self.data.institutionarray.length)
    this.setData({
      isinstitutionlist: !self.data.isinstitutionlist,
      iscanvas: !self.data.iscanvas,
    })
    console.log("dianji")
  },

  cancle: function () {
    var self = this;
    this.data.isinstitutionarraytmp = []; //clear  
    this.setData({
      iscanvas: !self.data.iscanvas,
      isinstitutionlist: !self.data.isinstitutionlist,
    })
  },


  getInsIndex: function (e) {      //get institution index  only display highlight
    var self = this;
    console.log(e.target.id)
    var index = e.target.id;
    if (this.data.isinstitutionarraytmp[index]) {
      console.log("删除", this.data.institutionarray[index])
      var isarraytmp = "isinstitutionarraytmp[" + index + "]"
      console.log(isarraytmp)
      self.setData({
        [isarraytmp]: false
      })
    } else {
      console.log(this.data.institutionarray[index]);
      var isarraytmp = "isinstitutionarraytmp[" + index + "]"
      console.log(isarraytmp)
      self.setData({
        [isarraytmp]: true
      })
    }
  },

  getselectinstitution: function () {   //click ensure 
    this.data.isinstitutionarrayrel = this.data.isinstitutionarraytmp;
    this.data.isinstitutionarraytmp = [];     //clear
    let sectionList = []
    console.log(this.data.institutionarray)
    for (var i = 0; i < this.data.institutionarray.length; i++) {
      if (this.data.isinstitutionarrayrel[i] == true) {
        console.log(this.data.institutionarray[i])
        sectionList = sectionList.concat(this.data.institutionarray[i]);
      }
    }
    // console.log(JSON.stringify(sectionList) )
    console.log(sectionList)
    if (sectionList != "") {
      this.setData({
        institution: sectionList,
        isinscolor: true,
      })
    } else {
      this.setData({
        institution: ['选择机构'],
        isinscolor: false,
      })
    }

    this.cancle();
  },
  showloading: function () {
    wx.showLoading({
      title: '数据加载中',
      icon: 'loading',
      mask: true,
    });
  },
})
