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

        <timeselect @getTimeResult="get_time_result" @getTime="get_time"/>

        <div style="margin-top:10px">
          <el-input v-model="listQuery.id" clearable placeholder="会员编号/手机号" style="width: 250px;" class="filter-item" @keyup.enter.native="handleFilter" />
          <el-select v-model="listQuery.state" placeholder="状态" clearable style="width: 90px;margin-left: 20px" class="filter-item">
            <el-option v-for="item in states" :key="item.state" :label="item.name" :value="item.state" />
          </el-select>

          <el-button v-waves class="filter-item" type="primary" style="margin-left: 20px;" icon="el-icon-search" @click="handleFilter" :loading="search_loading">
            搜索
          </el-button>
        </div>

      </div>

      <el-table
        border fit highlight-current-row style="width: 100%;"
        :data="member_list"
        row-key="Id"
        :default-sort = "{prop: 'CreatedTime', order: 'descending'}"
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
          min-width="13%"
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
          prop="CreatedTime"
          label="注册时间"
        >
          <template slot-scope="{row}">
            {{row.CreatedTime |formatDate }}
          </template>
        </el-table-column>

        <el-table-column
          min-width="7%"
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
          min-width="7%"
          align="center"
          prop="submission_state"
          label="接单"
        >
          <template slot-scope="{row}">
            <el-switch
              v-model="row.SubmissionState"
              @change="changeSubmissionState(row)"
            >
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column
          min-width="7%"
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
          min-width="15%"
          align="center"
          prop="remark"
          label="备注"
        >
          <template slot-scope="{row}">
            <div v-html="row.remark"></div>
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
    import Timeselect from '@/components/Timeselect'

    export default {
        components: { Pagination,Timeselect},
        data() {
            return {
                button:['','','','','','',''],
                search_loading:false,
                member_list:[],
                listQuery: {
                    value1:'',
                    value2:'',
                    page: 1,
                    limit: 10,
                    id: undefined,
                    state:undefined
                },
                states : [
                    {state:0,name:'正常'},
                    {state:1,name:'禁用'},
                ],
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

            get_time_result(obj) {
                this.listQuery.value1 = obj.value1
                this.listQuery.value2 = obj.value2
                this.handleFilter()
            },

            get_time(obj) {
                this.listQuery.value1 = obj.value1
                this.listQuery.value2 = obj.value2
            },

            handleFilter() {
                this.listQuery.page = 1;
                this.getList()
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

            state_post(row,data) {
                this.$http.post(`${this.url}/server/ban`,qs.stringify(data)).then((resp)=> {
                    if (resp.code === 0) {
                        //row.State = !data.state
                        this.getList()
                        this.$message({
                            message:'Ok',
                            type:'success',
                            center:true
                        })
                    } else {
                        row.State = !!data.state
                        this.msgTip(resp.message)
                    }
                }).catch((error) => {
                    row.State = !!data.state
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })
            },


            changeState (row) {

                if (!row.State) {
                    row.State = !row.State
                    this.$prompt('请输入备注', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        inputPattern: /\S/,
                        inputErrorMessage: '备注不能为空',
                        closeOnClickModal:false,
                        closeOnPressEscape:false,
                    }).then(({ value }) => {
                        if (value.length>15){
                            this.msgTip('输入内容限制15字以内')
                            return
                        }

                        let data = {
                            self_id: parseInt(LocalStorage.get('self_id')),
                            sess: LocalStorage.get('sess'),
                            idempotent: new Date().getTime(),
                            id:row.Id,
                            state: 1,
                            remark:value,
                            operator:LocalStorage.get('user_name')
                        };
                        this.state_post(row,data)
                    })
                }else{
                    let data = {
                        id:row.Id,
                        state: 0,
                    };
                    this.state_post(row,data)
                }
            },

            Submission_post(row,data) {
                this.$http.post(`${this.url}/server/submission_state`,qs.stringify(data)).then((resp)=> {
                    if (resp.code === 0) {
                        //row.State = !data.state
                        this.getList()
                        this.$message({
                            message:'Ok',
                            type:'success',
                            center:true
                        })
                    } else {
                        row.SubmissionState = !!data.state
                        this.msgTip(resp.message)
                    }
                }).catch((error) => {
                    row.SubmissionState = !!data.state
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })
            },

            changeSubmissionState (row) {
                if (!row.SubmissionState) {
                    row.SubmissionState = !row.SubmissionState
                    this.$prompt('请输入备注', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        inputPattern: /\S/,
                        inputErrorMessage: '备注不能为空',
                        closeOnClickModal:false,
                        closeOnPressEscape:false,
                    }).then(({ value }) => {
                        if (value.length>15){
                            this.msgTip('输入内容限制15字以内')
                            return
                        }

                        let data = {
                            self_id: parseInt(LocalStorage.get('self_id')),
                            sess: LocalStorage.get('sess'),
                            idempotent: new Date().getTime(),
                            id:row.Id,
                            state: 1,
                            remark:value,
                            operator:LocalStorage.get('user_name')
                        };
                        this.Submission_post(row,data)
                    })
                }else{
                    let data = {
                        id:row.Id,
                        state: 0,
                    };
                    this.Submission_post(row,data)
                }
            },

            Withdraw_post(row,data) {
                this.$http.post(`${this.url}/server/withdraw_state`,qs.stringify(data)).then((resp)=> {
                    if (resp.code === 0) {
                        //row.State = !data.state
                        this.getList()
                        this.$message({
                            message:'Ok',
                            type:'success',
                            center:true
                        })
                    } else {
                        row.WithdrawState = !!data.state
                        this.msgTip(resp.message)
                    }
                }).catch((error) => {
                    row.WithdrawState = !!data.state
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })
            },

            changeWithdrawState (row) {

                if (!row.WithdrawState) {
                    row.WithdrawState = !row.WithdrawState
                    this.$prompt('请输入备注', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        inputPattern: /\S/,
                        inputErrorMessage: '备注不能为空',
                        closeOnClickModal:false,
                        closeOnPressEscape:false,
                    }).then(({ value }) => {
                        if (value.length>15){
                            this.msgTip('输入内容限制15字以内')
                            return
                        }

                        let data = {
                            self_id: parseInt(LocalStorage.get('self_id')),
                            sess: LocalStorage.get('sess'),
                            idempotent: new Date().getTime(),
                            id:row.Id,
                            state: 1,
                            remark:value,
                            operator:LocalStorage.get('user_name')
                        };
                        this.Withdraw_post(row,data)
                    })
                }else{
                    let data = {
                        id:row.Id,
                        state: 0,
                    };
                    this.Withdraw_post(row,data)
                }
            },


            checkTime() {

                if(this.listQuery.value1 && this.listQuery.value2 && this.listQuery.value1 > this.listQuery.value2) {
                    this.msgTip('开始日期不能大于结束日期')
                    return false
                }
                return true
            },

            getList(obj) {
                if(this.checkTime()) {

                    if (obj!==undefined && obj.flag !== undefined) {
                        this.listQuery.page =1
                    }

                    let data = {
                        self_id: parseInt(LocalStorage.get('self_id')),
                        sess: LocalStorage.get('sess'),
                        idempotent: new Date().getTime(),
                        state : this.listQuery.state!==''?this.listQuery.state:undefined,
                        pos: (this.listQuery.page - 1)*this.listQuery.limit,
                        offset: this.listQuery.limit,
                        beg_create_time:this.listQuery.value1?parseInt(this.listQuery.value1/1000):undefined,
                        end_create_time:this.listQuery.value2?parseInt(this.listQuery.value2/1000+24*60*60-1):undefined
                    };

                    if (this.listQuery.id !== undefined && this.listQuery.id.length === 24) {
                        data.phone_num = undefined
                        data.mem_id = this.listQuery.id
                    } else{
                        data.phone_num = this.listQuery.id || undefined
                        data.mem_id = undefined
                    }

                    this.search_loading = true;
                    this.$http.post(`${this.url}/get_memlist`,qs.stringify(data)).then((resp)=>{

                        this.search_loading = false;
                        if (resp.ret_code === 0) {
                            if (resp.ret_data.data_list) {
                                let list = resp.ret_data.data_list
                                for (var i=0;i<list.length;i++) {
                                    let amount = String(list[i]['Amount']);
                                    list[i]['Amount'] =  this.count(amount)
                                    list[i]['State'] = list[i]['State'] === 0
                                    list[i]['WithdrawState'] = list[i]['WithdrawState'] === 0
                                    list[i]['SubmissionState'] = list[i]['SubmissionState'] === 0

                                    let a = list[i]['StateRemark'] === "" ? '' : '状态:'+list[i]['StateRemark']+'<br/>'
                                    let b = list[i]['SubmissionStateRemark'] === "" ? '' : '接单:'+list[i]['SubmissionStateRemark']+'<br/>'
                                    let c = list[i]['WithdrawStateRemark'] === "" ? '' : '提现:'+list[i]['WithdrawStateRemark']+'<br/>'
                                    if (a==='' && b==='' && c===''){
                                        list[i]['remark'] = '-'
                                    }else{
                                        list[i]['remark'] = `${a}${b}${c}`;
                                    }

                                }
                                this.member_list = list;
                                this.total = resp.ret_data.total_num
                            }else {
                                this.member_list = [];
                                this.total = 0
                            }
                        }else if(resp.ret_code === -1){
                            this.member_list = [];
                            this.total = 0
                        }else{
                            this.$message({
                                message:resp.ret_msg,
                                type:'error',
                                center:true
                            })
                        }
                    }).catch((error)=>{
                        this.search_loading = false;
                        if (error !== 'loginErr') {
                            console.log(error);
                            this.msgTip('系统繁忙，请稍后重试')
                        }
                    })
                }
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
            if(this.$route.params.mem_id) {
                this.listQuery.id = this.$route.params.mem_id
            }
            this.getList()
        }
    }

</script>



