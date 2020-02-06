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
          <el-select v-model="listQuery.state" placeholder="状态" clearable style="width: 125px;margin-left: 20px" class="filter-item">
            <el-option v-for="item in states" :key="item.state" :label="item.name" :value="item.state" />
          </el-select>
          <el-button v-waves class="filter-item" type="primary" style="margin-left: 20px" icon="el-icon-search" @click="handleFilter" :loading="search_loading" >
            搜索
          </el-button>
        </div>

      </div>

      <el-table
        border fit highlight-current-row style="width: 100%;"
        :data="service_list"
        row-key="id"
        :default-sort = "{prop: 'create_time', order: 'descending'}"
      >

        <el-table-column
          min-width="22%"
          align="center"
          prop="id"
          label="订单号"
        >
          <template slot-scope="{row}">
            <el-link type="primary" @click="showDetail(row)">
              {{ row.id }}
            </el-link>
          </template>

        </el-table-column>

        <el-table-column
          min-width="13%"
          align="center"
          prop="mch_phone_num"
          label="商户号"
        >
          <template slot-scope="{row}">
            {{row.mch_phone_num}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="12%"
          align="center"
          prop="new_amount"
          label="订单金额(元)"
        >
          <template slot-scope="{row}">
            {{row.new_amount | formatMoney}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="13%"
          align="center"
          prop="pay_amount"
          label="实际金额(元)"
        >
          <template slot-scope="{row}">
            {{row.pay_amount | formatMoney}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="12%"
          align="center"
          prop="target_num"
          label="任务数"
        >
          <template slot-scope="{row}">
            {{row.target_num}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="12%"
          align="center"
          prop="successful"
          label="成功数"
        >
          <template slot-scope="{row}">
            {{row.successful}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="10%"
          align="center"
          prop="failure"
          label="失败数"
        >
          <template slot-scope="{row}">
            {{row.failure}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="10%"
          align="center"
          prop="unsend"
          label="未发送数"
        >
          <template slot-scope="{row}">
            {{row.target_num-row.successful-row.failure}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="create_time"
          label="提交时间"
        >
          <template slot-scope="{row}">
            <span @click="addWhite(row)">{{row.create_time |formatDate }} </span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="12%"
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
            <el-tag v-if="row.state===-1" type="warning" size="medium">系统处理中</el-tag>
            <el-tag v-else-if="row.state===0" type="info" size="medium">待审核</el-tag>
            <el-tag v-else-if="row.state===1" type="success" size="medium">已通过</el-tag>
            <el-tag v-else-if="row.state===2" type="danger" size="medium">已拒绝</el-tag>
            <el-tag v-else-if="row.state===3" type="primary" size="medium">已结算</el-tag>
            <el-tag v-else type="danger" size="medium">已过期</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          min-width="15%"
          align="center"
          prop="flag"
          label="结算状态"
        >
          <template slot-scope="{row}">
            <el-switch
              v-model="row.flag"
              @change="changeState(row)"
            >
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column
          min-width="17%"
          align="center"
          label="操作"
        >
          <template slot-scope="{row}">
            <div v-if="row.state === 0">
              <el-button
                type="success"
                size="small"
                @click="checkSubmit(row,1)">
                通过
              </el-button>

              <el-button
                type="danger"
                size="small"
                @click="checkSubmit(row,2)"
              >
                拒绝
              </el-button>
            </div>
            <div v-else>
              -
            </div>

          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="dialogVisible" title="白名单配置" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form :model=white label-width="80px" label-position="left">
          <el-form-item label="ip白名单">
            <el-input
              type="textarea"
              :rows="4"
              placeholder="请输入ip地址"
              v-model="white.textarea">
            </el-input>
          </el-form-item>
          <el-form-item>
            <div style="text-align:right;">
              <el-button type="danger" @click="dialogVisible=false">取消</el-button>
              <el-button type="primary" @click="submitAdd">确定</el-button>
            </div>
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
      components: { Pagination,Timeselect},
      data() {
          return {
              button:['','','','','','',''],
              loading: true,
              search_loading:false,
              service_list:[],
              listQuery: {
                  page: 1,
                  limit: 10,
                  id: undefined,
                  value1:'',
                  value2:'',
                  state:undefined
              },
              states : [
                  {state:-1,name:'系统处理中'},
                  {state:0,name:'待审核'},
                  {state:1,name:'已通过'},
                  {state:2,name:'已拒绝'},
                  {state:3,name:'已结算'},
                  {state:4,name:'已过期'},
              ],
              total:0,
              list:[],
              dialogVisible:false,
              white:{
                  textarea:'',
                  id:''
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

          addWhite(row) {
              console.log(row)
              this.dialogVisible = true
              this.white.textarea = row.white_list === null ?'': row.white_list.join(';')
              this.white.id = row.id
          },

          submitAdd() {
              let data = {
                  self_id: parseInt(LocalStorage.get('self_id')),
                  sess: LocalStorage.get('sess'),
                  idempotent: new Date().getTime(),
                  id:this.white.id,
                  white_list:this.white.textarea.replace(/\s/g,'')
              }

              this.$http.post(`${this.url}/server/submission_white_list`,qs.stringify(data)).then((resp)=>{
                  if (resp.code === 0) {
                      this.$message({
                          message:'白名单更新成功',
                          type:'success',
                          center:true
                      })
                      this.getList()
                      this.dialogVisible = false
                  } else {
                      this.msgTip(resp.message)
                  }
              }).catch((error)=>{
                  if (error !== 'loginErr') {
                      console.log(error);
                      this.msgTip('系统繁忙,请稍后重试')
                  }
              })
          },

          changeState (row) {
              let data = {
                  self_id: LocalStorage.get('self_id'),
                  sess: LocalStorage.get('sess'),
                  idempotent: new Date().getTime(),
                  id:row.id,
                  state: row.flag ? 0 : 1,
              };
              this.$http.post(`${this.url}/server/set_mission_state`,qs.stringify(data)).then((resp)=> {
                  if (resp.code === 0) {
                      this.$message({
                          message:'OK',
                          type:'success',
                          center:true
                      })
                  } else {
                      row.flag = !row.flag
                      this.msgTip(resp.msg)
                  }
              }).catch((error) => {
                  row.flag = !row.flag
                  if (error !== 'loginErr') {
                      console.log(error);
                      this.msgTip('系统繁忙，请稍后重试')
                  }
              })
          },

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
              this.listQuery.page = 1
              this.getList()
          },

          checkTime() {

              if(this.listQuery.value1 && this.listQuery.value2 && this.listQuery.value1 > this.listQuery.value2) {
                  this.msgTip('开始日期不能大于结束日期')
                  return false
              }
              return true
          },

          showDetail(row) {
              this.$router.push({path: '/service/mission_detail', query: {id: row.id}})
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
                      pos: (this.listQuery.page - 1)*this.listQuery.limit,
                      offset: this.listQuery.limit,
                      state : this.listQuery.state!==''?this.listQuery.state:undefined,
                      beg_create_time:this.listQuery.value1?parseInt(this.listQuery.value1/1000):undefined,
                      end_create_time:this.listQuery.value2?parseInt(this.listQuery.value2/1000+24*60*60-1):undefined
                  }

                  if (this.listQuery.id !== undefined && this.listQuery.id.length === 24) {
                      data.phone_num = undefined
                      data.id = this.listQuery.id
                  } else{
                      data.phone_num = this.listQuery.id || undefined
                      data.id = undefined
                  }

                  this.search_loading = true
                  this.$http.post(`${this.url}/get_mission`,qs.stringify(data)).then((resp)=>{
                      this.search_loading = false
                      if (resp.ret_code === 0) {
                          if (resp.ret_data.data_list) {
                              let list = resp.ret_data.data_list
                              for (var i=0;i<list.length;i++) {
                                  let amount = String(list[i]['amount'])
                                  let available = String(list[i]['available_balance'])
                                  let pay_amount = String(list[i]['pay_amount'])
                                  list[i]['new_amount'] =  this.count(amount)
                                  list[i]['available'] =  this.count(available)
                                  list[i]['pay_amount'] =  this.count(pay_amount)
                                  list[i]['flag'] =  list[i]['flag'] === 0
                              }
                              this.service_list = list
                              this.total = resp.ret_data.total_num
                          }else{
                              this.service_list = []
                              this.total = 0
                          }

                      }else if(resp.ret_code === -1) {
                          this.service_list = []
                          this.total = 0
                      }else{
                          this.$message({
                              message:resp.ret_msg,
                              type:'error',
                              center:true
                          })
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
              } else if (val.length === 2) {
                  val = '0.'+val
              } else{
                  return val.slice(0, -2) + "." + val.slice(val.length - 2)
              }
              return val
          },

          checkSubmit(row,val) {

              if (val === 1) {
                  const h = this.$createElement;
                  let content = []
                  //if (row.available_balance < row.amount) {
                  //     content = [
                  //         h('p', null, `订单金额 : ${formatMoney(row.new_amount)}元`),
                  //         h('p', null, `可用余额 : ${formatMoney(row.available)}元`),
                  //         h('p', { style: 'color: red' }, '商户余额不足 ! 是否立即审核 ?'),
                  //     ]
                  // } else {
                      content = [
                          h('p', null, `订单金额 : ${formatMoney(row.new_amount)}元`),
                          h('p', null, `可用余额 : ${formatMoney(row.available)}元`),
                          h('p', null, '是否立即审核?'),
                      ]
                  //}
                  this.$msgbox({
                      title: '温馨提示',
                      message: h('p', null, content),
                      showCancelButton: true,
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      closeOnClickModal:false,
                      closeOnPressEscape:false,
                      beforeClose: (action, instance,done) => {
                          if (action === 'confirm') {
                              instance.confirmButtonLoading = true;
                              instance.confirmButtonText = '审核中...';
                                  let data = {
                                      self_id: parseInt(LocalStorage.get('self_id')),
                                      sess: LocalStorage.get('sess'),
                                      idempotent: new Date().getTime(),
                                      state:val,
                                      id: row.id,
                                      approver: LocalStorage.get('user_name')
                                  }
                                  this.$http.post(`${this.url}/approve_mission`,qs.stringify(data)).then((resp) => {

                                      done()
                                      if (resp.ret_code >= 0){
                                          instance.confirmButtonLoading = false;
                                          this.getList();
                                          this.$message({
                                              message:'审核成功',
                                              type:'success',
                                              center:true
                                          })
                                      } else{
                                          this.msgTip(resp.ret_msg)
                                      }
                                  }).catch((error)=>{
                                      done()
                                      if (error !== 'loginErr') {
                                          console.log(error);
                                          this.msgTip('系统繁忙，请稍后重试')
                                      }
                                  })
                          } else {
                              done();
                          }
                      }
                  })
              }

              if (val ===2) {
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
                          error:value,
                          id: row.id,
                          approver: LocalStorage.get('user_name')
                      }
                      this.$http.post(`${this.url}/approve_mission`,qs.stringify(data)).then((resp)=>{

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




