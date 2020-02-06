<template>

  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;"
  >
    <div class="app-container">

      <div class="filter-container" style="margin-left: 60px">

        <el-input v-model="listQuery.val" clearable placeholder="手机号/商户账号" style="width: 250px;" class="filter-item" @keyup.enter.native="handleFilter" />

        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter" :loading="search_loading" style="margin-left: 10px;">
          搜索
        </el-button>

      </div>

      <el-form label-width="120px" style="width:40%" v-show="form_show">

        <el-form-item label="手机号码" >
          <el-input  v-model="phone" readonly style="width: 50%" />
        </el-form-item>

        <el-form-item label="注册时间">
          <el-input  v-model="regist_time" readonly style="width: 50%"/>
        </el-form-item>

        <el-form-item label="可用余额">
          <el-input  v-model="balance" readonly style="width: 50%"/> 元
        </el-form-item>

        <el-form-item label="余额操作">
          <el-select v-model="type" placeholder="请选择操作">
            <el-option label="人工加款" value="1"></el-option>
            <el-option label="人工扣款" value="2"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="调整金额">
          <el-input  v-model="change_money" maxlength="16" style="width: 50%"/> 元
        </el-form-item>

        <el-form-item label="备注">
          <el-input  v-model="remark"  style="width: 50%"/>
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
    import {formatDate} from '@/utils/date'
    import {formatMoney} from '@/utils/money'
    import qs from 'qs'

    export default {
        data() {
            return {
                listQuery:{
                    val:undefined
                },
                form_show:false,
                phone:'',
                regist_time:'',
                balance:'',
                type:'',
                change_money:'',
                remark:'',
                mch_id:undefined,
                search_loading:false,
            }
        },

        watch :{
            'change_money':function (newvalue,oldvalue) {

                var newvalue_=(newvalue.indexOf('.00')>0)?newvalue.replace('.00' ,''):newvalue; //禁止ie8,9自动添加.00的小数点

                if ((isNaN(parseFloat(newvalue_.replace(/,/ig,''))))){ //如果当前输入的不是数字就停止执行
                    this.change_money='';  //防止不是数字是input出现NaN提示
                    return false;
                }

                if ( /\./i.test(newvalue_) ){ //判断处理含有.的情况下
                    if (/\.\d{3}$/.test(newvalue_) || /\.\d*\./.test(newvalue_)){
                        this.change_money=oldvalue; //限制只能输入2位小数点
                    } else{
                        this.change_money=newvalue_.replace(/[^\d\.\,]/ig,'') //开始输入小数点之后，只能输入数字
                    }
                } else{
                    this.change_money=((parseFloat(newvalue_.replace(/,/ig,'')).toLocaleString()).toString()).replace('.00' ,'');
                }
            }
        },

        methods:{

            handleFilter() {

                this.type = ''
                this.change_money = ''
                this.remark = ''

                let data = {
                    self_id: parseInt(LocalStorage.get('self_id')),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime()
                };

                if (this.listQuery.val !== undefined && this.listQuery.val.length === 24) {
                    data.phone_num = undefined
                    data.id = this.listQuery.val
                } else{
                    data.phone_num = this.listQuery.val || '1'
                    data.id = undefined
                }

                this.search_loading = true;
                this.$http.post(`${this.url}/get_mchlist`,qs.stringify(data)).then((resp)=>{
                    this.search_loading = false;
                    if (resp.ret_code === 0) {
                        if (resp.ret_data.data_list) {
                            let info = resp.ret_data.data_list[0];
                            this.form_show = true
                            this.mch_id = info['id']
                            this.phone = info['phone_num']
                            this.regist_time = formatDate(info['regist_time'])
                            this.balance = this.count(String(info['balance']-info['deposit']));

                        } else {
                            this.form_show = false
                        }
                    } else if(resp.ret_code === -1){//查不到数据
                        this.form_show = false
                    } else{
                        this.form_show = false
                        this.msgTip(resp.ret_msg)
                    }
                }).catch((error)=>{
                    this.search_loading = false;
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })
            },

            onSubmit() {

                let balance = ''
                if (this.change_money.includes('.')) {
                    let tmp = this.change_money.replace(/[,]/g,'')
                    if (tmp.split('.')[1].length === 0) {
                        balance = tmp.replace(/[.]/g,'')*100
                    }

                    if (tmp.split('.')[1].length === 1) {
                        balance = tmp.replace(/[.]/g,'')*10
                    }

                    if (tmp.split('.')[1].length === 2) {
                        balance = tmp.replace(/[.]/g,'')
                    }

                } else{
                    balance = this.change_money.replace(/[,]|[.]/g,'')*100
                }


                if ( this.type ===''
                    || this.type === null
                    || this.type === undefined) {

                    this.msgTip('请选择操作方式','error');
                    return;
                }

                if (balance == 0) {
                    this.msgTip('调整金额不能为空')
                    return
                }

                if (String(balance).length > 9) {
                    this.msgTip('调整金额超出限制')
                    return
                }

                if (this.remark.replace(/\s/g,'') === '') {
                    this.msgTip('备注不能为空')
                    return
                }

                let data = {
                    self_id: LocalStorage.get('self_id'),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    mch_id:this.mch_id,
                    balance: this.type==1?balance:'-'+balance,
                    remark: this.remark,
                    operator: LocalStorage.get('user_name'),
                };

                this.$http.post(`${this.url}/mod_mch`,qs.stringify(data)).then((resp) => {
                    if (resp.ret_code >= 0) {
                        this.$message({
                            message:'金额更新成功',
                            type:'success',
                            center:true
                        })
                        this.handleFilter()
                    } else {
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

            count (val) {
                let new_val = String(Math.abs(val))
                if (new_val.length === 1) {
                    new_val = '0.0'+new_val
                } else if (new_val.length === 2) {
                    new_val = '0.'+new_val
                } else{
                    new_val = new_val.slice(0, -2) + "." + new_val.slice(new_val.length - 2)
                }
                let return_val = ''
                if (val < 0) {
                    return_val = '-' + new_val
                } else {
                    return_val = new_val
                }
                return return_val
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
        }

    }

</script>



