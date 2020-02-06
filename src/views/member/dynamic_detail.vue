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

        <el-form >
          <el-form-item label="手机号:">
            {{num}}
          </el-form-item>
        </el-form>

        <timeselect @getTimeResult="get_time_result" @getTime="get_time"/>

        <div style="margin-top:10px">
          <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter" :loading="search_loading" >
            搜索
          </el-button>
        </div>

      </div>

      <el-table
        border fit highlight-current-row style="width: 100%;"
        :data="change_list"
        row-id="id"
        :default-sort = "{prop: 'create_time', order: 'descending'}"
      >

        <el-table-column
          min-width="18%"
          align="center"
          prop="desc"
          label="id"
        >
          <template slot-scope="{row}">
            {{row.id}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="amount"
          label="金额(元)"
        >
          <template slot-scope="{row}">
              <span v-if="row.amount>0" style="color: green">
                {{row.amount|formatMoney}}
              </span>
            <span v-else style="color: red">
                {{'-'}}{{row.amount.replace('-','')|formatMoney}}
              </span>

          </template>
        </el-table-column>


        <el-table-column
          min-width="18%"
          align="center"
          prop="desc"
          label="备注"
        >
          <template slot-scope="{row}">
            {{row.desc}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="create_time"
          label="时间"
        >
          <template slot-scope="{row}">
            {{row.create_time|formatDate}}
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
    import {formatMoney} from '@/utils/money'
    import {formatDate} from '@/utils/date'
    import qs from 'qs'
    import Timeselect from '@/components/Timeselect'

    export default {
        components: { Pagination,Timeselect},
        data() {
            return {
                button:['','','','','','',''],
                change_list:[],
                search_loading:false,
                listQuery: {
                    page: 1,
                    limit: 10,
                    value1:'',
                    value2:'',
                },
                total:0,
                id:undefined,
                num:LocalStorage.get('phone')
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

            checkTime() {

                if(this.listQuery.value1 && this.listQuery.value2 && this.listQuery.value1 > this.listQuery.value2) {
                    this.msgTip('开始日期不能大于结束日期')
                    return false
                }
                return true
            },

            getList(obj) {

                if (this.checkTime()) {
                    if (obj!==undefined && obj.flag !== undefined) {
                        this.listQuery.page =1
                    }

                    if (this.id === undefined || this.id === '') {
                        this.msgTip('id无效');
                        this.change_list = [];
                        this.total = 0;
                        return;
                    }

                    let data = {
                        self_id: LocalStorage.get('self_id'),
                        idempotent: new Date().getTime(),
                        sess: LocalStorage.get('sess'),
                        mem_id: this.id,
                        pos: (this.listQuery.page - 1)*this.listQuery.limit,
                        offset: this.listQuery.limit,
                        beg_create_time:this.listQuery.value1?parseInt(this.listQuery.value1/1000):undefined,
                        end_create_time:this.listQuery.value2?parseInt(this.listQuery.value2/1000+24*60*60-1):undefined
                    };

                    this.search_loading = true
                    this.$http.post(`${this.url}/get_mem_econo_change`,qs.stringify(data)).then((resp) => {
                        this.search_loading = false
                        if (resp.ret_code === 0) {
                            if (resp.ret_data.data_list) {
                                let list = resp.ret_data.data_list
                                for (var i=0;i<list.length;i++) {
                                    let amount = String(list[i]['amount']);
                                    list[i]['amount'] =  this.count(amount)
                                }
                                this.change_list = list
                                this.total = resp.ret_data.total_num
                            }else{
                                this.change_list = []
                                this.total = 0
                            }
                        } else if(resp.ret_code === -1) {
                            this.change_list = []
                            this.total = 0
                        } else {
                            this.msgTip(resp.ret_msg)
                        }
                    }).catch((error)=>{
                        this.search_loading = false
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

            msgTip(name) {
                this.$message({
                    message:name,
                    type:'error',
                    center:true
                })
            },
        },

        created() {
            this.id = this.$route.query.id
            this.getList()
        }
    }

</script>


<style scoped>
  /deep/ .el-form-item{
    margin-bottom: 0;
  }
</style>
