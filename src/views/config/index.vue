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
        <el-button v-waves  type="primary" icon="el-icon-plus" style="margin-bottom: 15px" @click="addEcono">
          新增
        </el-button>
      </div>

      <el-table
        border fit highlight-current-row style="width: 100%;"
        :data="econo_list"
        row-key="id"
      >

        <el-table-column
          min-width="25%"
          align="center"
          prop="mch_id"
          label="持卡人"
        >
          <template slot-scope="{row}">
            {{row.econo_owner}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="25%"
          align="center"
          prop="econo_name"
          label="开户行"
        >
          <template slot-scope="{row}">
            {{row.econo_name}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="25%"
          align="center"
          prop="id"
          label="银行账号"
        >
          <template slot-scope="{row}">
              {{ row.econo_account }}
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
              v-model="row.state"
              @change="changeState(row)"
            >
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          min-width="20%"
          align="center"
        >

          <template slot-scope="{row}">
            <el-button
              type="danger"
              size="small"
              @click="deleteRow(row)"
            >
              删除
            </el-button>
          </template>

        </el-table-column>

      </el-table>

      <el-dialog :visible.sync="dialogVisible" title="添加银行卡" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form :model="econo" label-width="80px" label-position="left">
          <el-form-item label="持卡人">
            <el-input v-model="econo.econo_owner" maxLength="20"/>
          </el-form-item>
          <el-form-item label="开户行">
            <el-input v-model="econo.econo_name" maxLength="20"/>
          </el-form-item>
          <el-form-item label="银行账号">
            <el-input v-model="econo.econo_account" maxLength="30"/>
          </el-form-item>
          <el-form-item>
            <div style="text-align:right;">
              <el-button type="danger" @click="dialogVisible=false">取消</el-button>
              <el-button type="primary" @click="submitAdd">确定</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-dialog>

    </div>
  </div>
</template>
<script>

  import {LocalStorage} from '@/utils/storage'
  import qs from 'qs'

  export default {
      data() {
          return {
              econo_list:[],
              econo:{
                  econo_owner:'',
                  econo_name:'',
                  econo_account:''
              },
              dialogVisible:false
          }
      },

      methods:{

          msgTip(name) {
              this.$message({
                  message:name,
                  type:'error',
                  center:true
              })
          },

          addEcono() {
              this.dialogVisible = true;
              this.econo.econo_owner = ''
              this.econo.econo_name = ''
              this.econo.econo_account = ''
          },

          deleteRow(row) {
              this.$confirm('此操作将彻底删除该银行卡信息，是否继续？','提示',{
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  closeOnClickModal:false,
                  closeOnPressEscape:false,
                  type: 'warning'
              }).then(()=>{
                  let data = {
                      self_id: LocalStorage.get('self_id'),
                      sess: LocalStorage.get('sess'),
                      idempotent: new Date().getTime(),
                      id: row.id
                  }

                  this.$http.post(`${this.url}/rmv_econo_account`,qs.stringify(data)).then((resp)=> {
                      if(resp.ret_code >= 0) {

                          const index = this.econo_list.indexOf(row)
                          this.econo_list.splice(index, 1)

                          this.$message({
                              message:'删除成功',
                              type:'success',
                              center:true
                          })
                      }else {
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
                      message: '已取消删除'
                  });
              })
          },

          changeState(row) {
              let data = {
                  self_id: LocalStorage.get('self_id'),
                  sess: LocalStorage.get('sess'),
                  idempotent: new Date().getTime(),
                  id:row.id,
                  state: row.state ? 1 : 0
              };
              this.$http.post(`${this.url}/mod_econo_account`,qs.stringify(data)).then((resp)=> {
                  if(resp.ret_code >= 0) {
                      this.$message({
                          message:resp.ret_msg,
                          type:'success',
                          center:true
                      })
                  }else {
                      row.state = !row.state
                      this.msgTip(resp.ret_msg)
                  }
              }).catch((error)=>{
                  row.state = !row.state
                  if (error !== 'loginErr') {
                      console.log(error);
                      this.msgTip('系统繁忙，请稍后重试')
                  }
              })
          },

          submitAdd() {
              if (this.econo.econo_owner.replace(/\s/g,"").length === 0) {
                  this.msgTip('持卡人不能为空')
                  return false
              }

              if (this.econo.econo_name.replace(/\s/g,"").length === 0) {
                  this.msgTip('开户行不能为空')
                  return false
              }

              if (this.econo.econo_account.replace(/\s/g,"").length === 0) {
                  this.msgTip('银行账户号不能为空')
                  return false
              }

              let data = {
                  self_id: parseInt(LocalStorage.get('self_id')),
                  sess: LocalStorage.get('sess'),
                  idempotent: new Date().getTime(),
                  econo_name: this.econo.econo_name,
                  econo_account: this.econo.econo_account,
                  econo_owner: this.econo.econo_owner
              }

              this.$http.post(`${this.url}/add_econo_account`,qs.stringify(data)).then((resp)=>{

                  if (resp.ret_code >=0) {
                      this.$message({
                          message:'添加成功',
                          type:'success',
                          center:true
                      })
                      setTimeout(()=>{
                          window.location.reload();
                      },1000)
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

          getList() {

              let data = {
                  self_id: parseInt(LocalStorage.get('self_id')),
                  sess: LocalStorage.get('sess'),
                  idempotent: new Date().getTime()
              }

              this.$http.post(`${this.url}/get_econo_account`,qs.stringify(data)).then((resp)=>{

                  if (resp.ret_code === 0) {
                      if (resp.ret_data.data_list) {
                          let list = resp.ret_data.data_list
                          for (var i=0;i<list.length;i++) {
                              list[i]['state'] = list[i]['state'] === 1
                          }
                          this.econo_list = list;
                      }else {
                          this.econo_list = [];
                      }
                  }else if(resp.ret_code === -1){//查不到数据
                      this.econo_list = [];
                  }else{
                      this.msgTip(resp.ret_msg)
                  }
              }).catch((error)=>{
                  if (error !== 'loginErr') {
                      console.log(error);
                      this.msgTip('系统繁忙，请稍后重试')
                  }
              })
          }
      },
      created() {
          this.getList()
      }
  }

</script>
