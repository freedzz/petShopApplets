var util = require('../../utils/util.js');
var api = require('../../config/api.js');
const pay = require('../../services/pay.js');
const app = getApp()
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  data: {
    checkedGoodsList: [],
    checkedAddress: {},
    goodsTotalPrice: 0.00, //商品总价
    freightPrice: 0.00, //快递费
    orderTotalPrice: 0.00, //订单总价
    actualPrice: 0.00, //实际需要支付的总价
    addressId: 0,
    goodsCount: 0,
    postscript: '',
    outStock: 0,
    payMethodItems: [
      {
        name: 'payWallet',
        value: '余额支付'
      },
      {
        name: 'offline',
        value: '线下支付'
      },
      {
        name: 'online',
        value: '在线支付',
        checked: 'true'
      },
    ],
    payMethod: 1,
    userInfo: {}
  },
  payChange(e) {
    let val = e.detail.value;
    if (val == 'offline') {
      this.setData({
        payMethod: 0
      })
    } else if(val == 'online') {
      this.setData({
        payMethod: 1
      })
    } else if(val === 'payWallet'){
      this.setData({
        payMethod: 2
      })
    }
  },
  toGoodsList: function (e) {
    wx.navigateTo({
      url: '/pages/ucenter/goodsList/index?id=0',
    });
  },
  toSelectAddress: function () {
    wx.navigateTo({
      url: '/pages/ucenter/address/index?type=1',
    });
  },
  toAddAddress: function () {
    wx.navigateTo({
      url: '/pages/ucenter/address-add/index',
    })
  },
  bindinputMemo(event) {
    let postscript = event.detail.value;
    this.setData({
      postscript: postscript
    });
  },
  onLoad: function (options) {
    let addType = options.addtype;
    let orderFrom = options.orderFrom;
    if (addType != undefined) {
      this.setData({
        addType: addType
      })
    }
    if (orderFrom != undefined) {
      this.setData({
        orderFrom: orderFrom
      })
    }
    this.getUserExtInfo()
  },
  onUnload: function () {
    wx.removeStorageSync('addressId');
  },
  onShow: function () {
    // 页面显示
    // TODO结算时，显示默认地址，而不是从storage中获取的地址值
    try {
      var addressId = wx.getStorageSync('addressId');
      if (addressId == 0 || addressId == '') {
        addressId = 0;
      }
      this.setData({
        'addressId': addressId
      });
    } catch (e) {}
    this.getCheckoutInfo();
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    try {
      var addressId = wx.getStorageSync('addressId');
      if (addressId == 0 || addressId == '') {
        addressId = 0;
      }
      this.setData({
        'addressId': addressId
      });
      this.getUserExtInfo()
    } catch (e) {
      // Do something when catch error
    }
    this.getCheckoutInfo();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  getCheckoutInfo: function () {
    let that = this;
    let addressId = that.data.addressId;
    let orderFrom = that.data.orderFrom;
    let addType = that.data.addType;
    util.request(api.CartCheckout, {
      addressId: addressId,
      addType: addType,
      orderFrom: orderFrom,
      type: 0
    }).then(function (res) {
      if (res.errno === 0) {
        let addressId = 0;
        if (res.data.checkedAddress != 0) {
          addressId = res.data.checkedAddress.id;
        }
        that.setData({
          checkedGoodsList: res.data.checkedGoodsList,
          checkedAddress: res.data.checkedAddress,
          actualPrice: res.data.actualPrice,
          addressId: addressId,
          freightPrice: res.data.freightPrice,
          goodsTotalPrice: res.data.goodsTotalPrice,
          orderTotalPrice: res.data.orderTotalPrice,
          goodsCount: res.data.goodsCount,
          outStock: res.data.outStock
        });
        let goods = res.data.checkedGoodsList;
        wx.setStorageSync('addressId', addressId);
        if (res.data.outStock == 1) {
          util.showErrorToast('有部分商品缺货或已下架');
        } else if (res.data.numberChange == 1) {
          util.showErrorToast('部分商品库存有变动');
        }
      }
    });
  },
  // TODO 有个bug，用户没选择地址，支付无法继续进行，在切换过token的情况下
  submitOrder: function (e) {
    if (this.data.addressId <= 0) {
      util.showErrorToast('请选择收货地址');
      return false;
    }
    let addressId = this.data.addressId;
    let postscript = this.data.postscript;
    let freightPrice = this.data.freightPrice;
    let actualPrice = this.data.actualPrice;
    wx.showLoading({
      title: '',
      mask: true
    })
    util.request(api.OrderSubmit, {
      addressId: addressId,
      postscript: postscript,
      freightPrice: freightPrice,
      actualPrice: actualPrice,
      offlinePay: 0
    }, 'POST').then(res => {
      if (res.errno === 0) {
        wx.removeStorageSync('orderId');
        wx.setStorageSync('addressId', 0);
        const orderId = res.data.orderInfo.id;
        pay.payOrder(parseInt(orderId)).then(res => {
          wx.redirectTo({
            url: '/pages/payResult/payResult?status=1&orderId=' + orderId
          });
        }).catch(res => {
          wx.redirectTo({
            url: '/pages/payResult/payResult?status=0&orderId=' + orderId
          });
        });
      } else {
        util.showErrorToast(res.errmsg);
      }
      wx.hideLoading()
    });
  },
  offlineOrder: function (e) {
    if (this.data.addressId <= 0) {
      util.showErrorToast('请选择收货地址');
      return false;
    }
    let addressId = this.data.addressId;
    let postscript = this.data.postscript;
    let freightPrice = this.data.freightPrice;
    let actualPrice = this.data.actualPrice;
    util.request(api.OrderSubmit, {
      addressId: addressId,
      postscript: postscript,
      freightPrice: freightPrice,
      actualPrice: actualPrice,
      offlinePay: 1
    }, 'POST').then(res => {
      if (res.errno === 0) {
        wx.removeStorageSync('orderId');
        wx.setStorageSync('addressId', 0);
        wx.redirectTo({
          url: '/pages/payOffline/index?status=1',
        })
      } else {
        util.showErrorToast(res.errmsg);
        wx.redirectTo({
          url: '/pages/payOffline/index?status=0',
        })
      }
    });
  },
  walletOrder(){
    if (this.data.addressId <= 0) {
      util.showErrorToast('请选择收货地址');
      return false;
    }
    let addressId = this.data.addressId;
    let postscript = this.data.postscript;
    let freightPrice = this.data.freightPrice;
    let actualPrice = this.data.actualPrice;
    if(this.data.userInfo.walletBalance < actualPrice){
      util.showErrorToast(`支付失败，余额不足，钱包余额为${this.data.userInfo.walletBalance || 0}元`)
      return
    }
    // 弹出支付弹窗
    let message = `当前钱包余额为${this.data.userInfo.walletBalance || 0}元,确定支付${actualPrice}元购买商品？`
    Dialog.confirm({
      title: '确定',
      message: message,
    })
    .then(async () => {
      util.request(api.OrderSubmit, {
        addressId: addressId,
        postscript: postscript,
        freightPrice: freightPrice,
        actualPrice: actualPrice,
        offlinePay: 2
      }, 'POST').then(res => {
        if (res.errno === 0) {
          wx.removeStorageSync('orderId');
          wx.setStorageSync('addressId', 0);
          const orderId = res.data.orderInfo.id;
          pay.payOrderWithWallet(parseInt(orderId))
          .then(res => {
            wx.redirectTo({
              url: '/pages/payResult/payResult?status=1&orderId=' + orderId
            });
          }).catch(res => {
            wx.redirectTo({
              url: '/pages/payResult/payResult?status=0&orderId=' + orderId
            });
          });
        } else {
          util.showErrorToast(res.errmsg);
        }
      });
    })
    .catch(()=>{
      console.log('取消支付')
    })
    
  },
  async getUserExtInfo(){
    let res = await util.request(api.getUserExtInfo, {}, 'get')
    if(res.errno ===0){
      this.setData({
        userInfo: res.data
      })
    }
  },
})