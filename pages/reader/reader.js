// pages/reader/reader.js
const api = require('../../utils/api.js')
const WxParse = require('../wxParse/wxParse.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showPage: false,//请求到数据显示界面
    clientWidth: "",
    clientHeight: "",
    winHeight: "",//窗口高度
    book_id: '',
    scrollTop: 0,
    bookSources: [],
    bookChapters: {},
    indexPage: 0, //当前章节
    indexChapterContent: {}, //当前阅读的内容
    readerCss: {
      titleSize: 25,
      contentSize: 21,
      color: '#333', //夜间 #424952
      lineHeight: 70,
      backgroundColor: '#C7EDCC' //#C7EDCC 护眼色  #080C10 黑夜 #fff 正常
    },
    showMenu: false,
    showChapter: false,
    isDark: false,
    isHuyan: true
  },

  toggleDark: function () {
    this.setData({
      isDark: !this.data.isDark
    });
    if (this.data.isDark) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#080C10'
      });
      this.data.readerCss.color = '#696969';
      this.data.readerCss.backgroundColor = '#080C10';
      this.setData({
        isHuyan: false,
        readerCss: this.data.readerCss
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#cb1c36'
      });
      this.data.readerCss.color = '#333';
      this.data.readerCss.backgroundColor = '#fff';
      this.setData({
        isHuyan: false,
        readerCss: this.data.readerCss
      });
    }
  },

  toggleHuyan: function () {
    this.setData({
      isHuyan: !this.data.isHuyan
    });
    if (this.data.isHuyan) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#000000'
      });
      this.data.readerCss.color = '#333';
      this.data.readerCss.backgroundColor = '#C7EDCC';
      this.setData({
        isDark: false,
        readerCss: this.data.readerCss
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#cb1c36'
      });
      this.data.readerCss.color = '#333';
      this.data.readerCss.backgroundColor = '#fff';
      this.setData({
        isDark: false,
        readerCss: this.data.readerCss
      });
    }
  },

  incSize: function () {
    if (this.data.readerCss.titleSize === 30) {
      return
    }
    this.data.readerCss.titleSize = this.data.readerCss.titleSize + 5;
    this.data.readerCss.lineHeight = this.data.readerCss.lineHeight + 10;
    this.data.readerCss.contentSize = this.data.readerCss.contentSize + 5;
    this.setData({
      readerCss: this.data.readerCss
    });
  },

  decSize: function () {
    if (this.data.readerCss.titleSize === 20) {
      return
    }
    this.data.readerCss.titleSize = this.data.readerCss.titleSize - 5;
    this.data.readerCss.contentSize = this.data.readerCss.contentSize - 5;
    this.data.readerCss.lineHeight = this.data.readerCss.lineHeight - 10;
    this.setData({
      readerCss: this.data.readerCss
    });
  },

  // getBookSources: function (book_id) {
  //   wx.request({
  //     url: api.book.bookSources(book_id),
  //     success: res => {
  //       this.setData({
  //         bookSources: res.data
  //       });
  //       this.getBookChapters(this.data.bookSources[1] ? this.data.bookSources[1]._id : this.data.bookSources[0]._id);
  //     }
  //   })
  // },

  // getBookChapters: function (source_id) {
  //   wx.request({
  //     url: api.book.bookChapters(source_id),
  //     success: res => {
  //       this.setData({
  //         bookChapters: res.data
  //       });
  //       this.getChapterContent(this.data.bookChapters.chapters[this.data.indexPage].link);
  //     }
  //   })
  // },

  // getChapterContent: function (link) {
  //   wx.showLoading({
  //     title: '加载中',
  //     mask: true
  //   })
  //   wx.request({
  //     url: api.book.chapterContent(link),
  //     success: res => {
  //       wx.hideLoading();
  //       if (res.data.chapter.cpContent) {
  //         let bodyArray = res.data.chapter.cpContent.split(/\n/).map((item) => {  //给每个段落加开头空格 ,方案改为修改wxParse.wxss
  //           return item
  //         });
  //         res.data.chapter.cpContent = bodyArray.join('<br>');
  //       }
  //       let bodyArray = res.data.chapter.body.split(/\n/).map((item) => {
  //         return item
  //       });
  //       res.data.chapter.body = bodyArray.join('<br>');
  //       this.setData({
  //         showPage: true,
  //         showChapter: false,  //关闭目录
  //         indexChapterContent: res.data
  //       });
  //       //存储当前读到哪一章
  //       wx.getStorage({
  //         key: 'bookShelfData',
  //         success: res => {
  //           let data = res.data;
  //           for (let i = 0; i < data.length; i++) {
  //             if (this.data.book_id === data[i].bookInfo.id) {
  //               data[i].readNum = this.data.indexPage + 1;
  //               data[i].laterScrollTop = this.data.scrollTop
  //               wx.setStorage({
  //                 key: 'bookShelfData',
  //                 data: data,
  //               })
  //             }
  //           }
  //         },
  //       });
  //       //使用Wxparse格式化小说内容   对收费的显示文字   后期换接口处理
  //       WxParse.wxParse('article', 'html', this.data.indexChapterContent.chapter.cpContent ? '小轻还没有给主人搬到此书，去看看别的吧' : this.data.indexChapterContent.chapter.body, this);
  //       //等到渲染页面后调节scrollTop
  //       this.setData({
  //         scrollTop: this.data.scrollTop
  //       })
  //     }
  //   })
  // },
    getBookSources: function (book_title) {
      wx.request({
        url: api.book.MybookSources(book_title),
        success: res => {
          this.setData({
            bookSources: res.data
          });
          var sum = Number(this.data.bookSources.books[0].bookInfo.bookId)+Number(1100000000);
          this.getBookChapters(sum);
        }
      })
    },

  getBookChapters: function (source_id) {
    var that = this;
    wx.request({
      url: api.book.MybookChapters(source_id),
      success: res => {
        this.setData({
          bookChapters: res.data
        });
        (this.data.bookChapters.ret == 0)?(this.getChapterContent(this.data.bookChapters.bookId,this.data.bookChapters.rows[this.data.indexPage].serialID)):(this.errorChapterContent());
      }
    })
  },

  getChapterContent: function (resource_id,serialID) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: api.book.MychapterContent(resource_id,serialID),
      success: res => {
        wx.hideLoading();
        this.setData({
          showPage: true,
          showChapter: false,  //关闭目录
          indexChapterContent: res.data
        });
        //存储当前读到哪一章
        wx.getStorage({
          key: 'bookShelfData',
          success: res => {
            let data = res.data;
            for (let i = 0; i < data.length; i++) {
              if (this.data.indexChapterContent.data.resourceName === data[i].bookInfo.title) {
                data[i].readNum = this.data.indexPage + 1;
                data[i].laterScrollTop = this.data.scrollTop
                wx.setStorage({
                  key: 'bookShelfData',
                  data: data,
                })
              }
            }
          },
        });
        //等到渲染页面后调节scrollTop
        this.setData({
          scrollTop: this.data.scrollTop
        })
      }
    })
  },

  errorChapterContent: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.hideLoading();
    this.setData({
      showPage: true,
      showChapter: false,
      bookChapters:{
        ret:-107,
        rows:[
          {serialName:"此书籍无法阅读"}
        ]
      },
      indexChapterContent:{
        data:{
          content:[
            "还没有给主人搬到此书，去看看别的吧",
            " ",
            "相关帮助！！！",
            "此小程序能阅读哪些书籍？",
            "目前可以阅读大量书籍，如果遇到“还没有给主人搬到此书，去看看别的吧”这样的提示（就是现在主人上面看到的提示），这说明此书籍无法阅读，欢迎阅读其它书籍或者去正版网站购买阅读。",
            "进入阅读模式如何调出菜单？",
            "进入阅读模式中，点击屏幕中央可以呼出菜单，目前提供了夜间转换、护眼转换、目录查看和字体设置，后期还会加入新功能。",
            "以后会收费吗？",
            "承诺永远不会向主人索要小费，希望主人永远支持，也会竭尽全力给主人提供更好的服务。",
            "免责声明！！！",
            "您在使用本小程序之前请无比仔细阅读并理解本声明，您可以选择不使用本小程序，但如果您使用本小程序，您的使用将被视为对本声明内容的全部认可。本小程序是一款提供网络小说即使更新阅读的小程序，为广大小说爱好者提供一种方便快捷舒适的试读体验。致力于最大程度的减少读者在自行搜索过程中的毫无意义的时间浪费，通过专业的搜索展示不同网站中的网络小说新章节。当您点击搜索一本书时，本小程序将会对该书名以关键词的形式提交到第三方网站或者搜索引擎（百度谷歌等）第三方网站反馈内容与本小程序无关以不承担任何法律责任。第三方搜索引擎结果根据您提交的关键词自动搜索并获得阅读，并不代表我们赞成赞成第三方网站的内容，您应该对使用搜索引擎的搜索结果自行承担风险。我们不做任何形式的保证。我们建议阅读正版，任何单位或者个人认为通过本小程序搜索连接到的第三方网页内容可能涉嫌侵犯其网络传播权，应该及时向我们提供书面通知，我们收到法律文件后尽快断开相关连接内容。"
          ]
        }
      }
    });
    //存储当前读到哪一章
    wx.getStorage({
      key: 'bookShelfData',
      success: res => {
        let data = res.data;
        for (let i = 0; i < data.length; i++) {
          if (this.data.indexChapterContent.data.resourceName === data[i].bookInfo.title) {
            data[i].readNum = this.data.indexPage + 1;
            data[i].laterScrollTop = this.data.scrollTop
            wx.setStorage({
              key: 'bookShelfData',
              data: data,
            })
          }
        }
      },
    });
    //等到渲染页面后调节scrollTop
    this.setData({
      scrollTop: this.data.scrollTop
    })
  },

  goPrev: function () {
    if (this.data.indexPage === 0) {
      wx.showToast({
        title: '已到第一章',
        icon: 'loading',
        mask: true
      });
    }
    this.setData({
      indexPage: this.data.indexPage - 1,
      scrollTop: 0
    });
    if (this.data.bookChapters.rows[this.data.indexPage]) {
      this.getChapterContent(this.data.bookChapters.bookId,this.data.bookChapters.rows[this.data.indexPage].serialID);
    }
  },

  goNext: function () {
    if (this.data.indexPage === this.data.bookChapters.rows.length - 1) {  //当前在最后一章
      wx.showToast({
        title: '已到最新章节',
        icon: 'loading',
        mask: true
      });
      return;
    }
    this.setData({
      indexPage: this.data.indexPage + 1,
      scrollTop: 0
    });
    if (this.data.bookChapters.rows[this.data.indexPage]) {
      this.getChapterContent(this.data.bookChapters.bookId,this.data.bookChapters.rows[this.data.indexPage].serialID);
    }
  },

  goNow: function (serialid) {
    this.setData({
      indexPage: Number(serialid)-1,
      scrollTop: 0
    });
    if (this.data.bookChapters.rows[this.data.indexPage]) {
      this.getChapterContent(this.data.bookChapters.bookId,this.data.bookChapters.rows[this.data.indexPage].serialID);
    }
  },
  //点击中央打开菜单
  openMenu: function (event) {
    let xMid = this.data.clientWidth / 2;
    let yMid = this.data.clientHeight / 2;
    let x = event.detail.x;
    let y = event.detail.y;
    if ((x > xMid - 100 && x < xMid + 100) && (y < yMid + 100 && y > yMid - 100)) {
      this.setData({
        showMenu: !this.data.showMenu
      });
    }
    if(x < xMid - 100){
      this.goPrev()
    }
    if(x > xMid + 100){
      this.goNext()
    }
  },

  getScrollTop: function (event) {  //设置读取到文章的具体什么位置

    // this.setData({
    //   scrollTop: event.detail.scrollTop
    // });
    //存储读到章节的什么位置
    wx.getStorage({
      key: 'bookShelfData',
      success: res => {
        let data = res.data;
        for (let i = 0; i < data.length; i++) {
          if (this.data.book_id === data[i].bookInfo.id) {
            data[i].laterScrollTop = event.detail.scrollTop;
            wx.setStorage({
              key: 'bookShelfData',
              data: data,
            })
          }
        }
      },
    });
  },

  showChapter: function () {
    this.setData({
      showChapter: !this.data.showChapter
    });
  },

  pickChapter: function (event) {
    this.setData({
      indexPage: event.target.dataset.indexpage,
      scrollTop: 0
    });
    this.getChapterContent(event.target.dataset.resourceid,event.target.dataset.serialid);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      book_id: options.book_id
    });

    let bookShelfData = wx.getStorageSync('bookShelfData');  //利用缓存实现阅读记录和书架
    if (bookShelfData.length !== 0) {
      for (let i = 0; i < bookShelfData.length; i++) {
        if (bookShelfData[i].bookInfo.id === options.book_id) {
          this.setData({  //上次读到哪
            indexPage: bookShelfData[i].readNum - 1,
            scrollTop: bookShelfData[i].laterScrollTop
          });
          break;
        }
      }
    }

    wx.setNavigationBarTitle({   //设置标题
      title: options.book_title,
    });

    wx.getSystemInfo({
      success: (res) => {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR;
        this.setData({
          clientHeight: clientHeight,
          clientWidth: clientWidth,
          winHeight: calc
        });
      }
    });
    wx.getStorage({
      key: 'isAlerted',
      success: (res) => {
        let data = res.data;
        if (!data) {
          wx.showModal({
            title: '提示',
            content: '点击呼出菜单',
            success: (res) => {
              if (res.confirm) {
                wx.setStorage({
                  key: 'isAlerted',
                  value: true
                });
              }
            }
          });
        }
      }
    });

    setTimeout(() => {
      wx.hideLoading();
      this.setData({
        indexPage: (options.book_serialid?(Number(options.book_serialid) - 1):0)
      });
      options.book_id?(this.getBookChapters(options.book_id)):(this.getBookSources(options.book_title));
    }, 2000);
  }
});
