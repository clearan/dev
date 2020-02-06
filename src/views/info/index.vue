<template>
  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;">

    <div class="app-container" @keyup.enter.native="handleLogin">

      <el-form ref="infoForm" :model="infoForm" :rules="infoRules" label-width="120px">

        <el-form-item label="新密码" prop="newPass">
          <el-input type="password" v-model="infoForm.newPass" ref="newPass" maxlength="16"/>
        </el-form-item>

        <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="infoForm.checkPass" ref="checkPass" maxlength="16"/>
        </el-form-item>

        <el-form-item label="安全码" prop="v_code">
          <el-input v-model="infoForm.v_code" ref="v_code" maxlength="6"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click.native.prevent="handleLogin">确定</el-button>
        </el-form-item>
      </el-form>
    </div>

  </div>

</template>

<script>
    import qs from 'qs'
    import md5 from 'js-md5';
    import {LocalStorage} from '@/utils/storage'
    import { validateVcode} from '@/utils/validate'
    export default {
        name: 'info',
        data() {
            var checkVcode = (rule, value, callback) => {
                if (!validateVcode(value)) {
                    callback(new Error('安全码长度最少为6位'))
                }else {
                    callback()
                }
            };


            var validateNewpass = (rule, value, callback) => {
                if (value === '' || value.length < 6) {
                    callback(new Error('密码长度至少为6位'));
                } else {
                    callback();
                }
            };

            var validateCheckpass = (rule, value, callback) => {
                if (value === ''|| value.length < 6) {
                    callback(new Error('密码长度至少为6位'));
                } else if (value !== this.infoForm.newPass) {
                    callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            };
          return {
              infoForm: {
                  newPass:'',
                  checkPass: '',
                  v_code:''
              },
              infoRules: {
                  newPass: [{ required: true, trigger: 'blur', validator: validateNewpass }],
                  checkPass: [{ required: true, trigger: 'blur', validator: validateCheckpass }],
                  v_code:[{ required: true, trigger: 'blur', validator: checkVcode }],
              },
          }
        },

        methods: {
            handleLogin() {
              var _this = this;
              var data = {
                  user_name: LocalStorage.get('user_name'),
                  vcode: _this.infoForm.v_code,
                  idempotent: Date.now(),
                  passwd: md5(_this.infoForm.newPass),
              }
                _this.$refs.infoForm.validate(valid => {
                  if(valid) {
                      _this.$http.post(`${this.url}/change_passwd`,qs.stringify(data)).then((resp)=>{
                          if(resp.ret_code >= 0) {
                              _this.$message({
                                  message:'修改成功',
                                  type:'success',
                                  center:true
                              })
                          }else {
                              _this.$message({
                                  message:resp.ret_msg,
                                  type:'error',
                                  center:true
                              })
                          }
                      }).catch((error)=>{
                          if (error !== 'loginErr') {
                              console.log(error);
                              _this.$message({
                                  message:'系统繁忙，请稍后重试',
                                  type:'error',
                                  center:true
                              })
                          }
                      })
                  }else {
                      console.log('error submit!!')
                  }
              })
          },
        }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

