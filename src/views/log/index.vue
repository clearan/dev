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

          <el-select v-model="listQuery.type" placeholder="类型" clearable style="width: 90px" class="filter-item">
            <el-option v-for="item in types" :key="item.type" :label="item.name" :value="item.type" />
          </el-select>

          <el-button v-waves class="filter-item" type="primary" style="margin-left: 20px;" icon="el-icon-search" @click="handleFilter" :loading="search_loading">
            搜索
          </el-button>
        </div>

        <el-upload
          class="upload-demo"
          action="http://10.10.35.146:8088/file/up.php"
          multiple
          :limit="1"
          name="fdata"
          >
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>

      </div>

      <el-table
        border fit highlight-current-row style="width: 100%;"
        :data="log_list"
        row-key="id"
        :default-sort = "{prop: 'create_time', order: 'descending'}"
      >

        <el-table-column
          min-width="18%"
          align="center"
          prop="mch_id"
          label="账号"
        >
          <template slot-scope="{row}">
            <el-link type="primary" @click="showDetail(row)">
              {{ row.mid }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="phone_num"
          label="手机号"
        >
          <template slot-scope="{row}">
            {{row.phone_num}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="15%"
          align="center"
          prop="balance"
          label="动账金额(元)"
        >
<!--          <template slot-scope="{row}">-->
<!--            {{row.balance|formatMoney}}-->
<!--          </template>-->
          <template slot-scope="{row}">
              <span v-if="row.balance>0" style="color: green">
                {{row.balance|formatMoney}}
              </span>
            <span v-else style="color: red">
                {{'-'}}{{row.balance.replace('-','')|formatMoney}}
              </span>

          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="type"
          label="类型"
        >
          <template slot-scope="{row}">
            <span v-if="row.type===1">
              会员
            </span>
            <span v-else>
              商户
            </span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="remark"
          label="备注"
        >
          <template slot-scope="{row}">
            {{row.remark}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="operator"
          label="操作人"
        >
          <template slot-scope="{row}">
            {{row.operator}}
          </template>
        </el-table-column>


        <el-table-column
          min-width="18%"
          align="center"
          prop="create_time"
          label="操作时间"
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
    import {formatDate} from '@/utils/date'
    import {formatMoney} from '@/utils/money'
    import qs from 'qs'
    import Timeselect from '@/components/Timeselect'

    export default {
        components: { Pagination ,Timeselect},
        data() {
            return {
                button:['','','','','','',''],
                types : [
                    {type:0,name:'商户'},
                    {type:1,name:'会员'},
                ],
                search_loading:false,
                log_list:[],
                listQuery: {
                    page: 1,
                    limit: 10,
                    id: undefined,
                    type: undefined,
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

            uploadFile(e) {
                console.log(e)
            },
            showDetail(row) {
                if (row.type === 1) {
                    this.$router.push({name: '/member/index', params: {mem_id: row.mid}})
                } else {
                    this.$router.push({name: '/merchant/index', params: {mch_id: row.mid}})
                }
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
                        type : this.listQuery.type!==''?this.listQuery.type:undefined,
                        pos: (this.listQuery.page - 1)*this.listQuery.limit,
                        offset: this.listQuery.limit,
                        beg_create_time:this.listQuery.value1?parseInt(this.listQuery.value1/1000):undefined,
                        end_create_time:this.listQuery.value2?parseInt(this.listQuery.value2/1000+24*60*60-1):undefined,
                    };

                    this.search_loading = true;
                    this.$http.post(`${this.url}/get_balance_change_list`,qs.stringify(data)).then((resp)=>{
                        this.search_loading = false;
                        if (resp.ret_code === 0) {
                            if (resp.ret_data.data_list) {
                                let list = resp.ret_data.data_list
                                for (var i=0;i<list.length;i++) {
                                    list[i]['balance'] =  this.count(String(list[i]['balance']));
                                }
                                this.log_list = list;
                                this.total = resp.ret_data.total_num
                            }else {
                                this.log_list = [];
                                this.total = 0
                            }
                        }else if(resp.ret_code === -1){
                            this.log_list = [];
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



