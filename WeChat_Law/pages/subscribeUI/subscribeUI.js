
const app = getApp()

Page({
  data:{
    institutionarray:[],
    isinstitutionarraytmp:[],
    isinstitutionlist: true,
    tmpobject: {},
    temradio:[],
    index:0,
    lastindex:0,
  },

onLoad:function(e){
  var self = this;
  console.log("123")
 

  self.get_section()

  self.data.index = e.index;
  self.data.lastindex = e.lastindex;

  this.data.temradio = self.getSubscribe();

  this.data.tmpobject = this.data.temradio[self.data.index]
  console.log("PreChoice:", this.data.tmpobject.isinstitutionarrayrel)
  self.bindIssauthChange(this.data.tmpobject) //显示选择的机构，
  

},

  getselectinstitution:function(){
     console.log("confirm")

     this.data.tmpobject.isinstitutionarrayrel = this.data.isinstitutionarraytmp;
     console.log("Choice:", this.data.tmpobject.isinstitutionarrayrel)
     this.data.isinstitutionarraytmp = [];     //clear

     this.data.temradio[this.data.index].isinstitutionarrayrel = this.data.tmpobject.isinstitutionarrayrel;
     this.data.temradio[this.data.index].institutionarrayrel = [];

     for (var i in this.data.tmpobject.isinstitutionarrayrel) {
       if (this.data.tmpobject.isinstitutionarrayrel[i]) {
         this.data.temradio[this.data.index].institutionarrayrel.push(this.data.institutionarray[i][0])
       }
     }
     this.storageSubscribe(this.data.temradio)
    if(this.data.index == this.data.lastindex)    //如果操作的是选中项
    {
        getApp().globalData.isChSubscribe = true;       
    }
    this.goback();
  },
  bindIssauthChange: function (tmpobject) {        //首先读取institutionlist有没有数据，有数据则进行高亮 
    var self = this;
    console.log("storage:", tmpobject)
    if (tmpobject.isinstitutionarrayrel) {      //显示
      self.setData({
        isinstitutionarraytmp: tmpobject.isinstitutionarrayrel
      })
    }

    this.setData({
      isinstitutionlist: !self.data.isinstitutionlist,

    })

    console.log("dianji")
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
goback:function(){
  wx.navigateBack({
    // 
    delta: 1
  })
},
cancel: function () {
  var self = this;
  this.setData({
    isinstitutionarraytmp:[],
    // isinstitutionlist: !self.data.isinstitutionlist,
  })
  self.goback();
},
getSubscribe: function () {
  var tmp = [];
  tmp = wx.getStorageSync("subscribeList");
  console.log("subscribeList", tmp)
  return tmp;
},
storageSubscribe: function (Subscribe) {
  try {
    wx.setStorageSync("subscribeList", Subscribe)
    console.log("storage");
  } catch (e) {
    console.log("storageErr:", e);
  }
},
  //得到查询条件进行再控件中显示
  get_section: function () {
    var self = this;
    self.showloading();
    console.log('institution_data', 123);
    wx.request({
      url: 'https://legal1.cratedb.tech/getsection',
      data: { isTrue: true },
      method: 'GET',
      header: { 'content-Type': 'application/json' },
      success: function (res) {
        console.log('res', res.data[0])
        var institution_data = [];
        institution_data = institution_data.concat(res.data[1]);

        console.log('institution_data', institution_data);
        self.setData({
          institutionarray: institution_data
        })
        wx.hideLoading();
      }

    })
  },
  showloading: function () {
    wx.showLoading({
      title: '数据加载中',
      icon: 'loading',
      mask: true,
    });
  },
})