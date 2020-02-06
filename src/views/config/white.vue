<template>
  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;"
  >
    <div class="app-container">


      <el-form label-width="120px" style="width:40%">


        <el-form-item label="ip白名单">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入ip地址"
            v-model="textarea">
          </el-input>
          <span>注:多个IP用英文分号隔开,不填ip表示允许所有地址访问</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit" >确定</el-button>
        </el-form-item>

      </el-form>




    </div>
  </div>
</template>
<script>

  import {LocalStorage} from '@/utils/storage'
  import qs from 'qs'

  export default {
      data() {
          return {
              textarea:''
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

          onSubmit() {

            let data = {
              self_id: parseInt(LocalStorage.get('self_id')),
              sess: LocalStorage.get('sess'),
              idempotent: new Date().getTime(),
              ip_list:this.textarea.replace(/\s/g,'')
            }

            this.$http.post(`${this.url}/update_iplist`,qs.stringify(data)).then((resp)=>{
              if (resp.ret_code === 0) {
                this.$message({
                    message:'白名单更新成功',
                    type:'success',
                    center:true
                })
                window.location.reload();
              } else {
                this.msgTip(resp.ret_msg)
              }
            }).catch((error)=>{
              if (error !== 'loginErr') {
                console.log(error);
                this.msgTip('系统繁忙,请稍后重试')
              }
            })
          },

          getList() {
            let data = {
                self_id: parseInt(LocalStorage.get('self_id')),
                sess: LocalStorage.get('sess'),
                idempotent: new Date().getTime()
              }

              this.$http.post(`${this.url}/get_iplist`,qs.stringify(data)).then((resp)=>{
                if (resp.ret_code === 0) {
                  this.textarea = resp.ret_data.ip_list.join(';')
                } else {
                  this.msgTip(resp.ret_msg)
                }
              }).catch((error)=>{
                if (error !== 'loginErr') {
                  console.log(error);
                  this.msgTip('系统繁忙,请稍后重试')
                }
              })
          }



      },
      created() {
          this.getList()
      }
  }

</script>
