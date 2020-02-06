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
        :data="system_list"
        row-key="id"
      >

        <el-table-column
          min-width="25%"
          align="center"
          prop="key"
          label="键(key)"
        >
          <template slot-scope="{row}">
            {{row.key}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="25%"
          align="center"
          prop="value"
          label="值(value)"
        >
          <template slot-scope="{row}">
              {{ row.val }}
          </template>
        </el-table-column>

        <el-table-column
          min-width="25%"
          align="center"
          prop="desc"
          label="描述"
        >
          <template slot-scope="{row}">
            {{ row.desc }}
          </template>

        </el-table-column>

        <el-table-column
          label="操作"
          min-width="20%"
          align="center"
        >
          <template slot-scope="{row}">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>

      </el-table>

      <el-dialog :visible.sync="dialogVisible" title="编辑配置" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form :model="system" label-width="80px" label-position="left">
          <el-form-item label="键(key)">
            <el-input v-model="system.key" maxLength="8"/>
          </el-form-item>
          <el-form-item label="值(value)">
            <el-input v-model="system.value" maxLength="20"/>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="system.desc" maxLength="30"/>
          </el-form-item>
          <el-form-item>
            <div style="text-align:right;">
              <el-button type="danger" @click="dialogVisible=false">取消</el-button>
              <el-button type="primary" @click="submitEdit">确定</el-button>
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
              system_list:[],
              system:{
                  id:'',
                  uid:'',
                  key:'',
                  value:'',
                  desc:''
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

          handleEdit(row) {
              this.system.id = row.id;
              this.system.uid = row.uid;
              this.system.key = row.key;
              this.system.value = String(row.val);
              this.system.desc = row.desc;
              this.dialogVisible = true
          },

          submitEdit() {

              if (this.system.key.replace(/\s/g,"").length === 0) {
                  this.msgTip('key值不能为空')
                  return false
              }

              if (this.system.value.replace(/\s/g,"").length === 0) {
                  this.msgTip('value值不能为空')
                  return false
              }

              var reg=/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/;
              if (!reg.test(this.system.value)) {
                  this.msgTip('value值格式错误')
                  return false
              }

              if (this.system.uid === 5 && this.system.value < 12) {
                  this.msgTip('为保持系统稳定，刷新间隔时间不能低于12秒')
                  return false
              }

              if (this.system.desc.replace(/\s/g,"").length === 0) {
                  this.msgTip('描述不能为空')
                  return false
              }

              let data = {
                  self_id: parseInt(LocalStorage.get('self_id')),
                  sess: LocalStorage.get('sess'),
                  idempotent: new Date().getTime(),
                  id:this.system.id,
                  key: this.system.key,
                  val: parseInt(this.system.value),
                  desc: this.system.desc
              }

              this.$http.post(`${this.url}/mod_service_config`,qs.stringify(data)).then((resp)=>{

                  if (resp.ret_code >=0) {
                      this.$message({
                          message:'编辑成功',
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

              this.$http.post(`${this.url}/get_service_config`,qs.stringify(data)).then((resp)=>{

                  if (resp.ret_code === 0) {
                      if (resp.ret_data) {
                          this.system_list = resp.ret_data
                          let date = new Date().getTime();
                          LocalStorage.set("time", resp.ret_data[5]['val'], date + 3*60*60*1000);
                      }else {
                          this.system_list = [];
                      }
                  }else if(resp.ret_code === -1){//查不到数据
                      this.system_list = [];
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
