<template>
  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;">

    <div class="app-container">

      <el-form label-width="120px" style="width:40%">
        <el-form-item label="用户名称" >
          <el-input  v-model="user.user_name" readonly />
        </el-form-item>

        <el-form-item label="注册时间">
          <el-input  v-model="user.regist_time" readonly/>
        </el-form-item>


        <el-form-item label="角色名称">

          <el-select v-model="role.role_id" placeholder="请选择">
            <el-option
              v-for="item in role_arr"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="谷歌安全码" v-show="qr_res">
          <canvas id="canvas" style="" ></canvas>
        </el-form-item>

        <el-form-item label="密码" v-show="pwd_res">
          <el-input  v-model="user.pwd" readonly/>
        </el-form-item>

        <el-form-item>
          <el-button  type="primary" @click="resetSubmit">重置账号</el-button>
        </el-form-item>

      </el-form>

      <div style="margin-top: 40px;"><el-divider></el-divider></div>

<!--      <div v-for="(item,index) in auth_list">-->

<!--        <el-form label-width="120px" >-->

<!--          <el-form-item label="权限名称">-->
<!--            <el-input type="text" v-model="item.name"  readonly/>-->
<!--          </el-form-item>-->

<!--          <el-form-item label="权限描述">-->
<!--            <el-input type="text" v-model="item.desc"  readonly/>-->
<!--          </el-form-item>-->

<!--          <el-table-->
<!--            style="margin-top: 20px"-->
<!--            :data="item.auth2_list"-->
<!--            :ref="'item'+index"-->
<!--          >-->

<!--            <el-table-column-->
<!--              min-width="300px"-->
<!--              label="名称"-->
<!--            >-->
<!--              <template slot-scope="{row}">-->
<!--                <span>{{ row.name }}</span>-->
<!--              </template>-->
<!--            </el-table-column>-->

<!--            <el-table-column-->
<!--              min-width="300px"-->
<!--              label="描述"-->
<!--            >-->
<!--              <template slot-scope="{row}">-->
<!--                <span>{{ row.desc }}</span>-->
<!--              </template>-->
<!--            </el-table-column>-->

