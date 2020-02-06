<template>

  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;">

    <div class="app-container">

      <div class="filter-container">

        <el-input v-model="listQuery.id" clearable placeholder="用户名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
        <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="handleFilter" :loading="search_loading">
          搜索
        </el-button>
        <el-button v-waves  type="primary" class="filter-item" @click="addMem" style="margin-left: 10px;" icon="el-icon-plus">
          新增
        </el-button>

      </div>

      <el-table
        border fit highlight-current-row style="width: 100%"
        :data="user_list"
        row-key="id"
        :default-sort = "{prop: 'regist_time', order: 'ascending'}"
      >

        <el-table-column
          min-width="10%"
          align="center"
          sortable
          prop="id"
          label="序号"
        >
          <template slot-scope="{row}">
            {{row.id}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="user_name"
          label="用户名"
        >
          <template slot-scope="{row}">
            {{ row.user_name }}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="role_name"
          label="角色名"
        >
          <template slot-scope="{row}">
            <span v-if="row.sys_role > 0">管理员</span>
            <span v-else-if="row.role_name">{{row.role_name}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="regist_time"
          label="注册时间"
        >
          <template slot-scope="{row}">

            <span>{{ row.regist_time|formatDate  }}</span>

          </template>
        </el-table-column>


        <el-table-column
          min-width="18%"
          align="center"
          prop="user_state"
          label="状态"
        >
          <template slot-scope="{row}">
            <el-switch
              v-model="row.user_state"
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
            <el-button
              type="primary"
              size="medium"
              @click="getUserDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>

      </el-table>

      <el-dialog :visible.sync="dialogVisible" title="新增用户" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form  label-width="80px" ref="auth" label-position="left">
          <el-form-item label="用户名称:">
            <el-input v-model="mem_name" placeholder="请输入用户名" maxLength="16" />
          </el-form-item>

          <el-form-item label="角色名:">
            <el-select v-model="value" placeholder="请选择">
              <el-option
                v-for="item in role_arr"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="用户密码:" v-show="suc_show">
            <el-input v-model="pwd" readonly/>
          </el-form-item>

          <el-form-item label="安全码:" v-show="suc_show">
            <canvas id="canvas" style=""></canvas>
          </el-form-item>


          <el-form-item>
            <div style="text-align:right;">
              <el-button type="danger" @click="dialogVisible=false">取消</el-button>
              <el-button type="primary" @click="submitAdd">确定</el-button>
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
    import qs from 'qs'
    import QRCode from 'qrcode'

    export default {
        name:'List',
        components: { Pagination },
        data() {
            return {
                pwd:'',
                suc_show:false,
                user_list: [],
                listQuery: {
                    page: 1,
                    limit: 10,
                    id:undefined
                },
                total:0,
                mem_name:'',
                role_arr:[],
                value:'',
                dialogVisible: false,
                search_loading: false,
            }
        },
        methods: {

            handleFilter() {
                this.listQuery.page = 1;
                this.getList()
            },

            addMem() {
                this.suc_show = false
                this.mem_name = '';
                this.value = undefined;
                this.dialogVisible = true
            },

            getUserDetail(row) {
                this.$router.push({path: '/user/detail', query: {id:row.id}})
            },

            changeState(row) {
                let data = {
                    self_id: parseInt(LocalStorage.get('self_id')),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    id:row.id,
                    state:row.user_state ? 1 : 0,
                }

                this.$http.post(`${this.url}/mod_user`,qs.stringify(data)).then((resp) => {

                    if (resp.ret_code >= 0) {
                        this.$message({
                            message:resp.ret_msg,
                            type:'success',
                            center:true
                        })
                    } else {
                        row.user_state = !row.user_state
                        this.$message({
                            message:resp.ret_msg,
                            type:'error',
                            center:true
                        })
                    }

                }).catch((error)=>{
                    row.user_state = !row.user_state
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.$message({
                            message:'系统繁忙，请稍后重试',
                            type:'error',
                            center:true
                        })
                    }
                })
            },

            getList (obj){

                if (obj!==undefined && obj.flag !== undefined) {
                    this.listQuery.page =1
                }

                let data = {
                    self_id: parseInt(LocalStorage.get('self_id')),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    pos: (this.listQuery.page - 1)*this.listQuery.limit,
                    offset: this.listQuery.limit,
                    user_name:this.listQuery.id || undefined
                }

                this.search_loading = true;
                this.$http.post(`${this.url}/get_user_list`,qs.stringify(data)).then((resp) => {

                    this.search_loading = false;
                    if (resp.ret_code >= 0) {

                        let res = resp.ret_data.data_list
                        if (res) {
                            for (var i=0;i<res.length;i++) {
                                res[i]['user_state'] = res[i]['user_state'] === 1
                            }
                            this.user_list = res
                            this.total = resp.ret_data.total_num
                        } else {
                            this.user_list = []
                            this.total = 0
                        }

                    } else {
                        this.msgTip(resp.ret_msg,'error')
                    }

                }).catch((error)=>{
                    this.search_loading = false;
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试','error')
                    }
                })
            },

            getRole() {
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
            },

            /**
             * 校验用户名
             * 字符最少1个
             * 不允许有特殊字符（包括空格）
             * 不允许中文
             */
            validName(str) {
                if (str.length<1 || str.length>16) return false
                for(var i=0;i<str.length;i++) {
                    if(!/^[a-zA-Z0-9]$/.test(str[i])) {
                        return false
                    }
                }
                return true;
            },

            submitAdd() {

                this.suc_show = false

                if (!this.validName(this.mem_name)) {
                    this.msgTip('用户名格式错误','error')
                    return
                }

                if (this.value ===''
                    || this.value === null
                    || this.value === undefined) {

                    this.msgTip('请选择角色','error');
                    return;
                }

                this.$http.post(`${this.url}/check_username`,qs.stringify({user_name:this.mem_name})).then((resp)=>{
                    if(resp.ret_code === 0) {
                        this.reg_mem();
                    }else if(resp.ret_code >0 ) {
                        this.msgTip('用户名已存在','error');
                    }else{
                        this.msgTip('请重新填写','error');
                    }
                }).catch((error)=>{
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试','error')
                    }
                })
            },

            reg_mem() {
                let data = {
                    user_name: this.mem_name,
                    role_id:this.value
                }
                var _this = this
                this.$http.post(`${this.url}/signup`,qs.stringify(data)).then((resp) => {

                    if (resp.ret_code > 0) {
                        _this.msgTip(resp.ret_msg,'success');
                        this.pwd = resp.ret_data.password
                        let canvas = document.getElementById('canvas')

                        QRCode.toCanvas (canvas, resp.ret_data.url, function (error) {
                            if(error) {
                                console.log(error);
                                _this.suc_show = false
                                _this.$message({
                                    message:'谷歌二维码生成失败',
                                    type: 'error',
                                    center: true
                                })
                                return
                            }
                            _this.suc_show = true
                            console.log('QRCode success!');
                        })
                    } else {
                        _this.suc_show = false
                        this.msgTip(resp.ret_msg,'error');
                    }
                }).catch((error)=>{
                    _this.suc_show = false
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试','error')
                    }
                })
            },

            msgTip(name,val) {

                this.$message({
                    message:name,
                    type:val,
                    center:true
                })
            },

        },

        filters:{
            //时间戳
            formatDate(time) {
                return formatDate(time);
            },
        },

        created() {
            this.getList()
            this.getRole()
        }
    }
</script>

