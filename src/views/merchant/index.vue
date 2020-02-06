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


          <el-input v-model="listQuery.val" clearable placeholder="手机号/商户账号" style="width: 250px;" class="filter-item" @keyup.enter.native="handleFilter" />
          <el-select v-model="listQuery.state" placeholder="状态" clearable style="width: 90px" class="filter-item">
            <el-option v-for="item in states" :key="item.state" :label="item.name" :value="item.state" />
          </el-select>

          <el-button v-waves class="filter-item" type="primary" style="margin-left: 20px;" icon="el-icon-search" @click="handleFilter" :loading="search_loading">
            搜索
          </el-button>


      </div>

      <el-table
        border fit highlight-current-row style="width: 100%;"
        :data="mch_list"
        row-key="id"
        :default-sort = "{prop: 'regist_time', order: 'descending'}"
        @sort-change="sort_post"
      >

        <el-table-column
          min-width="28%"
          align="center"
          prop="id"
          label="商户号"
        >
          <template slot-scope="{row}">
            {{ row.id }}
          </template>


        </el-table-column>

        <el-table-column
          min-width="15%"
          align="center"
          prop="phone_num"
          label="手机号"
        >
          <template slot-scope="{row}">
            {{ row.phone_num }}
          </template>

        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="name"
          label="商户名"
        >
          <template slot-scope="{row}">
            {{row.name}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="email"
          label="邮箱"
        >
          <template slot-scope="{row}">
            {{row.email}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="pay_amount"
          label="任务费用(元)"
        >
          <template slot-scope="{row}">
            {{row.pay_amount| formatMoney}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="new_balance"
          label="余额(元)"
          sortable="custom"
        >
          <template slot-scope="{row}">
            {{row.new_balance| formatMoney}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="new_deposit"
          label="质押金(元)"
          sortable
        >
          <template slot-scope="{row}">
            {{row.new_deposit | formatMoney}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="available"
          label="可用余额(元)"
          sortable
        >
          <template slot-scope="{row}">
            {{row.available | formatMoney}}
          </template>
        </el-table-column>


        <el-table-column
          min-width="18%"
          align="center"
          prop="regist_time"
          label="注册时间"
        >
          <template slot-scope="{row}">
            {{row.regist_time |formatDate }}
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
          min-width="18%"
          align="center"
          label="操作"
        >
          <template slot-scope="{row}">

            <el-link  type="primary" @click="showDetail(row)">
              动账详情
            </el-link>

            <el-link type="primary" @click="changeMoney(row)">
              修改任务金额
            </el-link>

          </template>
        </el-table-column>
      </el-table>


      <el-dialog :visible.sync="dialogVisible" title="修改任务费用" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form :model="money" label-width="80px" label-position="left">
          <el-form-item label="当前金额">
            <el-input v-model="money.money"  readonly style="width: 30%"/>&nbsp;元
          </el-form-item>
          <el-form-item label="更新金额">
            <el-input v-model="money.new_money" style="width: 30%" autofocus maxlength="12" clearable/>&nbsp;元
          </el-form-item>
          <!-- <el-form-item label="备注">
            <el-input
              v-model="money.remark"
              :autosize="{ minRows: 2, maxRows: 4}"
              type="textarea"
              style="width: 60%"
            />
          </el-form-item> -->
          <el-form-item>
            <div style="text-align:right;">
              <el-button type="danger" @click="dialogVisible=false">取消</el-button>
              <el-button type="primary" @click="submitEdit">确定</el-button>
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

    export default {
        components: { Pagination },
        data() {
            return {
                search_loading:false,
                mch_list:[],
                listQuery: {
                    page: 1,
                    limit: 10,
                    val: undefined,
                    state:undefined
                },
                states : [
                    {state:0,name:'禁用'},
                    {state:1,name:'正常'},
                ],
                money:{
                    id:'',
                    money:'',
                    new_money:'',
                   // remark:''
                },
                total:0,
                dialogVisible:false,
            }
        },

        watch :{
            'money.new_money':function (newvalue,oldvalue) {

                var newvalue_=(newvalue.indexOf('.00')>0)?newvalue.replace('.00' ,''):newvalue; //禁止ie8,9自动添加.00的小数点
               // var newvalue_=newvalue
                if ((isNaN(parseFloat(newvalue_.replace(/,/ig,''))))){ //如果当前输入的不是数字就停止执行
                    this.money.new_money='';  //防止不是数字是input出现NaN提示
                    return false;
                }

                if ( /\./i.test(newvalue_) ){ //判断处理含有.的情况下
                    if (/\.\d{3}$/.test(newvalue_) || /\.\d*\./.test(newvalue_)){
                        this.money.new_money=oldvalue; //限制只能输入2位小数点
                    } else{
                        this.money.new_money=newvalue_.replace(/[^\d\.\,]/ig,'') //开始输入小数点之后，只能输入数字
                    }
                } else{
                    this.money.new_money=((parseFloat(newvalue_.replace(/,/ig,'')).toLocaleString()).toString()).replace('.00' ,'');
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
            handleFilter () {
                this.listQuery.page = 1;
                this.getList()
            },

            showDetail(row) {
                let date = new Date().getTime();
                LocalStorage.set("mch_phone", row.phone_num, date + 24*60*60*1000);
                this.$router.push({path: '/merchant/dynamic_detail', query: {id: row.id}})
            },

            changeMoney (row) {
                this.money.money = !row.pay_amount ? '0.00' : formatMoney(row.pay_amount)
                this.money.new_money = ''
                this.money.id = row.id
                this.dialogVisible = true
            },

            changeState (row) {
                let data = {
                    self_id: LocalStorage.get('self_id'),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    mch_id:row.id,
                    state: row.state ? 1 : 0,
                    operator: LocalStorage.get('user_name')
                };
                this.$http.post(`${this.url}/mod_mch`,qs.stringify(data)).then((resp)=> {
                    if (resp.ret_code >= 0) {
                        this.$message({
                            message:resp.ret_msg,
                            type:'success',
                            center:true
                        })
                    } else {
                        row.state = !row.state
                        this.msgTip(resp.ret_msg)
                    }
                }).catch((error) => {
                    row.state = !row.state
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })
            },

            submitEdit() {

                if (this.money.new_money.replace(/\s/g,'') === '') {
                    this.msgTip('更新金额不能为空')
                    return
                }

                // if (this.money.remark.replace(/\s/g,'') === '') {
                //     this.msgTip('备注不能为空')
                //     return
                // }
                let balance = ''
                if (this.money.new_money.includes('.')) {
                    let tmp = this.money.new_money.replace(/[,]/g,'')
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
                    balance = this.money.new_money.replace(/[,]|[.]/g,'')*100
                }

                if (balance === 0) {
                  this.msgTip('更新金额不能为空')
                  return
                }

                let data = {
                    self_id: LocalStorage.get('self_id'),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    id:this.money.id,
                    pay_amount: balance,
                    // remark: this.money.remark,
                    // operator: LocalStorage.get('user_name'),
                };
                this.$http.post(`${this.url}/mod_mch_pay_amount`,qs.stringify(data)).then((resp) => {
                    if (resp.ret_code >= 0) {
                        this.dialogVisible = false
                        this.getList();
                        this.$message({
                            message:'金额更新成功',
                            type:'success',
                            center:true
                        })
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

            getList(obj) {

                if (obj!==undefined && obj.flag !== undefined) {
                    this.listQuery.page =1
                }

                let data = {
                    self_id: parseInt(LocalStorage.get('self_id')),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    state : this.listQuery.state!==''?this.listQuery.state:undefined,
                    pos: (this.listQuery.page - 1)*this.listQuery.limit,
                    offset: this.listQuery.limit
                };

                if (this.listQuery.val !== undefined && this.listQuery.val.length === 24) {
                    data.phone_num = undefined
                    data.id = this.listQuery.val
                } else{
                    data.phone_num = this.listQuery.val || undefined
                    data.id = undefined
                }

                this.search_loading = true;
                this.$http.post(`${this.url}/get_mchlist`,qs.stringify(data)).then((resp)=>{
                    this.search_loading = false;
                    if (resp.ret_code === 0) {
                        if (resp.ret_data.data_list) {
                            //let list = resp.ret_data.data_list
                            let list = [
                                {"id":"1e26b0c2265ae63e72bf8af5","phone_num":136673251,"pay_amount":'1.1',"balance":"700","deposit":'200','regist_time':1580781978},
                                {"id":"2e26b0c2265ae63e72bf8af5","phone_num":136673252,"pay_amount":'5.2',"balance":"605","deposit":'100','regist_time':1580782078},
                                {"id":"3e26b0c2265ae63e72bf8af5","phone_num":136673253,"pay_amount":'3.3',"balance":"200","deposit":'150','regist_time':1580781978},
                                {"id":"4e26b0c2265ae63e72bf8af5","phone_num":136673254,"pay_amount":'0.4',"balance":"105","deposit":'450','regist_time':1580121978},
                                {"id":"5e26b0c2265ae63e72bf8af5","phone_num":136673255,"pay_amount":'2.5',"balance":"500","deposit":'320','regist_time':1580782278},
                                {"id":"6e26b0c2265ae63e72bf8af5","phone_num":136673256,"pay_amount":'0.6',"balance":"704","deposit":'220','regist_time':1580781238},
                                {"id":"7e26b0c2265ae63e72bf8af5","phone_num":136673210,"pay_amount":'3.7',"balance":"612","deposit":'120','regist_time':1580701978},
                                {"id":"8e26b0c2265ae63e72bf8af5","phone_num":136673211,"pay_amount":'5.8',"balance":"820","deposit":'670','regist_time':1581781978},
                                {"id":"9e26b0c2265ae63e72bf8af5","phone_num":136673212,"pay_amount":'4.9',"balance":"800","deposit":'520','regist_time':1583781978},
                                {"id":"5126b0c2265ae63e72bf8af5","phone_num":136673213,"pay_amount":'2.1',"balance":"190","deposit":'140','regist_time':1580783278},
                                {"id":"5226b0c2265ae63e72bf8af5","phone_num":136673214,"pay_amount":'4.1',"balance":"550","deposit":'350','regist_time':1580781178},
                                // {"id":"5326b0c2265ae63e72bf8af5","phone_num":136673215,"pay_amount":'3.5',"balance":"452","deposit":'520','regist_time':1580781278},
                                // {"id":"5426b0c2265ae63e72bf8af5","phone_num":136673216,"pay_amount":'1.2',"balance":"652","deposit":'351','regist_time':1580781378},
                                // {"id":"5526b0c2265ae63e72bf8af5","phone_num":136673217,"pay_amount":'5.1',"balance":"355","deposit":'20','regist_time':1580781478},
                            ]
                            for (var i=0;i<list.length;i++) {
                                let balance = String(list[i]['balance']);
                                let deposit = String(list[i]['deposit']);
                                let pay_amount = String(list[i]['pay_amount']);
                                let available = String(list[i]['balance'] - list[i]['deposit'])

                                list[i]['new_balance'] =  this.count(balance)
                                list[i]['new_deposit'] =  this.count(deposit)
                                list[i]['available'] =  this.count(available)
                                list[i]['pay_amount'] =  this.count(pay_amount)

                                list[i]['state'] = list[i]['state'] === 1
                            }
                            this.mch_list = list;
                            //this.total = resp.ret_data.total_num
                            this.total = list.length
                        } else {
                            this.mch_list = [];
                            this.total = 0
                        }
                    } else if(resp.ret_code === -1){//查不到数据
                        this.mch_list = [];
                        this.total = 0
                    } else{
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

            msgTip(name) {
                this.$message({
                    message:name,
                    type:'error',
                    center:true
                })
            },

            count1 (val) {
                if (val.length === 1) {
                    val = '0.0'+val
                } else if (val.length === 2) {
                    val = '0.'+val
                } else{
                    return val.slice(0, -2) + "." + val.slice(val.length - 2)
                }
                return val
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
            },

            sort_post (column) {
                console.log(column)
            }


        },





        created() {
            if(this.$route.params.mch_id) {
                this.listQuery.val = this.$route.params.mch_id
            }
            this.getList()
        }
    }

</script>



