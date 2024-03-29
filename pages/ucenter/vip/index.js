const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');
const pay = require('../../../services/pay.js');

import Dialog from '@vant/weapp/dialog/dialog';
const app = getApp()

Page({
  data: {
    userInfo: {
      vipStartTime: '',
      vipEndTime: ''
    }
  },
  async getUserExtInfo() {
    let res = await util.request(api.getUserExtInfo, {}, 'get')
    if (res.errno === 0) {
      this.setData({
        userInfo: res.data
      })
    }
  },
  async rechangeVip() {
    let message = '当前用户暂未开通会员，确定支付16.8元开通一个月会员？'
    if (this.data.userInfo.vipStartTime && this.data.userInfo.vipEndTime) {
      message = `当前会员有效期为${this.data.userInfo.vipStartTime}到${this.data.userInfo.vipEndTime}, 确定支付16.8元续费一个月会员？`
    }
    Dialog.confirm({
      title: '确定',
      message: message,
    })
    .then(async () => {
      // 调用充值方法进行充值
      pay.reChargeWeixin(16.8, 1)
      .then(async () => {
        let res = await util.request(api.updateUserVip, {
          id: this.data.userInfo.id
        }, 'post')
        if (res.errno === 0) {
          console.log('充值vip成功')
          util.showSuccessToast('充值vip成功')
          this.getUserExtInfo()
        }
      })
      .catch(err => {
        util.showErrorToast(err && err.errmsg ? err.errmsg : '充值vip失败')
      });
    })
    .catch(()=>{
      console.log('取消充值')
    })
  },
  onLoad() {
    this.getUserExtInfo()
  },
  onShow() {},
  onPullDownRefresh() {
    this.getUserExtInfo()
  }
})
