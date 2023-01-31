const util = require('../../../utils/util.js');
const api = require('../../../config/api.js');
const pay = require('../../../services/pay.js');

import Dialog from '@vant/weapp/dialog/dialog';

const app = getApp()
const rechargeObj = {
  300: 325,
  500: 565
}

Page({
  data: {
    userInfo: {
      walletBalance: ''
    }
  },
  async getUserExtInfo(){
    let res = await util.request(api.getUserExtInfo, {}, 'get')
    if(res.errno ===0){
      this.setData({
        userInfo: res.data
      })
    }
  },
  /**
   * 充值 300 / 500
   * 
  */
  async rechangeAccount(event){
    const { rechangenum } = event && event.currentTarget ? event.currentTarget.dataset : {}
    let message = `当前账号余额为${this.data.userInfo.walletBalance || 0}元, 确定充值${rechangenum}元？`
    Dialog.confirm({
      title: '确定',
      message: message,
    })
    .then(async () => {
      // 调用充值方法进行充值
      pay.reChargeWeixin(rechangenum, 2)
      .then(async () => {
        let res = await util.request(api.updateUserWallet, {
          rechargeAmount: rechargeObj[rechangenum],
          id: this.data.userInfo.id
        }, 'post')
        if(res.errno ===0){
          console.log(`充值${rechargeObj[rechangenum]}元成功`)
          util.showSuccessToast(`充值${rechargeObj[rechangenum]}元成功`)
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
  onPullDownRefresh(){
    this.getUserExtInfo()
  }
})