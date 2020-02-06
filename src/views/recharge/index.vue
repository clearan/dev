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
          <el-input v-model="listQuery.id" clearable placeholder="订单号/手机号" style="width: 250px;" class="filter-item" @keyup.enter.native="handleFilter" />
          <el-select v-model="listQuery.state" placeholder="状态" clearable style="width: 90px;margin-left: 20px" class="filter-item">
            <el-option v-for="item in states" :key="item.state" :label="item.name" :value="item.state" />
          </el-select>
          <el-button v-waves class="filter-item" type="primary" style="margin-left: 20px" icon="el-icon-search" @click="handleFilter" :loading="search_loading">
            搜索
          </el-button>
        </div>

      </div>

      <el-table
        border fit highlight-current-row style="width: 100%;"
        :data="recharge_list"
        row-key="id"
        :default-sort = "{prop: 'create_time', order: 'descending'}"
      >

        <el-table-column
          min-width="20%"
          align="center"
          prop="id"
          label="订单号"
        >
          <template slot-scope="{row}">
<!--            <el-link  type="primary" @click="showDetail(row)">-->
<!--              {{ row.id }}-->
<!--            </el-link>-->
            {{ row.id }}
          </template>

        </el-table-column>

        <el-table-column
          min-width="15%"
          align="center"
          prop="mch_phone_num"
          label="商户号"
        >
          <template slot-scope="{row}">
            {{row.mch_phone_num}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="amount"
          label="银行信息"
        >

          <template slot-scope="{row}">
            <div v-html="row.econo"></div>
          </template>
        </el-table-column>

        <el-table-column
          min-width="16%"
          align="center"
          prop="amount"
          label="充值金额(元)"
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
          min-width="15%"
          align="center"
          prop="approver"
          label="审核人"
        >
          <template slot-scope="{row}">
            <span v-if="row.approve_time===0">-</span>
            <span v-else>{{row.approver}}</span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="approve_time"
          label="审核时间"
        >
          <template slot-scope="{row}">

            <span v-if="row.approve_time===0">-</span>
            <span v-else>{{row.approve_time |formatDate }}</span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="10%"
          align="center"
          prop="state"
          label="审核状态"
        >
          <template slot-scope="{row}">
            <el-tag v-if="row.state === 1" type="success" size="medium">已查收</el-tag>
            <el-tag v-else-if="row.state === 0" type="info" size="medium">待确认</el-tag>
            <el-tag v-else type="danger" size="medium">未查收</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          min-width="16%"
          align="center"
          prop="remark"
          label="备注"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="{row}">
            {{row.remark}}
            <!--            <el-popover-->
            <!--              placement="top-start"-->
            <!--              title="标题"-->
            <!--              width="200"-->
            <!--              trigger="hover"-->
            <!--              content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。">-->
            <!--              <el-button slot="reference">hover 激活</el-button>-->
            <!--            </el-popover>-->

          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          label="操作"
        >
          <template slot-scope="{row}">
            <div v-if="row.state === 0">
              <el-button
                type="success"
                size="small"
                @click="checkSubmit(row,1)">
                已查收
              </el-button>

              <el-button
                type="danger"
                size="small"
                @click="checkSubmit(row,2)"
              >
                未查收
              </el-button>
            </div>
            <div v-else>
              -
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="dialogVisible" title="订单详情" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form :model="detail" label-width="80px" label-position="left">
          <el-form-item label="商户号">
            <el-input v-model="detail.mch_phone_num"  readonly/>
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
                search_loading:false,
                recharge_list:[],
                listQuery: {
                    page: 1,
                    limit: 10,
                    id: undefined,
                    value1:'',
                    value2:'',
                    state:undefined
                },
                states : [
                    {state:0,name:'待确认'},
                    {state:1,name:'已查收'},
                    {state:2,name:'未查收'},
                ],
                total:0,
                begin_time:'',
                end_time:'',
                dialogVisible: false,
                detail:{
                    mch_phone_num:'',
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
              this.detail.mch_phone_num = row.mch_phone_num;
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
                  this.$http.post(`${this.url}/get_recharge`,qs.stringify(data)).then((resp)=>{
                      this.search_loading = false;
                      if (resp.ret_code === 0) {
                          if (resp.ret_data.data_list) {
                              let list = resp.ret_data.data_list
                              for (var i=0;i<list.length;i++) {
                                  let amount = String(list[i]['amount']);
                                  list[i]['econo'] =  `<span>${list[i]['econo_account']}</span><br/>${list[i]['econo_name']}`;
                                  //list[i]['amount'] =  amount.slice(0, -2) + "." + amount.slice(amount.length - 2)
                                  list[i]['amount'] =  this.count(amount)
                              }
                              this.recharge_list = list;
                              this.total = resp.ret_data.total_num
                          }else {
                              this.recharge_list = [];
                              this.total = 0
                          }
                      }else if(resp.ret_code === -1){
                          this.recharge_list = [];
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

              if(val ===1) {
                  this.$prompt('请输入实收金额', '提示', {
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      inputPattern: /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,2})?$/,
                      inputErrorMessage: '金额格式错误',
                      closeOnClickModal:false,
                      closeOnPressEscape:false,
                      inputPlaceholder:'请输入以元为单位的金额'
                  }).then(({ value }) => {
                      if (value === '' || value === undefined || value === null) {
                          this.msgTip('金额不能为空')
                          return
                      }
                      if (value > 20000000) {
                          this.msgTip('超出限额')
                          return
                      }
                      let data = {
                          self_id: parseInt(LocalStorage.get('self_id')),
                          sess: LocalStorage.get('sess'),
                          idempotent: new Date().getTime(),
                          state:val,
                          id: row.id,
                          approver: LocalStorage.get('user_name'),
                          amount:value*100
                      };
                      this.$http.post(`${this.url}/approve_recharge`,qs.stringify(data)).then((resp)=>{

                          if(resp.ret_code >= 0){
                              this.getList();
                              this.$message({
                                  message:'OK',
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
                  }).catch(() => {
                      this.$message({
                          type: 'info',
                          message: '取消审核'
                      });
                  });
              }

              if (val === 2) {
                  this.$confirm('是否确认未查收？','提示',{
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
                          approver: LocalStorage.get('user_name')
                      };
                      this.$http.post(`${this.url}/approve_recharge`,qs.stringify(data)).then((resp)=>{

                          if(resp.ret_code >= 0){
                              this.getList();
                              this.$message({
                                  message:'OK',
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



