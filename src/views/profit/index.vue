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
          <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter" :loading="search_loading" >
            搜索
          </el-button>
        </div>

      </div>

      <el-table
        border fit highlight-current-row style="width: 100%;"
        :data="profit_list"
        row-key="id"
        :default-sort = "{prop: 'create_time', order: 'descending'}"
      >

        <el-table-column
          min-width="18%"
          align="center"
          prop="id"
          label="编号"
        >
          <template slot-scope="{row}">
<!--            <router-link :to="'/profit/detail/'+row.id">-->
<!--              <el-link type="primary">-->
<!--                {{ row.id }}-->
<!--              </el-link>-->
<!--            </router-link>-->

              <el-link type="primary" @click="show_detail(row.id)">
                {{ row.id }}
              </el-link>

          </template>
        </el-table-column>



        <el-table-column
          min-width="15%"
          align="center"
          prop="mch_phone_num"
          label="任务总金额(元)"
        >
          <template slot-scope="{row}">
            {{row.total_amount}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="amount"
          label="任务佣金(元)"
        >

          <template slot-scope="{row}">
            {{row.total_commission}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="16%"
          align="center"
          prop="amount"
          label="推广佣金(元)"
        >
          <template slot-scope="{row}">
            {{row.total_recommission}}
          </template>
        </el-table-column>


        <el-table-column
          min-width="18%"
          align="center"
          prop="create_time"
          label="收益金额(元)"
        >
          <template slot-scope="{row}">
            {{row.profit_amount}}
          </template>
        </el-table-column>

<!--        <el-table-column-->
<!--          min-width="18%"-->
<!--          align="center"-->
<!--          prop="create_time"-->
<!--          label="成功数"-->
<!--        >-->
<!--          <template slot-scope="{row}">-->
<!--            {{row.successful}}-->
<!--          </template>-->
<!--        </el-table-column>-->

        <el-table-column
          min-width="20%"
          align="center"
          prop="id"
          label="结算时间"
        >
          <template slot-scope="{row}">
            {{ row.create_time| formatDate}}
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
                profit_list:[],
                listQuery: {
                    page: 1,
                    limit: 10,
                    id: undefined,
                    value1:'',
                    value2:'',
                },
                total:0,
                begin_time:'',
                end_time:''
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

            show_detail(val) {
                this.$router.push({path: '/profit/detail', query: {id: val}})
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
                        beg_create_time:this.listQuery.value1?parseInt(this.listQuery.value1/1000):undefined,
                        end_create_time:this.listQuery.value2?parseInt(this.listQuery.value2/1000+24*60*60-1):undefined,

                    };

                    this.search_loading = true;
                    this.$http.post(`${this.url}/get_profit_list`,qs.stringify(data)).then((resp)=>{
                        this.search_loading = false;
                        if (resp.ret_code === 0) {
                            if (resp.ret_data.data_list) {
                                let list = resp.ret_data.data_list
                                for (var i=0;i<list.length;i++) {
                                    list[i]['profit_amount'] =  this.count(String(list[i]['profit_amount']));
                                    list[i]['total_amount'] =  this.count(String(list[i]['total_amount']));
                                    list[i]['successful'] = list[i]['total_commission'] / 15
                                    list[i]['total_commission'] =  this.count(String(list[i]['total_commission']));
                                    list[i]['total_recommission'] =  this.count(String(list[i]['total_recommission']));
                                }
                                this.profit_list = list;
                                this.total = resp.ret_data.total_num
                            }else {
                                this.profit_list = [];
                                this.total = 0
                            }
                        }else if(resp.ret_code === -1){
                            this.profit_list = [];
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