<!--            <el-table-column-->
<!--              min-width="300px"-->
<!--              label="url"-->
<!--            >-->
<!--              <template slot-scope="{row}">-->
<!--                <span>{{ row.url }}</span>-->
<!--              </template>-->
<!--            </el-table-column>-->
<!--          </el-table>-->
<!--        </el-form>-->
<!--      </div>-->

      <el-table
        border  highlight-current-row
        style="width: 66%;margin: 40px 0 0 54px;"
        :data="auth_list"
        row-key="id"
        :tree-props="{children: 'auth2_list', hasChildren: 'hasChildren'}"
        :header-cell-style="headerStyle"
      >


        <el-table-column
          min-width="33%"
          prop="name"
          label="菜单名称"
        >
          <template slot-scope="{row}">
            <span style="margin-left: 8px">{{row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="desc"
          label="描述"
          align="center"
          min-width="33%">
          <template slot-scope="{row}">
            <span >{{ row.desc }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="url"
          label="url"
          align="center"
          min-width="33%">
          <template slot-scope="{row}">
            <span>{{ row.url }}</span>
          </template>
        </el-table-column>

      </el-table>


    </div>

  </div>

</template>

<script>

    import {formatDate} from '@/utils/date'
    import {LocalStorage} from '@/utils/storage'
    import qs from 'qs'
    import QRCode from 'qrcode'

    export default {
        name:'List',
        data() {
            return {
                user:{
                    user_name:'',
                    regist_time:'',
                    pwd:'',
                },
                role:{
                    role_id:'',
                    role_name:'',
                    role_desc:'',
                },
                auth_list:[],
                role_arr:[],
                beforeVal:'',
                link:'',
                qr_res:false,
                pwd_res:false,
            }
        },

        watch: {
            'role.role_id':function (val,oldVal) {

                if (this.beforeVal !== val) {
                    this.$confirm('是否更改用户角色？','提示',{
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(()=>{

                        if (this.user.user_name === undefined || !this.user.user_name) {
                            this.$message({
                                message:'用户不存在',
                                type:'error',
                                center:true
                            })
                            return
                        }

                        let data = {
                            self_id: parseInt(LocalStorage.get('self_id')),
                            sess: LocalStorage.get('sess'),
                            idempotent: new Date().getTime(),
                            id:this.$route.query.id,
                            role_id:val,
                            state:1,
                        }

                        this.$http.post(`${this.url}/mod_user`,qs.stringify(data)).then((resp)=>{

                            if(resp.ret_code >= 0) {
                                this.$message({
                                    message:resp.ret_msg,
                                    type:'success',
                                    center:true
                                })
                                setTimeout(()=>{
                                    window.location.reload()
                                },1000)
                            }else {
                                this.role.role_id = oldVal
                                this.$message({
                                    message:resp.ret_msg,
                                    type:'error',
                                    center:true
                                })
                            }

                        }).catch((error)=>{
                            this.role.role_id = oldVal
                            if (error !== 'loginErr') {
                                console.log(error);
                                this.$message({
                                    message:'系统繁忙，请稍后重试',
                                    type:'error',
                                    center:true
                                })
                            }
                        })
                    }).catch(()=>{
                        this.role.role_id = oldVal
                        this.$message({
                            type: 'info',
                            message: '已取消更新'
                        });
                    })
                }

            }
        },

        methods: {

            headerStyle({row, column, rowIndex, columnIndex}) {

                if (rowIndex === 0) {
                    return `
                      text-align:center
                      `
                }
            },

            resetSubmit() {

                this.$confirm('是否确认重置账号？','提示',{
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    closeOnClickModal:false,
                    closeOnPressEscape:false,
                    type: 'warning'
                }).then(()=>{

                    let data = {
                        self_id: parseInt(LocalStorage.get('self_id')),
                        sess: LocalStorage.get('sess'),
                        idempotent: new Date().getTime(),
                        user_id:this.$route.query.id,
                        user_name:this.user.user_name
                    }

                    var _this = this;
                    _this.$http.post(`${this.url}/valid_reset`,qs.stringify(data)).then((resp)=>{
                        console.log(resp)
                        if (resp.ret_code === 0) {
                            _this.pwd_res = true
                            _this.user.pwd = resp.ret_data.password
                            let canvas = document.getElementById('canvas')
                            QRCode.toCanvas (canvas, resp.ret_data.link, function (error) {
                                if(error) {
                                    console.log(error);
                                    _this.qr_res = false
                                    _this.$message({
                                        message:'谷歌二维码生成失败',
                                        type: 'error',
                                        center: true
                                    })
                                    return
                                }
                                _this.qr_res = true
                                console.log('QRCode success!');
                            })
                        } else {
                            _this.pwd_res = false
                            _this.$message({
                                message:resp.ret_msg,
                                type: 'error',
                                center: true
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
                }).catch(()=>{
                    this.$message({
                        type: 'info',
                        message: '已取消重置'
                    });
                })



            }
        },


        created() {

            let data = {
                self_id: parseInt(LocalStorage.get('self_id')),
                sess: LocalStorage.get('sess'),
                idempotent: new Date().getTime(),
                user_id:this.$route.query.id
            }

            var _this = this
            _this.$http.post(`${_this.url}/get_user`,qs.stringify(data)).then((resp)=>{

                if(resp.ret_code >= 0) {
                    _this.user.user_name = resp.ret_data.user_name
                    _this.user.regist_time = formatDate(resp.ret_data.regist_time)
                    _this.role.role_id = resp.ret_data.role_id
                    _this.role.role_name = resp.ret_data.role_name
                    _this.role.role_desc = resp.ret_data.role_desc
                    _this.beforeVal = resp.ret_data.role_id
                    _this.link = resp.ret_data.link
                    let canvas = document.getElementById('canvas')
                    QRCode.toCanvas (canvas, _this.link, function (error) {
                        if(error) {
                            console.log(error);
                            _this.qr_res = false
                            _this.$message({
                                message:'谷歌二维码生成失败',
                                type: 'error',
                                center: true
                            })
                            return
                        }
                        _this.qr_res = true
                        console.log('QRCode success!');
                    })

                    if (resp.ret_data.auth_list !== undefined) {
                        var arr = resp.ret_data.auth_list,newData = [],obj = {};
                        for(var i=0;i<arr.length;i++) {
                            obj = arr[i]
                            obj['id'] = 'p'+obj['id'];
                            if(arr[i]['auth2_list'] !== undefined) {
                                for(var j=0;j<obj['auth2_list'].length;j++) {
                                    obj['auth2_list'][j]['id'] = 'c'+obj['auth2_list'][j]['id'];
                                }
                            }
                            newData.push(obj)
                        }
                        _this.auth_list = newData
                    }else{
                        _this.auth_list = []
                    }
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


            let data2 = {
                self_id: LocalStorage.get('self_id'),
                sess: LocalStorage.get('sess'),
                idempotent: new Date().getTime()
            }

            //获取角色列表
            _this.$http.post(`${_this.url}/get_role_list`,qs.stringify(data2)).then((resp)=>{

                if(resp.ret_code >= 0) {

                    let res = resp.ret_data,obj={},new_arr=[]
                    if(res) {
                        for(var i=0;i<res.length;i++) {
                            obj={id:res[i]['role_id'],name:res[i]['role_name']}
                            new_arr.push(obj)
                        }
                        _this.role_arr = new_arr
                    }else {
                        _this.role_arr = []
                    }

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
        }
    }
</script>
