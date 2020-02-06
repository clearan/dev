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
          <el-input v-model="listQuery.id" clearable placeholder="订单号/会员账号" style="width: 250px;" class="filter-item" @keyup.enter.native="handleFilter" />
          <el-select v-model="listQuery.state" placeholder="状态" clearable style="width: 90px;margin-left: 20px" class="filter-item">
            <el-option v-for="item in states" :key="item.state" :label="item.name" :value="item.state" />
          </el-select>
          <el-button v-waves class="filter-item" type="primary" style="margin-left: 20px" icon="el-icon-search" @click="handleFilter" :loading="search_loading" >
            搜索
          </el-button>
        </div>

      </div>

      <el-table
        border fit highlight-current-row style="width: 100%;"
        :data="withdraw_list"
        row-key="id"
        :default-sort = "{prop: 'create_time', order: 'descending'}"
      >

        <el-table-column
          min-width="18%"
          align="center"
          prop="id"
          label="订单号"
        >
          <template slot-scope="{row}">
<!--            <el-link  type="primary" @click="showDetail(row)">-->
              {{ row.id }}
<!--            </el-link>-->
          </template>

        </el-table-column>

        <el-table-column
          min-width="13%"
          align="center"
          prop="phone_num"
          label="会员账号"
        >
          <template slot-scope="{row}">
            {{row.phone_num}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="econo"
          label="银行信息"
        >

          <template slot-scope="{row}">
            <div v-html="row.econo"></div>
          </template>
        </el-table-column>

        <el-table-column
          min-width="12%"
          align="center"
          prop="econo_owner"
          label="绑定人"
        >

          <template slot-scope="{row}">
            <div v-html="row.econo_owner"></div>
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="amount"
          label="提现金额(元)"
        >
          <template slot-scope="{row}">
            {{row.amount | formatMoney}}
          </template>
        </el-table-column>


        <el-table-column
          min-width="18%"
          align="center"
          prop="create_time"
          label="提交时间"
        >
          <template slot-scope="{row}">
            {{row.create_time |formatDate }}
          </template>
        </el-table-column>

        <el-table-column
          min-width="10%"
          align="center"
          prop="state"
          label="审核状态"
        >
          <template slot-scope="{row}">
            <el-tag v-if="row.state === 1" type="success" size="medium">已出款</el-tag>
            <el-tag v-else-if="row.state === -1" type="info" size="medium">待确认</el-tag>
            <el-tag v-else-if="row.state === 0" type="warning" size="medium">处理中</el-tag>
            <el-tag v-else-if="row.state === 2" type="danger" size="medium">已驳回</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          min-width="12%"
          align="center"
          prop="remark"
          label="备注"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="{row}">
            <span v-if="row.state === 2">{{row.remark}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="12%"
          align="center"
          prop="approver"
          label="审核人"
        >
          <template slot-scope="{row}">
            <span v-if="row.state === -1">-</span>
            <span v-else>{{row.approver}}</span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          label="操作"
        >
          <template slot-scope="{row}">
            <div v-if="row.state === -1">
              <div v-if="row.edit">
                <el-button
                  type="success"
                  size="small"
                  @click="checkSubmit(row,1)">
                  已打款
                </el-button>

                <el-button
                  type="danger"
                  size="small"
                  @click="checkSubmit(row,2)"
                >
                  驳回
                </el-button>

              </div>
              <div v-else>
                <el-button
                  type="primary"
                  size="small"
                  @click="lock(row)">
                  锁定
                </el-button>
              </div>
            </div>

            <div v-else-if="row.state === 0">
              <div v-if="user_name === row.approver">
                <el-button
                  type="success"
                  size="small"
                  @click="checkSubmit(row,1)">
                  已打款
                </el-button>

                <el-button
                  type="danger"
                  size="small"
                  @click="checkSubmit(row,2)"
                >
                  驳回
                </el-button>
              </div>
              <div v-else>-</div>
            </div>

            <div v-else>
              -
            </div>

          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="dialogVisible" title="提现详情" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form :model="detail" label-width="80px" label-position="left">
          <el-form-item label="会员账号">
            <el-input v-model="detail.phone_num"  readonly/>
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="detail.remark"
              :autosize="{ minRows: 2, maxRows: 4}"
              type="textarea"
              readonly
            />
          </el-form-item>
        </el-form>
      </el-dialog>

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
        components: { Pagination,Timeselect },
        data() {
            return {
                button:['','','','','','',''],
                user_name:LocalStorage.get('user_name'),
                search_loading:false,
                withdraw_list:[],
                listQuery: {
                    page: 1,
                    limit: 10,
                    id: undefined,
                    value1:'',
                    value2:'',
                    state:undefined
                },
                states : [
                    {state:-1,name:'待确认'},
                    {state:0,name:'处理中'},
                    {state:1,name:'已出款'},
                    {state:2,name:'已驳回'},
                ],
                total:0,
                begin_time:'',
                end_time:'',
                dialogVisible: false,
                detail:{
                    phone_num:'',
                    remark:''
                }
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

            lock(row){

                let data = {
                    self_id: parseInt(LocalStorage.get('self_id')),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    state:0,
                    id: row.id,
                    approver:LocalStorage.get('user_name')
                };

                this.$http.post(`${this.url}/app_mem_cashin`,qs.stringify(data)).then((resp)=>{

                    if(resp.ret_code >= 0){
                        row.edit = true
                        this.getList();
                        this.$message({
                            message:'锁定成功',
                            type:'success',
                            center:true
                        });
                    }else{
                        row.edit = false
                        this.msgTip(resp.ret_msg)
                    }
                }).catch((error)=>{
                    row.edit = false
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })
            },


            handleFilter() {
                this.listQuery.page = 1;
                this.getList()
            },

            checkTime() {

                if(this.listQuery.value1 && this.listQuery.value2 && this.listQuery.value1 > this.listQuery.value2) {
                    this.msgTip('开始日期不能大于结束日期');
                    return false
                }
                return true
            },

            showDetail(row) {
                this.detail.phone_num = row.phone_num;
                this.detail.remark = row.remark;
                this.dialogVisible = true
            },

            getList(obj) {

                if (this.checkTime()) {

                    if (obj!==undefined && obj.flag !== undefined) {
                        this.listQuery.page =1
                    }

                    let data = {
                        self_id: parseInt(LocalStorage.get('self_id')),
                        sess: LocalStorage.get('sess'),
                        idempotent: new Date().getTime(),
                        pos: (this.listQuery.page - 1)*this.listQuery.limit,
                        offset: this.listQuery.limit,
                        state : this.listQuery.state!==''?this.listQuery.state:undefined,
                        beg_create_time:this.listQuery.value1?parseInt(this.listQuery.value1/1000):undefined,
                        end_create_time:this.listQuery.value2?parseInt(this.listQuery.value2/1000+24*60*60-1):undefined
                    };

                    if (this.listQuery.id !== undefined && this.listQuery.id.length === 24) {
                        data.phone_num = undefined
                        data.id = this.listQuery.id
                    } else{
                        data.phone_num = this.listQuery.id || undefined
                        data.id = undefined
                    }

                    this.search_loading = true;
                    this.$http.post(`${this.url}/get_app_mem_cashin`,qs.stringify(data)).then((resp)=>{

                        this.search_loading = false;
                        if (resp.ret_code === 0) {
                            if (resp.ret_data.data_list) {
                                let list = resp.ret_data.data_list
                                for (var i=0;i<list.length;i++) {
                                    let amount = String(list[i]['amount']);
                                    list[i]['econo'] =  `<span>${list[i]['econo_account']}</span><br/>${list[i]['econo_name']}`;
                                    list[i]['amount'] =  this.count(amount)
                                    list[i]['edit'] =  false
                                }
                                this.withdraw_list = list;
                                this.total = resp.ret_data.total_num
                                // console.log(this.withdraw_list)
                            }else {
                                this.withdraw_list = [];
                                this.total = 0
                            }
                        }else if(resp.ret_code === -1){
                            this.withdraw_list = [];
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

            count (val) {
                if (val.length === 1) {
                    val = '0.0'+val
                }else if (val.length === 2) {
                    val = '0.'+val
                }else{
                    return val.slice(0, -2) + "." + val.slice(val.length - 2)
                }
                return val
            },

            checkSubmit(row,val) {

                if (val === 1) {
                    this.$confirm('是否确认已出款？','提示',{
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        closeOnClickModal:false,
                        closeOnPressEscape:false,
                        type: 'warning'
                    }).then(()=>{
                        let data = {
                            self_id: parseInt(LocalStorage.get('self_id')),
                            sess: LocalStorage.get('sess'),
                            idempotent: new Date().getTime(),
                            state:val,
                            id: row.id,
                            approver:LocalStorage.get('user_name')
                        };

                        this.$http.post(`${this.url}/app_mem_cashin`,qs.stringify(data)).then((resp)=>{

                            if(resp.ret_code >= 0){
                                this.getList();
                                this.$message({
                                    message:'审核成功',
                                    type:'success',
                                    center:true
                                });
                            }else{
                                this.msgTip(resp.ret_msg)
                            }
                        }).catch((error)=>{
                            if (error !== 'loginErr') {
                                console.log(error);
                                this.msgTip('系统繁忙，请稍后重试')
                            }
                        })
                    }).catch(()=>{
                        this.$message({
                            type: 'info',
                            message: '已取消审核'
                        });
                    })
                } else {
                    this.$prompt('请输入理由', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        inputPattern: /\S/,
                        inputErrorMessage: '驳回理由不能为空',
                        closeOnClickModal:false,
                        closeOnPressEscape:false,
                    }).then(({ value }) => {
                        if (value.length>200){
                            this.msgTip('输入内容限制200字以内')
                            return
                        }
                        let data = {
                            self_id: parseInt(LocalStorage.get('self_id')),
                            sess: LocalStorage.get('sess'),
                            idempotent: new Date().getTime(),
                            state:val,
                            id: row.id,
                            remark:value,
                            approver:LocalStorage.get('user_name'),
                        }
                        this.$http.post(`${this.url}/app_mem_cashin`,qs.stringify(data)).then((resp)=>{

                            if (resp.ret_code >= 0){
                                this.getList();
                                this.$message({
                                    message:'驳回成功',
                                    type:'success',
                                    center:true
                                })
                            }else{
                                this.msgTip(resp.ret_msg)
                            }
                        }).catch((error)=>{
                            if (error !== 'loginErr') {
                                console.log(error);
                                this.msgTip('系统繁忙，请稍后重试')
                            }
                        })
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '取消驳回'
                        });
                    });
                }


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
            this.getList()
        }
    }

</script>



