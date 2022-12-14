var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
const pay = require('../../../services/pay.js');
const moment = require('../../../utils/moment.js')
const app = getApp()

Page({
  data: {
    petFileId: '',
    petInfo: {
      petType: 1,
      petName: '',
      petIcon: '',
      petBirthday: moment().format('YYYY-MM-DD'),
      petSex: '1',
      isSterilization: '1',
      petWeight: '',
      vaccineTime: moment().format('YYYY-MM-DD')
    },
    showDatetimePicker: false,
    selectedKey: '',
    petNameError: false,
    petWeightError: false,
    fileList: []
  },
  onChange(event){
    let value = event.detail
    let key = event && event.target && event.target.dataset ? event.target.dataset.key : ''
    let petInfo = this.data.petInfo
    petInfo[key] = value
    this.setData({
      petInfo: petInfo,
      petWeightError: false,
      petNameError: false
    })
    
  },
  submitDatetimePicker(value){
    let petInfo = this.data.petInfo;
    let key = this.data.selectedKey
    petInfo[key] = moment(value.detail).format('YYYY-MM-DD');
    this.setData({
      petInfo: petInfo,
      showDatetimePicker: false
    });
  },
  handleShowDatetimePicker(event){
    let key = event && event.target && event.target.dataset ? event.target.dataset.key : ''
    this.setData({
      selectedKey: key,
      showDatetimePicker: true
    });
  },
  cancelDatetimePicker(){
    this.setData({
      showDatetimePicker: false
    });
  },
  /**
   * 保存宠物信息
   */
  submitForm(){
    if(!this.data.petInfo.petName){
      this.setData({
        petNameError: true
      })
      return
    }
    if(!this.data.petInfo.petWeight){
      this.setData({
        petWeightError: true
      })
      return
    }
    util.request(api.SavePetFile, {
      id: this.data.petFileId,
      ...this.data.petInfo
    }, 'POST').then((res) => {
      if (res.errno === 0) {
        wx.showToast({
          title: this.data.petFileId ? '更新成功' : '新增成功',
          duration: 500,
          complete: () => {
            setTimeout(()=>{
              wx.navigateBack()
            }, 500)
          }
        })
      }
    });
  },
  /**
   * 删除宠物档案
   */
  deletePetFile(){
    util.request(api.DeletePetFile, {
      id: this.data.petFileId,
    }).then((res) => {
      if (res.errno === 0) {
        wx.showToast({
          title: '删除成功',
          duration: 500,
          complete: () => {
            setTimeout(()=>{
              wx.navigateBack()
            }, 500)
          }
        })
      }
    });
  },
  /**
   * 根据id获取宠物信息
   */
  getPetFileDetail: function () {
    util.request(api.getPetFileDetail, {
      id: this.data.petFileId
    }).then((res) => {
      if (res.errno === 0) {
        this.setData({
          petInfo: res.data,
          fileList: [{
            url: res.data.petIcon,
            isImage: true
          }]
        })
      }
    });
    wx.hideLoading();
  },
  deleteIcon(){
    let petInfo = this.data.petInfo
    petInfo.petIcon = ''
    this.setData({
      petInfo: petInfo,
      fileList: []
    })
  },
  afterRead(event){
    const { file } = event.detail
    const fileName = moment().format('YYYYMMDDHHmmssSSS') + Math.floor(Math.random() * 100) + 'petIcon'
    // 获取token
    util.request(api.qiniuToken, {}, 'post')
    .then((res) => {
      if (res.errno === 0) {
        // 上传文件
        const { token, url } = res.data
        wx.uploadFile({
          url: api.qiniu,
          filePath: file.thumb,
          name: 'file',
          formData: {
            'token': token,
            'key': fileName
          },
          success: (res) => {
            if(res.statusCode === 200){
              const resData = JSON.parse(res.data)
              let petInfo = this.data.petInfo
              petInfo.petIcon = url + resData.key
              this.setData({
                petInfo: petInfo,
                fileList: [{
                  url: url + resData.key,
                  isImage: true
                }]
              })
            }
          }
        })
      }
    })
  },
  onLoad(options) {
    if(options.petFileId){
      wx.setNavigationBarTitle({
        title:"修改宠物信息"
      })
      wx.showLoading({
        title: '加载中...',
      })
      this.setData({
        petFileId: options.petFileId || ''
      })
      this.getPetFileDetail()
    } else {
      wx.setNavigationBarTitle({
        title:"新增宠物信息"
      })
    }
  },
  onShow() {},
  switchTab() {},
  onReachBottom() {}
})