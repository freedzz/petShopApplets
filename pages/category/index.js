var util = require('../../utils/util.js');
var api = require('../../config/api.js');

//获取应用实例
const app = getApp()

Page({
  data: {
    navList: [],
    categoryList: [],
    currentCategory: {},
    goodsCount: 0,
    nowIndex: 0,
    nowId: 0,
    list: [],
    allPage: 1,
    allCount: 0,
    size: 8,
    hasInfo: 0,
    showNoMore: 0,
    loading: 0,
    index_banner_img: 0,
    /* vip */
    isVipUser: '',
    /* 搜索 */
    currentSortType: 'default',
    currentSortOrder: 'desc', // 价格
    salesSortOrder: 'desc', // 销量
    isShowSortPopup: false,
    universalEnum: {},
  },
  onLoad: function (options) {
    this.getUniversalEnum()
    this.getUserExtInfo()
  },
  getChannelShowInfo: function (e) {
    let that = this;
    util.request(api.ShowSettings).then(function (res) {
      if (res.errno === 0) {
        let index_banner_img = res.data.index_banner_img;
        that.setData({
          index_banner_img: index_banner_img
        });
      }
    });
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    this.getCatalog();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  getCatalog: function () {
    //CatalogList
    let that = this;
    util.request(api.CatalogList).then(function (res) {
      that.setData({
        navList: res.data.categoryList,
      });
    });
    util.request(api.GoodsCount).then(function (res) {
      that.setData({
        goodsCount: res.data.goodsCount
      });
    });
  },
  getCurrentCategory: function (id) {
    let that = this;
    util.request(api.CatalogCurrent, {
      id: id
    }).then(function (res) {
      that.setData({
        currentCategory: res.data
      });
    });
  },
  getCurrentList (id, isReload, extSearchParams) {
    util.request(api.GetCurrentList, {
      size: this.data.size,
      page: this.data.allPage,
      id: id,
      searchParams: {
        sort: this.data.currentSortType,
        order: this.data.currentSortOrder,
        sales: this.data.salesSortOrder
      },
      extSearchParams: extSearchParams || ''
    }, 'POST').then((res) => {
      if (res.errno === 0) {
        let count = res.data.count;
        this.setData({
          allCount: count,
          allPage: res.data.currentPage,
          list: !isReload ? [...this.data.list, ...res.data.data] : [...res.data.data],
          showNoMore: 1,
          loading: 0,
        });
        if (count == 0) {
          this.setData({
            hasInfo: 0,
            showNoMore: 0
          });
        }
      }
    });
  },
  onShow: function () {
    this.getUniversalEnum()
    this.getUserExtInfo()
    this.getChannelShowInfo();
    let id = this.data.nowId;
    let nowId = wx.getStorageSync('categoryId');
    if (id == 0 && nowId === 0) {
      return false
    } else if (nowId == 0 && nowId === '') {
      this.setData({
        list: [],
        allPage: 1,
        allCount: 0,
        size: 8,
        loading: 1
      })
      this.getCurrentList(0);
      this.setData({
        nowId: 0,
        currentCategory: {}
      })
      wx.setStorageSync('categoryId', 0)
    } else if (id != nowId) {
      this.setData({
        list: [],
        allPage: 1,
        allCount: 0,
        size: 8,
        loading: 1
      })
      this.getCurrentList(nowId);
      this.getCurrentCategory(nowId);
      this.setData({
        nowId: nowId
      })
      wx.setStorageSync('categoryId', nowId)
    }

    this.getCatalog();
  },
  switchCate: function (e) {
    let id = e.currentTarget.dataset.id;
    let nowId = this.data.nowId;
    if (id == nowId) {
      return false;
    } else {
      this.setData({
        list: [],
        allPage: 1,
        allCount: 0,
        size: 8,
        loading: 1
      })
      if (id == 0) {
        this.getCurrentList(0);
        this.setData({
          currentCategory: {}
        })
      } else {
        wx.setStorageSync('categoryId', id)
        this.getCurrentList(id);
        this.getCurrentCategory(id);
      }
      wx.setStorageSync('categoryId', id)
      this.setData({
        nowId: id
      })
    }
  },
  onBottom: function () {
    let that = this;
    if (that.data.allCount / that.data.size < that.data.allPage) {
      that.setData({
        showNoMore: 0
      });
      return false;
    }
    that.setData({
      allPage: that.data.allPage + 1
    });
    let nowId = that.data.nowId;
    if (nowId == 0 || nowId == undefined) {
      that.getCurrentList(0);
    } else {
      that.getCurrentList(nowId);
    }
  },
  /**
   * 获取用户额外信息
   */
  async getUserExtInfo() {
    let res = await util.request(api.getUserExtInfo)
    if (res.errno === 0) {
      this.setData({
        isVipUser: res.data.isVip
      })
    }
  },
  /**
   * 获取搜索枚举
   */
  async getUniversalEnum(){
    let res = await util.request(api.getUniversalEnum)
    if(!res.errno){
      this.setData({
        universalEnum: res.data
      })
    }
  },
  /**
   * 打开高级搜索
   */
  showSortPopup(){
    this.setData({
      isShowSortPopup: true
    })
  },
  /**
   * 关闭高级搜索
   */
  onCloseSortPopup(){
    this.setData({
      isShowSortPopup: false
    })
  },
  changeSearchParams(event){
    let currentData = event.currentTarget.id;
    let [ key, currentId ] = currentData ? currentData.split('-') : []
    let currentItem = this.data.universalEnum[key].find((item) => +item.value === +currentId)
    currentItem.isSelected = !currentItem.isSelected
    this.setData({
      universalEnum: this.data.universalEnum
    })
  },
  getSelectedValueList(valueList){
    let selectedList = valueList.filter((item) => item.isSelected)
    return selectedList && selectedList.length ? selectedList.map((item) => item.value) : ''
  },
  searchParams(){
    let extSearchParams = {
      particle_size: this.getSelectedValueList(this.data.universalEnum.particleSizeList), // 颗粒大小
      age_group: this.getSelectedValueList(this.data.universalEnum.ageGroupList), // 年龄段
      canine_type: this.getSelectedValueList(this.data.universalEnum.canineTypeList), // 犬型
      formula: this.getSelectedValueList(this.data.universalEnum.formulaList), // 配方
      weight: this.getSelectedValueList(this.data.universalEnum.weightList) // 重量
    }
    this.setData({
      size: 8,
      allPage: 1,
    })
    this.getCurrentList(this.data.nowId, true, extSearchParams)
    this.onCloseSortPopup()
  },
  resetSearch(){
    for (let key in this.data.universalEnum) {
      this.data.universalEnum[key] = this.data.universalEnum[key].map((item)=>{
        return {
          ...item,
          isSelected: false
        }
      })
    }
    this.setData({
      universalEnum: this.data.universalEnum
    })
    this.setData({
      size: 8,
      allPage: 1,
    })
    this.getCurrentList(this.data.nowId, true)
    this.onCloseSortPopup()
  },
  /**
   * 搜索
   */
  openSortFilter: function (event) {
    let currentId = event.currentTarget.id;
    switch (currentId) {
      case 'salesSort':
        let _SortOrder = 'asc';
        if (this.data.salesSortOrder == 'asc') {
          _SortOrder = 'desc';
        }
        this.setData({
          'currentSortType': 'sales',
          'currentSortOrder': 'asc',
          'salesSortOrder': _SortOrder
        });
        break;
      case 'priceSort':
        let tmpSortOrder = 'asc';
        if (this.data.currentSortOrder == 'asc') {
          tmpSortOrder = 'desc';
        }
        this.setData({
          'currentSortType': 'price',
          'currentSortOrder': tmpSortOrder,
          'salesSortOrder': 'asc'
        });
        break;
      default:
        //综合排序
        this.setData({
          'currentSortType': 'default',
          'currentSortOrder': 'desc',
          'salesSortOrder': 'desc'
        });
    }
    this.setData({
      size: 8,
      allPage: 1,
    })
    this.getCurrentList(this.data.nowId, true)
  },
})