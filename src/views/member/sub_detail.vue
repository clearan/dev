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
          <el-form-item label="父级手机号:">
            {{num}}
          </el-form-item>
        </el-form>

        <el-input v-model="listQuery.id" clearable placeholder="手机号" style="width: 250px;" class="filter-item" @keyup.enter.native="handleFilter" />


        <el-button v-waves class="filter-item" style="margin-left: 20px;" type="primary" icon="el-icon-search" @click="handleFilter" :loading="search_loading">
          搜索
        </el-button>


      </div>

      <el-table
        border fit highlight-current-row style="width: 100%;"
        :data="sub_list"
        row-id="id"
        :default-sort = "{prop: 'create_time', order: 'descending'}"
      >

        <el-table-column
          min-width="18%"
          align="center"
          prop="Uid"
          label="Uid"
        >
          <template slot-scope="{row}">
            {{row.Uid}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="Phone"
          label="手机号"
        >
          <template slot-scope="{row}">
            {{row.Phone}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="Commission"
          label="任务佣金(元)"
        >
          <template slot-scope="{row}">
            {{row.Commission | formatMoney}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="CreatedTime"
          label="注册时间"
        >
          <template slot-scope="{row}">
            {{row.CreatedTime|formatDate}}
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

    export default {
        components: { Pagination },
        data() {
            return {
                sub_list:[],
                search_loading:false,
                listQuery: {
                    page: 1,
                    limit: 10,
                    id: undefined
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
            handleFilter() {
                this.listQuery.page = 1;
                this.getList()
            },


            getList(obj) {


                if (obj!==undefined && obj.flag !== undefined) {
                    this.listQuery.page =1
                }

                if (this.id === undefined || this.id === '') {
                    this.msgTip('id无效');
                    this.sub_list = [];
                    this.total = 0;
                    return;
                }

                let data = {
                    self_id: LocalStorage.get('self_id'),
                    idempotent: new Date().getTime(),
                    sess: LocalStorage.get('sess'),
                    pos: (this.listQuery.page - 1)*this.listQuery.limit,
                    offset: this.listQuery.limit,
                    agent_id:this.id,
                    phone_num:this.listQuery.id || undefined
                };

                this.search_loading = true
                this.$http.post(`${this.url}/get_memlist`,qs.stringify(data)).then((resp) => {
                    this.search_loading = false
                    if (resp.ret_code === 0) {
                        if (resp.ret_data.data_list) {
                            let list = resp.ret_data.data_list
                            for (var i=0;i<list.length;i++) {
                                let commission = String(list[i]['Commission']);
                                list[i]['Commission'] =  this.count(commission)
                            }
                            this.sub_list = list
                            this.total = resp.ret_data.total_num
                        }else{
                            this.sub_list = []
                            this.total = 0
                        }
                    } else if(resp.ret_code === -1) {
                        this.sub_list = []
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
