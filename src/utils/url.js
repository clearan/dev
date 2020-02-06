var main_url = [
  {value:'service',desc:'短信业务管理'},
  {value:'recharge',desc:'商户充值管理'},
  {value:'config',desc:'规则配置管理'},
  {value:'merchant',desc:'商户信息管理'},
  {value:'member',desc:'会员信息管理'},
  {value:'profit',desc:'收益信息管理'},
  {value:'log',desc:'日志信息管理'},
  {value:'monitor',desc:'实时监控管理'},
  {value:'chart',desc:'报表信息管理'}
]

var child_url = [
  {value:'service/index',desc:'审核列表'},
  {value:'service/mission_detail',desc:'任务详情'},
  {value:'recharge/index',desc:'充值列表'},
  {value:'config/index',desc:'资金账户'},
  {value:'config/system',desc:'系统配置'},
  {value:'config/white',desc:'白名单'},
  {value:'merchant/index',desc:'签约商户'},
  {value:'merchant/chmoney',desc:'修改商户金额'},
  {value:'merchant/dynamic_detail',desc:'商户动账详情'},
  {value:'member/index',desc:'会员列表'},
  {value:'member/withdraw',desc:'会员提现申请'},
  {value:'member/dynamic_detail',desc:'会员动账详情'},
  {value:'member/sub_detail',desc:'会员下级代理详情'},
  {value:'member/chmoney',desc:'修改会员金额'},
  {value:'profit/index',desc:'收益列表'},
  {value:'profit/detail',desc:'收益详情'},
  {value:'log/index',desc:'余额操作日志'},
  {value:'monitor/index',desc:'在线会员'},
  {value:'monitor/order',desc:'接单会员'},
  {value:'monitor/doubt',desc:'可疑会员'},
  {value:'chart/index',desc:'报表'},

]
// [
// {value:'service',desc:'客服管理',child:[{value:'service/index',desc:'审核列表'},{value:'service/recharge',desc:'充值列表'}]},
//   {value:'email',desc:'邮件管理'}
// ]
export {main_url,child_url}

// var strUrl=window.location.href;
// var req = {
//     file: strUrl,
//     line_num: 265,
//     context: 'Hello world'
// }
// this.$http.post(`${this.url}/elefun`,qs.stringify(req)).then((resp)=>{
//     console.log(resp)
// })

