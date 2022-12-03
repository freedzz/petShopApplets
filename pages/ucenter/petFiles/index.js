var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
const pay = require('../../../services/pay.js');
const app = getApp()

Page({
  data: {},
  addpetFiles(){
    let res = util.loginNow();
    if (res == true) {
      wx.navigateTo({
        url: '/pages/ucenter/petFilesDetail/index',
      });
    }
  },
  onLoad() {},
  onShow() {},
  switchTab(event) {
    let showType = event.currentTarget.dataset.index;
  },
  onReachBottom: function () {}
})