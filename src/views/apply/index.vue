<template>

  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;"
  >

    <div class="app-container">
      <el-form  label-width="120px" v-if="!check_flag">
        <div>
          <el-select v-model="value" placeholder="请选择" @change="changeRole">
            <el-option
              v-for="item in role_arr"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </div>

        <div style="margin-top:20px">
            <el-button type="primary" @click.native.prevent="handleApply">提交申请</el-button>
        </div>

      </el-form>
      <div v-else>{{tips}}</div>
    </div>

  </div>

</template>

<script>

    import qs from 'qs'
    import {LocalStorage} from '@/utils/storage'

    export default {
        name: 'Index',
        data() {
            return {
                role_arr:[],
                value:'',
                check_flag:false,
                tips:''
            }
        },

        methods:{

            msgTip(name,val) {

                this.$message({
                    message:name,
                    type:val,
                    center:true
                })
            },

            changeRole(val) {
                console.log(val)
            },

            handleApply() {

                if ( this.value ===''
                    || this.value === null
                    || this.value === undefined) {

                    this.msgTip('请选择角色','error');
                    return;
                }

                let data = {
                    self_id: parseInt(LocalStorage.get('self_id')),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    role_id: this.value,
                };

                this.$http.post(`${this.url}/applicate_role`,qs.stringify(data)).then((resp)=>{

                    if (resp.ret_code >= 0) {

                        this.msgTip('申请成功','success')
                        this.$router.push({path:'success'})

                    } else {

                        this.msgTip(resp.ret_msg,'error')
                    }
                }).catch((error)=>{

                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试','error')
                    }
                })
            }
        },

        created() {

            let data = {
                self_id: parseInt(LocalStorage.get('self_id')),
                sess: LocalStorage.get('sess'),
                idempotent: new Date().getTime(),
                pos: parseInt(0),
                offset: parseInt(20),
                user_name:LocalStorage.get('user_name'),
            };

            this.$http.post(`${this.url}/get_app_role_list`,qs.stringify(data)).then((resp)=>{

                if (resp.ret_code >= 0) {

                    if (resp.ret_data.total_num > 0) {

                        this.check_flag = true;
                        let list = resp.ret_data.data_list;

                        if (list[0]['approve_id'] === 0) {

                            this.tips = '正在审核中，请等待审批结果'

                        } else {

                            if (list[0]['state'] === 1) {

                                this.tips = '您的申请已通过，请重新登录系统'

                            } else {

                                this.tips = '您的申请已被拒绝'
                            }
                        }

                    } else {
                        //未申请过
                        this.check_flag = false
                    }

                } else {

                    this.check_flag = false;
                    this.msgTip(resp.ret_msg,'error')
                }

            }).catch((error)=>{

                if (error !== 'loginErr') {
                    console.log(error);
                    this.msgTip('系统繁忙，请稍后重试','error')
                }
            });

            let data2 = {
                self_id: LocalStorage.get('self_id'),
                sess: LocalStorage.get('sess'),
                idempotent: new Date().getTime()
            };

            this.$http.post(`${this.url}/get_role_list`,qs.stringify(data2)).then((resp)=>{

                if (resp.ret_code >= 0) {

                    if (resp.ret_data) {

                        let res = resp.ret_data,obj={},new_arr=[];

                        for (var i=0;i<res.length;i++) {

                            obj = {id:res[i]['role_id'],name:res[i]['role_name']};
                            new_arr.push(obj)
                        }

                        this.role_arr = new_arr

                    } else {
                        this.role_arr = []
                    }

                } else {

                    this.msgTip(resp.ret_msg,'error')
                }
            }).catch((error)=>{

                if (error !== 'loginErr') {
                    console.log(error);
                    this.msgTip('系统繁忙，请稍后重试','error')
                }

            })
        }
    }
</script>

