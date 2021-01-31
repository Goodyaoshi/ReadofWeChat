//index.js
//获取应用实例
const app = getApp()
const api = require('../../utils/api.js');
Page({
  data: {
    userInfo: {},
    bookShelfData: [],
    hasUpdate: [],
    isEdit: false
  },

  edit: function () {
    this.setData({
      isEdit: !this.data.isEdit
    });
  },

  delete: function (e) {
    let i = e.target.dataset.id;
    this.data.bookShelfData.splice(i,1);
    wx.getStorage({
      key: 'bookShelfData',
      success: function(res) {
        res.data.splice(i, 1);
        wx.setStorage({
          key: 'bookShelfData',
          data: res.data,
        })
      },
    })
    this.setData({
      bookShelfData: this.data.bookShelfData
    });
  },

  getlasterChapter: function () {
    for (let i = 0; i < this.data.bookShelfData.length; i++) {
      var that=this;
      wx.request({
        url: api.book.MybookChaptersBookId(this.data.bookShelfData[i].bookInfo.id),
        success: res => {
          wx.hideLoading();
          //如果有更新就将最近更新的时间刷新进去，初次与加入书架时比较
          if ((that.data.bookShelfData[i].bookInfo.lastupdatetime) < (res.data.rows[0].lastupdatetime)) {
            that.data.bookShelfData[i].bookInfo.laterChapter = res.data.rows[0].lastserialname;
            that.data.bookShelfData[i].bookInfo.lastupdatetime = res.data.rows[0].lastupdatetime;
            wx.setStorage({
              key: 'bookShelfData',
              data: that.data.bookShelfData,
            })
            that.data.hasUpdate[i] = 1;
            that.setData({
              hasUpdate: that.data.hasUpdate
            });
          }
        }
      })
    }
    wx.hideLoading();
  },
  getShelfInfo: function () {
    wx.getStorage({    //获取书架信息
      key: 'bookShelfData',
      success: res => {
        this.setData({
          bookShelfData: res.data
        });
        for (let i = 0;i < res.data.length; i++) {
          this.data.hasUpdate.push(0);   //用数组表示是否有更新, 1 有 0 无
          this.setData({
            hasUpdate: this.data.hasUpdate
          });
        }
        this.getlasterChapter();
      },
      fail: function () {
        wx.hideLoading();
        wx.setStorage({
          key: 'bookShelfData',
          data: [],
        })
      }
    })
  },
  onLoad: function () {
    /*wx.getUserInfo({
      success: res => {
        app.globalData.userInfo = res.userInfo
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    });*/
  },
  onShow: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    this.setData({
      hasUpdate: []
    });
    this.getShelfInfo();
  }
})