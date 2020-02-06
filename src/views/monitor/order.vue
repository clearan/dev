<template>

  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;"
  >
    <div class="app-container">

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
                this.listQuery.page = 1;
                this.getList()
            },

            showDetail(row) {
                let date = new Date().getTime();
                LocalStorage.set("phone", row.Phone, date + 24*60*60*1000);
                this.$router.push({path: '/member/dynamic_detail', query: {id: row.Id}})
            },

            showSub(row) {
                let date = new Date().getTime();
                LocalStorage.set("phone", row.Phone, date + 24*60*60*1000);
                this.$router.push({path: '/member/sub_detail', query: {id: row.Uid}})
            },

            changeState (row) {
                let data = {
                    id:row.Id,
                    state: row.State ? 0 : 1,
                };
                this.$http.post('http://10.10.35.21:9091/server/ban',qs.stringify(data)).then((resp)=> {
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
                    state : 1
                };

                this.$http.post(`${this.url}/get_monitor_mems`,qs.stringify(data)).then((resp)=>{
                    this.loading = false
                    if (resp.ret_code === 0) {
                        if (resp.ret_data.mems) {
                            let list = resp.ret_data.mems
                            for( var i=0;i<list.length;i++) {
                                let amount = String(list[i]['Amount']);
                                list[i]['Amount'] =  this.count(amount)
                                list[i]['State'] = list[i]['State'] === 0
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



