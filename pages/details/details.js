// pages/details/details.js
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */

  data: {
    STATIC_HOST: '',
    bookInfo: {},
    book_rate: 0, //书籍评分
    showInfoContent: true,
    allRecommendBooks: [],//全部推荐书籍
    showRecommendBooks: [], //随机展示的三本推荐书籍
    shortReviews: {},
    addedShelf: false
  },

  showTab: function (event) {
    this.setData({
      showInfoContent: !!parseInt(event.target.dataset.id)
    });
  },

  addShelf: function () {
    if (this.data.addedShelf) {
      return
    }
    let shelfData = {
      bookInfo: {
        id: this.data.bookInfo.id,
        title: this.data.bookInfo.title,
        author: this.data.bookInfo.author,
        cover: this.data.bookInfo.cover,
        laterChapter: this.data.bookInfo.laterChapter,
        lastupdatetime: this.data.bookInfo.lastupdatetime
      },
      readNum: 1,
      laterScrollTop: 0 //上次滑动的距离
    };
    wx.getStorage({
      key: 'bookShelfData',
      success: res => {
        res.data.unshift(shelfData);
        wx.setStorage({
          key: 'bookShelfData',
          data: res.data,
        });
        this.setData({
          addedShelf: true
        });
      },
    })
  },

  getBookInfo: function (book_id) {
    var that = this;
    wx.request({
      url: api.book.bookInfo(book_id),
      success: res => {
        wx.hideLoading();
        that.data.bookInfo.laterChapter = res.data.lastChapter;
        that.data.bookInfo.lastupdatetime = parseInt(Date.parse(res.data.updated)/1000);
        let score = Math.floor(res.data.rating.score / 2);
        this.setData({
          book_rate: score,
          bookInfo: {
            id:that.data.bookInfo.id,
            title: that.data.bookInfo.title,
            author: that.data.bookInfo.author,
            longIntro: that.data.bookInfo.longIntro,
            cover: that.data.bookInfo.cover,
            laterChapter:res.data.lastChapter,
            lastupdatetime: that.data.bookInfo.lastupdatetime
          }
        });
      }
    })
  },

  getRelatedRecommendedBooks: function (book_id) {
    wx.request({
      url: api.book.relatedRecommendedBooks(book_id),
      success: res => {
        this.setData({
          allRecommendBooks: res.data.books
        });
        this.randomRecommendBooks();
      }
    })
  },

  randomRecommendBooks: function () {  //在所有推荐书籍中随机选出三本展示
    this.setData({
      showRecommendBooks: []
    });
    let recommendBooksLen = this.data.allRecommendBooks.length;
    let randomIndex;
    for (let i = 0; i < 3; i++) {
      let newRandom = Math.floor(Math.random() * recommendBooksLen);
      if (newRandom === randomIndex) {
        i--;
        break;
      }
      randomIndex = newRandom;
      this.data.showRecommendBooks.push(this.data.allRecommendBooks[randomIndex])
    }
    this.setData({
      showRecommendBooks: this.data.showRecommendBooks
    });
  },

  getBookShortReviews(book_id) {
    wx.request({
      url: api.comment.shortReviews(book_id),
      success: res => {
        this.setData({
          shortReviews: res.data
        });
      }
    })
  },

  getBookId(title) {
    wx.request({
      url: api.book.bookSearch(title),
      success: res => {
        var book_id = res.data.books[0]._id;
        this.getBookInfo(book_id);
        this.getRelatedRecommendedBooks(book_id);
        this.getBookShortReviews(book_id);
      },
      fail: res => {
        this.getBookInfo("5f9ca96e55e488e91e9548ac");
        this.getRelatedRecommendedBooks("5f9ca96e55e488e91e9548ac");
        this.getBookShortReviews("5f9ca96e55e488e91e9548ac");}
    })
  },

  getBookSources(book_title) {
    var that = this;
    wx.request({
      url: api.book.MybookSources(book_title),
      success: res => {
        var book_id = Number(res.data.books[0].bookInfo.bookId)+Number(1100000000);
        that.data.bookInfo.id = book_id
        this.setData({
          bookInfo: {
            id:book_id,
            title: that.data.bookInfo.title,
            author: that.data.bookInfo.author,
            longIntro: that.data.bookInfo.longIntro,
            cover: that.data.bookInfo.cover,
            laterChapter:that.data.bookInfo.laterChapter,
            lastupdatetime: that.data.bookInfo.lastupdatetime
          }
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.getStorage({  //检查此书是否加入书架
      key: 'bookShelfData',
      success: res => {
        res.data.forEach(item => {
          if (item.bookInfo.title === options.book_title) {
            if (item.bookInfo.author === options.book_author) {
              this.setData({
                addedShelf: true
              });
              return;
            }
            return;
          }
        });
      },
    });
    this.setData({
      STATIC_HOST: api.STATIC_HOST,
      bookInfo : {
        id:"1100480951",
        title: options.book_title,
        author: options.book_author,
        longIntro: options.book_desc,
        cover: options.book_src,
        laterChapter:"找不到最新章节"
      }
    });
    this.getBookId(options.book_title);
    this.getBookSources(options.book_title);
    // this.getBookInfo(book_id);
    // this.getRelatedRecommendedBooks(book_id);
    // this.getBookShortReviews(book_id);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideLoading();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
