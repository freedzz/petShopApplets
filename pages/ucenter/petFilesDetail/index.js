var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
const pay = require('../../../services/pay.js');
const moment = require('../../../utils/moment.js')
const app = getApp()
// 触底上拉刷新 TODO 这里要将page传给服务器，作者没写
Page({
  data: {
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
    selectedKey: ''
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
  submitForm(){
    console.log(this.data.petInfo)
  },
  onLoad: function () {},
  onShow: function () {},
  switchTab: function (event) {
    let showType = event.currentTarget.dataset.index;
  },
  onReachBottom: function () {}
})