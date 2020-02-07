<template>

  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;"
  >
    <div class="app-container">

      <div class="filter-container">

        <div style="margin-top:10px">
          <el-input v-model="listQuery.id" clearable placeholder="会员编号/会员账号" style="width: 250px;" class="filter-item" @keyup.enter.native="handleFilter" />
          <el-button v-waves class="filter-item" type="primary" style="margin-left: 20px" icon="el-icon-search" @click="handleFilter">
            搜索
          </el-button>
        </div>

      </div>

      <el-table
        border fit highlight-current-row style="width: 100%;"
        :data="member_list"
        row-key="Id"
        :default-sort = "{prop: 'CreatedTime', order: 'descending'}"
        v-loading="loading"
        element-loading-text="加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 1)"
      >

        <el-table-column
          min-width="18%"
          align="center"
          prop="Id"
          label="会员编号"
        >
          <template slot-scope="{row}">
            {{ row.Id }}
          </template>

        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="Phone"
          label="会员账号"
        >
          <template slot-scope="{row}">
            {{row.Phone}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="Amount"
          label="余额(元)"
        >
          <template slot-scope="{row}">
            {{row.Amount | formatMoney}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="Commission"
          label="佣金(元)"
        >
          <template slot-scope="{row}">
            {{row.Commission | formatMoney}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="12%"
          align="center"
          prop="all"
          label="发送条数"
        >
          <template slot-scope="{row}">
            {{row.success+row.failed}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="12%"
          align="center"
          prop="Success"
          label="成功数"
        >
          <template slot-scope="{row}">
            {{row.success}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="12%"
          align="center"
          prop="failed"
          label="失败数"
        >
          <template slot-scope="{row}">
            {{row.failed}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="12%"
          align="center"
          prop="receipt"
          label="回执数"
        >
          <template slot-scope="{row}">
            {{row.receipt}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="12%"
          align="center"
          prop="rate"
          label="回执率"
        >
          <template slot-scope="{row}">
            {{row.rate}}
          </template>
        </el-table-column>


        <el-table-column
          min-width="18%"
          align="center"
          prop="CreatedTime"
          label="注册时间"
        >
          <template slot-scope="{row}">
            {{row.CreatedTime |formatDate }}
          </template>
        </el-table-column>

        <el-table-column
          min-width="15%"
          align="center"
          prop="state"
          label="状态"
        >
          <template slot-scope="{row}">
            <el-switch
              v-model="row.State"
              @change="changeState(row)"
            >
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column
          min-width="15%"
          align="center"
          prop="submission_state"
          label="接单"
        >
          <template slot-scope="{row}">
            <el-switch
              v-model="row.SubMissionState"
              @change="changeSubmissionState(row)"
            >
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column
          min-width="15%"
          align="center"
          prop="withdraw_state"
          label="提现"
        >
          <template slot-scope="{row}">
            <el-switch
              v-model="row.WithdrawState"
              @change="changeWithdrawState(row)"
            >
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="CreatedTime"
          label="操作"
        >
          <template slot-scope="{row}">
            <el-link  type="primary" @click="showDetail(row)">
              动账详情
            </el-link>

            <el-link  type="primary" @click="showSub(row)">
              下级代理
            </el-link>
          </template>
        </el-table-column>

      </el-table>

      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    </div>

  </div>
</template>

<script>
    import Pagination from '@/components/Pagination'
    import {LocalStorage} from '@/utils/storage'
    import {formatDate} from '@/utils/date'
    import {formatMoney} from '@/utils/money'
    import qs from 'qs'

    export default {
        components: { Pagination },
        data() {
            return {
                loading: true,
                member_list:[],
                all_list:[],
                listQuery: {
                    id:'',
                    page: 1,
                    limit: 10
                },
                total:0,
                dialogVisible: false,
            }
        },

        filters:{
            //时间戳
            formatDate(time) {
                return formatDate(time);
            },

            //金额千分化
            formatMoney(money) {
                return formatMoney(money)
            }
        },

        methods:{

            handleFilter() {
                this.listQuery.page = 1
                let arr = []
                for (var i=0;i<this.all_list.length;i++) {
                    if (i<this.listQuery.limit) {
                        arr.push(this.all_list[i])
                    }
                }

                let id = this.listQuery.id
                if (id !== '' && id.length === 24 && JSON.stringify(this.all_list).includes(id)) {
                    //编号
                    this.member_list = []
                    for(let v of this.all_list) {
                        if (id === v['Id']) {
                             this.member_list.push(v)
                        }
                    }
                    this.total = 1
                } else if (id !== '' && id.length === 11 && JSON.stringify(this.all_list).includes(id)) {
                    this.member_list = []
                    for(let v of this.all_list) {
                        if (id === v['Phone']) {
                            this.member_list.push(v)
                        }
                    }
                    this.total = 1
                } else if (id === '') {
                    this.member_list = arr
                    this.total = this.all_list.length
                } else {
                    this.member_list = []
                    this.total = 0
                }
            },

            showDetail(row) {
                let date = new Date().getTime();
                LocalStorage.set("phone", row.Phone, date + 3*60*60*1000);
                this.$router.push({path: '/member/dynamic_detail', query: {id: row.Id}})
            },

            showSub(row) {
                let date = new Date().getTime();
                LocalStorage.set("phone", row.Phone, date + 3*60*60*1000);
                this.$router.push({path: '/member/sub_detail', query: {id: row.Uid}})
            },

            changeState (row) {
                let data = {
                    id:row.Id,
                    state: row.State ? 0 : 1,
                };
                this.$http.post(`${this.url}/server/ban`,qs.stringify(data)).then((resp)=> {
                    if (resp.code === 0) {
                        this.$message({
                            message:'Ok',
                            type:'success',
                            center:true
                        })
                    } else {
                        row.State = !row.State
                        this.msgTip(resp.message)
                    }
                }).catch((error) => {
                    row.State = !row.State
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })
            },

            changeSubmissionState (row) {
                let data = {
                    id:row.Id,
                    state: row.SubMissionState ? 0 : 1,
                };
                this.$http.post(`${this.url}/server/submission_state`,qs.stringify(data)).then((resp)=> {
                    if (resp.code === 0) {
                        this.$message({
                            message:'Ok',
                            type:'success',
                            center:true
                        })
                    } else {
                        row.SubMissionState = !row.SubMissionState
                        this.msgTip(resp.message)
                    }
                }).catch((error) => {
                    row.SubMissionState = !row.SubMissionState
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })
            },

            changeWithdrawState (row) {
                let data = {
                    id:row.Id,
                    state: row.WithdrawState ? 0 : 1,
                };
                this.$http.post(`${this.url}/server/withdraw_state`,qs.stringify(data)).then((resp)=> {
                    if (resp.code === 0) {
                        this.$message({
                            message:'Ok',
                            type:'success',
                            center:true
                        })
                    } else {
                        row.WithdrawState = !row.WithdrawState
                        this.msgTip(resp.message)
                    }
                }).catch((error) => {
                    row.WithdrawState = !row.WithdrawState
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })
            },

            getList(obj) {

                this.member_list = []

                if (obj!==undefined && obj.flag !== undefined) {
                    this.listQuery.page =1
                }

                let val = obj === undefined ? 10 : obj.limit

                for (var i=0;i<this.all_list.length;i++) {

                    //初始化或选择一页数据时
                    if (obj === undefined || obj.flag !== undefined) {
                        if (i<val) {
                            this.member_list.push(this.all_list[i])
                        }
                    }

                    //选择页码
                    if (obj !== undefined && obj.flag === undefined) {
                        let beg = (this.listQuery.page - 1)*this.listQuery.limit
                        let end = (this.listQuery.page - 1)*this.listQuery.limit+this.listQuery.limit-1
                        if (i>=beg && i<=end) {
                            this.member_list.push(this.all_list[i])
                        }
                    }
                }

            },

            getData() {

                let data = {
                    self_id: parseInt(LocalStorage.get('self_id')),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    state : 0
                };

                this.$http.post(`${this.url}/get_monitor_mems`,qs.stringify(data)).then((resp)=>{
                    this.loading = false
                    if (resp.ret_code === 0) {
                        if (resp.ret_data.mems) {
                            // let arr = [
                            //     {"Id":"5e26b0c2265ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111111","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2265ae63e72bf8af1","Uid":136673256,"State":0,"Phone":"13111111112","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2265ae63e72bf8af2","Uid":136673256,"State":0,"Phone":"13111111113","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2265ae63e72bf8af3","Uid":136673256,"State":0,"Phone":"13111111114","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2265ae63e72bf8af4","Uid":136673256,"State":0,"Phone":"13111111115","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2265ae63e72bf8af6","Uid":136673256,"State":0,"Phone":"13111111116","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2265ae63e73bf8af5","Uid":136673256,"State":0,"Phone":"13111111117","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2265ae63e74bf8af5","Uid":136673256,"State":0,"Phone":"13111111118","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2265ae63e75bf8af5","Uid":136673256,"State":0,"Phone":"13111111119","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2265ae63e76bf8af5","Uid":136673256,"State":0,"Phone":"13111111120","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2225ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111121","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2245ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111122","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     {"Id":"5e26b0c2295ae63e72bf8af5","Uid":136673256,"State":0,"Phone":"13111111123","Amount":30531,"CreatedTime":1578748167},
                            //     ]
                            // let list = arr
                            let list = resp.ret_data.mems
                            for( var i=0;i<list.length;i++) {
                                let amount = String(list[i]['Amount']);
                                let commission = String(list[i]['Commission']);
                                list[i]['Amount'] =  this.count(amount)
                                list[i]['Commission'] =  this.count(commission)
                                list[i]['State'] = list[i]['State'] === 0
                                list[i]['WithdrawState'] = list[i]['WithdrawState'] === 0
                                list[i]['SubMissionState'] = list[i]['SubMissionState'] === 0
                                if (list[i]['success'] === 0 || list[i]['receipt'] === 0) {
                                    list[i]['rate'] = '0%'
                                } else if (list[i]['receipt'] !== 0 && list[i]['receipt'] === list[i]['success'] ) {
                                    list[i]['rate'] = '100%'
                                } else {
                                    //list[i]['rate'] = (list[i]['receipt']/list[i]['success']).toFixed(2).substr(2,2)+'%'
                                    list[i]['rate'] = (Math.round(list[i]['receipt'] / list[i]['success'] * 10000) / 100.00)+"%"
                                }
                            }

                            this.all_list = list;
                            this.total = list.length
                            this.getList()
                        }else {
                            this.all_list = [];
                            this.total = 0
                            this.getList()
                        }
                    }else if(resp.ret_code === -1){
                        this.all_list = [];
                        this.total = 0
                        this.getList()
                    }else{
                        this.msgTip(resp.ret_msg)
                    }
                }).catch((error)=>{
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })
            },

            count1 (val) {
                if (val.length === 1) {
                    val = '0.0'+val
                }else if (val.length === 2) {
                    val = '0.'+val
                }else{
                    return val.slice(0, -2) + "." + val.slice(val.length - 2)
                }
                return val
            },

            count (val) {
                let new_val = String(Math.abs(val))
                if (new_val.length === 1) {
                    new_val = '0.0'+new_val
                } else if (new_val.length === 2) {
                    new_val = '0.'+new_val
                } else{
                    new_val = new_val.slice(0, -2) + "." + new_val.slice(new_val.length - 2)
                }
                let return_val = ''
                if (val < 0) {
                    return_val = '-' + new_val
                } else {
                    return_val = new_val
                }
                return return_val
            },


            msgTip(name) {
                this.$message({
                    message:name,
                    type:'error',
                    center:true
                })
            },
        },

        created() {
            this.getData()
        }
    }

</script>



