/**
 * 支付相关服务
 */
const util = require('../utils/util.js');
const api = require('../config/api.js');

function payOrder(orderId) {
  return new Promise(function (resolve, reject) {
    util.request(api.PayPrepayId, {
      orderId: orderId
    }).then((res) => {
      if (res.errno === 0) {
        const payParam = res.data;
        // 如果没有支付想直接支付成功，下面注释。
        // -----------------------------------
        wx.requestPayment({
          'timeStamp': payParam.timeStamp,
          'nonceStr': payParam.nonceStr,
          'package': payParam.package,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function (res) {
            resolve(res);
          },
          'fail': function (res) {
            reject(res);
          },
          'complete': function (res) {
            reject(res);
          }
        });
        // -----------------------------------

        // =================================
        // 直接支付成功，下面打开，上面注释
        // resolve(res);
        // =================================
      } else {
        reject(res);
      }
    });
  });
}
/**
 * 使用钱包进行支付
 */
function payOrderWithWallet(orderId){
  return new Promise(function (resolve, reject) {
    util.request(api.PayPreWallet, {
      orderId: orderId
    }).then((res) => {
      if (res.errno === 0) {
        resolve(res);
      } else {
        reject(res);
      }
    });
  });
}
/**
 * vip/余额充值
 */
function reChargeWeixin(rechargeAmount, orderType){
  return new Promise(async (resolve, reject) => {
    let res = await util.request(api.reChargeWeixin, {
      orderType: orderType,
      rechargeAmount: 0.1
    }, 'post')
    if (res.errno === 0) {
      const payParam = res.data;
      wx.requestPayment({
        'timeStamp': payParam.timeStamp,
        'nonceStr': payParam.nonceStr,
        'package': payParam.package,
        'signType': payParam.signType,
        'paySign': payParam.paySign,
        'success': function (res) {
          resolve(res);
        },
        'fail': function (res) {
          reject(res);
        },
        'complete': function (res) {
          reject(res);
        }
      });
    } else {
      reject(res);
    }
  });
}

module.exports = {
  payOrder,
  payOrderWithWallet,
  reChargeWeixin
};