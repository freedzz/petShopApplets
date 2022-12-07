var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
const pay = require('../../../services/pay.js');
const app = getApp()

Page({
  data: {
    petFileList: []
  },
  updatePetFiles(e){
    let petFileId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/ucenter/petFilesDetail/index?petFileId=${petFileId}`,
    })
  },
  addpetFiles(){
    wx.navigateTo({
      url: '/pages/ucenter/petFilesDetail/index',
    });
  },
  getPetFileList(){
    util.request(api.GetPetFileList)
    .then((res) => {
      if (res.errno === 0) {
        this.setData({
          petFileList: res.data
        })
      }
    });
  },
  onLoad() {
    this.getPetFileList()
  },
  onShow() {
    this.getPetFileList()
  },
  onPullDownRefresh(){
    this.getPetFileList()
  },
  switchTab(event) {},
  onReachBottom() {}
})