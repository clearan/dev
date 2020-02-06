<template>
  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;"
  >

    <div class="app-container">
      {{tips}}
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

        },

        created() {

            let data = {
                self_id: parseInt(LocalStorage.get('self_id')),
                sess: LocalStorage.get('sess'),
                idempotent: new Date().getTime(),
                pos: parseInt(0),
                offset: parseInt(20),
                user_name:LocalStorage.get('user_name')
            };

            this.$http.post(`${this.url}/get_app_role_list`,qs.stringify(data)).then((resp)=>{

                if (resp.ret_code >= 0) {

                    if (resp.ret_data.total_num > 0) {

                        if (resp.ret_data.data_list[0]['approve_id'] === 0) {

                            this.tips = '正在审核中，请等待审批结果'

                        } else {

                            if(resp.ret_data.data_list[0]['state'] === 1) {

                                this.tips = '您的申请已通过，请重新登录系统'

                            }else{

                                this.tips = '您的申请已被拒绝'
                            }
                        }

                    } else {

                        this.$router.push('index')
                    }

                }else {

                    this.msgTip(resp.ret_msg,'error');
                }

            }).catch((error)=>{
                if (error !== 'loginErr') {
                    console.log(error);
                    this.msgTip('系统繁忙，请稍后重试','error')
                }
            });
        }
    }
</script>


