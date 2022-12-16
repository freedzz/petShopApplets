var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

const app = getApp()

Page({
  data: {
    goodsList: [],
    isVipUser: ''
  },
  async getUserExtInfo() {
    let res = await util.request(api.getUserExtInfo, {}, 'get')
    if (res.errno === 0) {
      this.setData({
        isVipUser: res.data.isVip
      })
    }
  },
  onLoad: function (options) {
    this.getUserExtInfo()
    this.getGoodsList(options.id);
  },
  getGoodsList: function (id) {
    let that = this;
    util.request(api.OrderGoods, {
      orderId: id
    }).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          goodsList: res.data
        });
      }
    });
  }
})