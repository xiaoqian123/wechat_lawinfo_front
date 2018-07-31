
const app = getApp()

Page({
  data: {
   isinstitutionarraytmp: [],
   institutionarray: [],
   pageheight: 0,
   isinstitutionlist: true,
   iscanvas: true,
   radioItems: [],
   tmpobject:{},
   lastindex:0,     //选择状态的下标
   curtailinstitutionlist:[]
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
    self.displayUIoperation();
  },
  onLoad:function(){
    var self = this;
    self.displayUIoperation();
  },

  displayUIoperation: function () {
    var self = this;
     self.showloading();
    var tmpSubscribes = this.getSubscribe();


    for (var i in tmpSubscribes) {      //显示之前的选择
      if (tmpSubscribes[i].isChoice) {
        self.data.lastindex = i;
      }

      if (tmpSubscribes[i].institutionarrayrel.length > 2) {     //截取
        this.data.curtailinstitutionlist[i] = tmpSubscribes[i].institutionarrayrel.slice(0, 2)
        this.data.curtailinstitutionlist[i].push(".......")
      } else {                                                    //不截取
        this.data.curtailinstitutionlist[i] = tmpSubscribes[i].institutionarrayrel
      }
    }
    console.log("asdddddddddd", this.data.curtailinstitutionlist[0])
    if (tmpSubscribes) {
      self.setData({
        radioItems: tmpSubscribes,
        curtailinstitutionlist: this.data.curtailinstitutionlist,
      })
    }
    wx.hideLoading()
  },
  addsubscribe: function () {  //弹出对话框，输入订阅名称  并存储
    var self = this;
    console.log(this.data.radioItems)
    if (this.data.radioItems.length > 4){
      wx.showToast({
        title: '只能拥有5个订阅',
        icon: 'none',
        duration: 1000
      });
    }else{
      this.data.tmpobject = { name: "new subscribe", isinstitutionarrayrel: [], institutionarrayrel: [], focus: false, isChoice: false };
      this.data.radioItems.push(this.data.tmpobject);
      self.setData({
        radioItems: this.data.radioItems,
      })
      self.storageSubscribe(this.data.radioItems);      //只用添加会存储，其余只是覆盖修改
    }
   
  },
isnowindex:function(index){
  var self = this;
  if (index == self.data.lastindex) {
    getApp().globalData.isChSubscribe = true;
  }
},
  editChange:function(e){
    var self = this;
    var index = e.target.id;
    wx.showActionSheet({
      itemList: ['更改名称', '管理机构', '删除'],
      success: function (res) {
        if (!res.cancel) {
          if(res.tapIndex == 0){
            self.isnowindex(index);
            var tmp = "radioItems[" + index +"].focus";
            self.setData({
                [tmp] : true,
            })
          console.log(self.data.radioItems)
          }else if(res.tapIndex == 1){
            console.log(e.target.id)

            self.bindSubscribeTap(index)

          }else if(res.tapIndex == 2){
            console.log(e.target.id)
            self.isnowindex(index);
            self.delSubscribe(index)
            self.getSubscribe();
          }
        }
      }
    });
  },
  bindSubscribeTap: function (index) {
    var self = this;
    wx.navigateTo({
      url: '../subscribeUI/subscribeUI?index=' + index + '&lastindex=' + self.data.lastindex,
    })
    // let pages = getCurrentPages();//当前页面
    // if (pages.length > 2) {
    //   console.log("redirectTo-----------------------", pages.length)
    //   wx.redirectTo({
    //     url: '../subscribeUI/subscribeUI?index=' + index + '&lastindex=' + self.data.lastindex,
    //   })

    // } else {
    //   console.log("navigateTo-----------------------", pages.length)
    //   wx.navigateTo({
    //     url: '../subscribeUI/subscribeUI?index=' + index + '&lastindex=' + self.data.lastindex,
    //   })
    // }
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
      iscanvas: !self.data.iscanvas,
    })

    console.log("dianji")
  },

  getselectinstitution: function () {   //click ensure  

    this.data.tmpobject.isinstitutionarrayrel = this.data.isinstitutionarraytmp;
    console.log("Choice:",this.data.tmpobject.isinstitutionarrayrel)
    this.data.isinstitutionarraytmp = [];     //clear
    var tmpradio =this.getSubscribe();
   
    tmpradio[this.data.lastindex].isinstitutionarrayrel = this.data.tmpobject.isinstitutionarrayrel;
    tmpradio[this.data.lastindex].institutionarrayrel=[];
    for (var i in this.data.tmpobject.isinstitutionarrayrel){
      if (this.data.tmpobject.isinstitutionarrayrel[i]){
        tmpradio[this.data.lastindex].institutionarrayrel.push(this.data.institutionarray[i][0])
      }
    }

    this.storageSubscribe(tmpradio)
    this.cancle();
  },

  cancel: function () {
    var self = this;
    this.data.isinstitutionarraytmp = []; //clear  
    this.setData({
      iscanvas: !self.data.iscanvas,
      isinstitutionlist: !self.data.isinstitutionlist,
    })
    
  },

  delSubscribe:function(index){
      var self = this;

      self.data.radioItems.splice(index,1);
      self.data.curtailinstitutionlist.splice(index, 1);
      self.setData({
        radioItems: self.data.radioItems,
        curtailinstitutionlist: self.data.curtailinstitutionlist,
      })
      self.storageSubscribe(self.data.radioItems)

  },
  radioChange: function (e){
    var self = this;

    console.log('radio发生change事件，携带value值为：', e.target.id);
    var temradio = self.data.radioItems;
    console.log("lastindex:", self.data.lastindex, )
    temradio[self.data.lastindex].isChoice = false;

    self.data.lastindex = e.target.id;
    console.log("updata lastindex:", self.data.lastindex, )
    temradio[self.data.lastindex].isChoice = true;

    console.log(temradio)
    this.setData({
      radioItems: temradio
    });

    this.storageSubscribe(this.data.radioItems)
    getApp().globalData.isChSubscribe = true;
  },

  insitutionChange: function (e) {      //获取选择的订阅 需要存储
     var self = this;
     var temradio = this.getSubscribe();
      self.bindIssauthChange(temradio[self.data.lastindex]) //显示选择的机构，
      getApp().globalData.isChSubscribe = true;
   },

   storageSubscribe: function (Subscribe) {
     try {
       wx.setStorageSync("subscribeList", Subscribe)
       console.log("storage");
     } catch (e) {
       console.log("storageErr:", e);
     }
   },
   getSubscribe: function () {
    
     var tmp = [];
     tmp = wx.getStorageSync("subscribeList");
     console.log("subscribeList",tmp)
     return tmp;
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
   showloading: function () {
     wx.showLoading({
       title: '数据加载中',
       icon: 'loading',
       mask: true,
     });
   },
   storgename:function(e) {
      console.log(e)
      var index = e.target.id;
      var tmp = "radioItems[" + index + "].focus";
      this.setData({
        [tmp]: false,
      })
      var name = e.detail.value;
      this.data.radioItems[index].name = name;
      this.storageSubscribe(this.data.radioItems);
      getApp().globalData.isChSubscribe = true;
   }

})

