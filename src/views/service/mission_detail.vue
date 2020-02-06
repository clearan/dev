<template>

  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;"
  >
    <div class="app-container">
      <el-form :model="detail" label-width="80px" style="width:40%">
        <el-form-item label="商户账号:">
          {{detail.mch_phone_num}}
        </el-form-item>
      </el-form>

      <el-form :inline="true">
        <el-form-item label-width="80px" label="短信总数:">
          {{detail.total}}
        </el-form-item>

        <el-form-item label-width="80px" label="已发送:">
          {{detail.send}}
        </el-form-item>

        <el-form-item label-width="80px" label="成功:">
          {{detail.suc}}
        </el-form-item>

        <el-form-item label-width="80px" label="失败:">
          {{detail.fail}}
        </el-form-item>
      </el-form>

      <el-form :inline="true">
        <el-form-item label-width="80px" label="下载文件:">
        </el-form-item>
        <el-form-item>
          <el-button  plain @click="download_excel(0)">未发送</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" plain @click="download_excel(1)">成功</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" plain @click="download_excel(2)">失败</el-button>
        </el-form-item>
      </el-form>

      <el-form label-width="80px" style="width: 40%;">
        <el-form-item label="短信内容:">
          <el-input
            v-model="detail.context"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            maxLength="70"
            :readonly="detail.state !== 0"
          />
        </el-form-item>
        <el-form-item v-if="detail.state === 0">
          <el-button type="primary" @click="onSubmit">立即修改</el-button>
        </el-form-item>
      </el-form>
    </div>

  </div>
</template>

<script>
    import Pagination from '@/components/Pagination'
    import {LocalStorage} from '@/utils/storage'
    import {formatMoney} from '@/utils/money'
    import qs from 'qs'
    import FileSaver from 'file-saver';

    export default {
        components: { Pagination },
        data() {
            return {
                detail:{
                    mch_phone_num:'',
                    context:'',
                    total:0,
                    send:0,
                    suc:0,
                    fail:0,
                    state:undefined
                },
                id:undefined,
                mch_id:undefined,
            }
        },

        filters:{

            //金额千分化
            formatMoney(money) {
                return formatMoney(money)
            }
        },

        methods:{

            download_excel(val) {

                var post_data = {
                    self_id: parseInt(LocalStorage.get('self_id')),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    mission_id: this.id,
                    mch_id: this.mch_id,
                    state: val
                };

                this.$http.post(`${this.url}/get_mission_detail`,qs.stringify(post_data)).then((resp)=>{

                    let _name = ''
                    if (val === 0) {
                        _name = 'u'
                    } else if(val === 1 ) {
                        _name = 's'
                    } else {
                        _name = 'f'
                    }

                    const fname = post_data.mission_id+'_'+_name
                    const exportCSV = (data, filename=`${fname}.csv`) => {
                        const blob = new Blob(['\uFEFF' + resp], {type: 'text/plain;charset=utf-8;'});
                        FileSaver.saveAs(blob, filename);
                    }
                    exportCSV(resp)
                }).catch((error)=>{
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })
            },

            getList() {

                if (this.id === undefined || this.id === '') {
                    this.msgTip('id无效');
                    this.detail.total = 0;
                    return;
                }

                let data = {
                    self_id: LocalStorage.get('self_id'),
                    idempotent: new Date().getTime(),
                    sess: LocalStorage.get('sess'),
                    id:this.id
                };

                this.$http.post(`${this.url}/get_mission`,qs.stringify(data)).then((resp)=>{

                    if (resp.ret_code === 0) {
                        this.mch_id = resp.ret_data.data_list[0].mch_id
                        this.detail.mch_phone_num = resp.ret_data.data_list[0].mch_phone_num
                        this.detail.context = resp.ret_data.data_list[0].context
                        this.detail.state = resp.ret_data.data_list[0].state

                        this.detail.total = resp.ret_data.data_list[0].target_num
                        this.detail.send = resp.ret_data.data_list[0].successful+resp.ret_data.data_list[0].failure
                        this.detail.suc = resp.ret_data.data_list[0].successful
                        this.detail.fail = resp.ret_data.data_list[0].failure
                    } else if(resp.ret_code === -1) {
                        this.mch_id = undefined
                        this.detail.total = 0
                        this.detail.send = 0
                        this.detail.suc = 0
                        this.detail.fail = 0
                        this.detail.state = undefined
                    } else {
                        this.$message({
                            message:resp.ret_msg,
                            type:'error',
                            center:true
                        })
                    }
                }).catch((error)=>{
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })
            },

            onSubmit() {

                if (this.detail.context.replace(/\s/g,"").length === 0) {
                    this.msgTip('短信内容不能为空')
                    return false
                }

                let data = {
                    self_id: LocalStorage.get('self_id'),
                    idempotent: new Date().getTime(),
                    sess: LocalStorage.get('sess'),
                    id:this.id,
                    context:this.detail.context
                };
                this.$http.post(`${this.url}/mod_mission`,qs.stringify(data)).then((resp)=>{
                    if (resp.ret_code === 0) {
                        this.$message({
                            message:'修改成功',
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

            msgTip(name) {
                this.$message({
                    message:name,
                    type:'error',
                    center:true
                })
            },
        },

        created() {
            this.id = this.$route.query.id
            this.getList()
        }
    }

</script>



