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
        :data="detail_list"
        row-key="mission_id"
        :default-sort = "{prop: 'create_time', order: 'descending'}"
      >

        <el-table-column
          min-width="18%"
          align="center"
          prop="mission_id"
          label="任务id"
        >
          <template slot-scope="{row}">

            <el-link type="primary" @click="show_detail(row)">
              {{ row.mission_id }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column
          min-width="15%"
          align="center"
          prop="mch_phone_num"
          label="商户手机号"
        >
          <template slot-scope="{row}">
            {{row.mch_phone_num}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="order_amount"
          label="订单金额(元)"
        >
          <template slot-scope="{row}">
            {{row.order_amount|formatMoney}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="16%"
          align="center"
          prop="pay_amount"
          label="消费金额(元)"
        >
          <template slot-scope="{row}">
            {{row.pay_amount|formatMoney}}
          </template>
        </el-table-column>


        <el-table-column
          min-width="18%"
          align="center"
          prop="commission"
          label="任务返佣(元)"
        >
          <template slot-scope="{row}">
            {{row.commission|formatMoney}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="20%"
          align="center"
          prop="recommission"
          label="推广返佣(元)"
        >
          <template slot-scope="{row}">
            {{ row.recommission|formatMoney}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="20%"
          align="center"
          prop="profit_amount"
          label="收益金额(元)"
        >
          <template slot-scope="{row}">
            {{ row.profit_amount|formatMoney}}
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
    import qs from 'qs'

    export default {
        name:'detail',
        components: { Pagination },
        data() {
            return {
                detail_list:[],
                listQuery: {
                    page: 1,
                    limit: 10
                },
                total:0,
                id:undefined
            }
        },

        filters:{

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

            show_detail(row) {
                this.$router.push({path: '/service/mission_detail', query: {id: row.mission_id}})
            },

            getList(obj) {

                if (obj!==undefined && obj.flag !== undefined) {
                    this.listQuery.page =1
                }

                if (this.id === undefined ||this.id === '') {
                    this.msgTip('id无效');
                    this.detail_list = [];
                    this.total = 0;
                    return;
                }

                let data = {
                    self_id: parseInt(LocalStorage.get('self_id')),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    pos: (this.listQuery.page - 1)*this.listQuery.limit,
                    offset: this.listQuery.limit,
                    id:this.id
                };

                this.$http.post(`${this.url}/get_profit_list`,qs.stringify(data)).then((resp)=>{

                    if (resp.ret_code === 0) {
                        if (resp.ret_data.data_list[0].details) {
                            let list = resp.ret_data.data_list[0].details
                            for (var i=0;i<list.length;i++) {
                                list[i]['order_amount'] =  this.count(String(list[i]['order_amount']));
                                list[i]['pay_amount'] =  this.count(String(list[i]['pay_amount']));
                                list[i]['commission'] =  this.count(String(list[i]['commission']));
                                list[i]['recommission'] =  this.count(String(list[i]['recommission']));
                                list[i]['profit_amount'] =  this.count(String(list[i]['profit_amount']));
                            }
                            this.detail_list = list;
                            this.total = list.length
                        }else {
                            this.detail_list = [];
                            this.total = 0
                        }
                    }else if(resp.ret_code === -1){
                        this.detail_list = [];
                        this.total = 0
                    }else{
                        this.$message({
                            message:resp.ret_msg,
                            type:'error',
                            center:true
                        })
                    }
                }).catch((error)=>{
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })

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



