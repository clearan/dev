<template>

  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;"
  >
    <div class="app-container">
      <el-tabs v-model="activeName" @tab-click="handleClick">

        <el-tab-pane label="邮件设置" name="first">

          <el-form  ref="emailForm" label-width="130px"  class="demo-ruleForm" :model="emailForm" :rules="emailRules">
            <el-form-item label="SMTP服务器" prop="smtp_host" >
              <el-input v-model="emailForm.smtp_host"></el-input>
            </el-form-item>
            <el-form-item label="SMTP发送邮箱" prop="smtp_email" >
              <el-input v-model="emailForm.smtp_email" placeholder="填写你的邮箱商户名如：123@163.com"></el-input>
            </el-form-item>
            <el-form-item label="SMTP商户名" prop="smtp_name" >
              <el-input v-model="emailForm.smtp_name" placeholder="填写你的邮箱商户名"></el-input>
            </el-form-item>
            <el-form-item label="SMTP密码" prop="smtp_passwd" >
              <el-input type="password" v-model="emailForm.smtp_passwd"></el-input>
            </el-form-item>
            <el-form-item label="邮件设置测试" prop="email">
              <el-input v-model="emailForm.email" ></el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="emailSubmit" :loading="submit_loading">保存</el-button>
              <el-button @click="resetForm()">重置</el-button>
              <el-button @click="sendTest" :loading="test_loading">发送测试邮件</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="邮件模板" name="second">

        </el-tab-pane>
      </el-tabs>
    </div>

  </div>
</template>

<script>
    import {LocalStorage} from '@/utils/storage'
    import md5 from 'js-md5';
    import qs from 'qs'
    export default {
        data() {
            return {
                submit_loading:false,
                test_loading:false,
                activeName: 'first',
                emailForm:{
                    smtp_host:'',
                    smtp_email:'',
                    smtp_name:'',
                    smtp_passwd:'',
                    email:''
                },
                emailRules:{
                    smtp_host: [{ required: true, trigger: 'blur', message: '服务器名称不能为空'}],
                    smtp_email: [{ required: true, trigger: 'blur', message: '邮箱名称不能为空'}],
                    smtp_name: [{ required: true, trigger: 'blur', message: '商户名不能为空'}],
                    smtp_passwd: [{ required: true, trigger: 'blur', message: '密码不能为空'}]
                }
            };
        },
        methods: {
            handleClick(tab, event) {
                console.log(tab, event);
            },

            emailSubmit() {
                if (this.emailRules.email) {
                    delete this.emailRules.email
                }
                this.$refs.emailForm.validate( valid => {
                    if (valid) {
                        this.submit_loading = true
                        let params = {
                            smtp_host: this.emailForm.smtp_host,
                            smtp_name: this.emailForm.smtp_name,
                            smtp_email: this.emailForm.smtp_email,
                            smtp_passwd: this.emailForm.smtp_passwd,
                        }
                        let data = {
                            self_id: LocalStorage.get('self_id'),
                            sess: LocalStorage.get('sess'),
                            idempotent: new Date().getTime(),
                            data: JSON.stringify(params),
                            sign: md5(JSON.stringify(params)),
                        }
                        this.$http.post(`${this.url2}/set_email`,qs.stringify(data)).then((resp)=>{
                            this.submit_loading = false
                            if (resp.ret_code >=0) {
                                this.$message({
                                    message:'保存成功',
                                    type:'success',
                                    center:true
                                })
                            }else{
                                this.$message({
                                    message:resp.ret_msg,
                                    type:'error',
                                    center:true
                                })
                            }
                        }).catch((error)=>{
                            this.submit_loading = false
                            console.log(error)
                            this.$message({
                                message:'系统繁忙，请稍后重试',
                                type:'error',
                                center:true
                            })
                        })
                    }else {
                        console.log('error submit!!')
                    }
                })
            },

            resetForm() {
                this.$refs.emailForm.resetFields();
            },

            sendTest() {
                this.emailRules.email =  [{ required: true, trigger: 'blur', message: '测试地址不能为空'}]
                this.$refs.emailForm.validate( valid => {
                    if (valid) {
                        this.test_loading = true
                        let data = {
                            self_id: LocalStorage.get('self_id'),
                            sess: LocalStorage.get('sess'),
                            idempotent: new Date().getTime(),
                            data: JSON.stringify(this.emailForm),
                            sign: md5(JSON.stringify(this.emailForm)),
                        }
                        this.$http.post(`${this.url2}/test_email`,qs.stringify(data)).then((resp)=>{
                            this.test_loading = false
                            if (resp.ret_code >=0) {
                                this.$message({
                                    message:'测试成功',
                                    type:'success',
                                    center:true
                                })
                            }else{
                                this.$message({
                                    message:resp.ret_msg,
                                    type:'error',
                                    center:true
                                })
                            }
                        }).catch((error)=>{
                            this.test_loading = false
                            console.log(error)
                            this.$message({
                                message:'系统繁忙，请稍后重试',
                                type:'error',
                                center:true
                            })
                        })
                    }else {
                        console.log('error submit!!')
                    }
                })
            }


        },

        created() {
            let data = {
                self_id: LocalStorage.get('self_id'),
                sess: LocalStorage.get('sess'),
                idempotent: new Date().getTime()
            }

            this.$http.post(`${this.url2}/get_email`,qs.stringify(data)).then((resp)=>{
                if (resp.ret_code >= 0) {
                    this.emailForm = resp.ret_data
                } else {
                    this.$message({
                        message:resp.ret_msg,
                        type:'error',
                        center:true
                    })
                }
            })
        }
    };
</script>
<style scoped>
  /deep/ .el-input__inner{
    width:33%
  }
</style>
