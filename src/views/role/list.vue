<template>
  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;">
    <div class="app-container">

      <div class="filter-container">
        <el-button   type="primary" icon="el-icon-plus" style="margin-bottom: 15px" @click="addRole">
          新增
        </el-button>
      </div>

      <el-table
        border fit highlight-current-row style="width: 100%"
        :data="role_list"
        row-key="role_id"
        :default-sort = "{prop: 'role_id', order: 'descending'}"
      >


        <el-table-column
          min-width="10%"
          align="center"
          sortable
          prop="role_id"
          label="序号"
        >
          <template slot-scope="{row}">
            {{row.role_id}}
          </template>
        </el-table-column>


        <el-table-column
          min-width="23%"
          prop="role_name"
          label="角色名称"
          align="center"
        >
          <template slot-scope="{row}">
            <template v-if="row.edit">
              <el-input v-model="row.role_name"  class="edit-input" size="small" />
            </template>
<!--            <el-link v-else type="primary" @click="getRoleDetail(row.role_id,row.role_name,row.role_desc)">-->
            <el-link v-else type="primary" @click="handleAuth(row)">

              {{ row.role_name }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column
          min-width="23%"
          prop="role_desc"
          label="描述"
          align="center"
        >
          <template slot-scope="{row}">
            <template v-if="row.edit">
              <el-input v-model="row.role_desc" class="edit-input" size="small" />
            </template>
            <span v-else>{{ row.role_desc }}</span>
          </template>
        </el-table-column>


        <el-table-column
          min-width="23%"
          prop="state"
          label="状态"
          align="center"
        >
          <template slot-scope="{row}">
            <!--编辑状态下不可改变状态-->
            <el-switch
              :disabled=row.edit
              v-model="row.state"
              @change="changeState(row)"
            >
            </el-switch>
          </template>

        </el-table-column>

        <el-table-column
          min-width="23%"
          label="操作"
          align="center"
        >
          <template slot-scope="{row}">

            <el-button
              v-if="row.edit"
              type="success"
              size="small"
              @click="confirmEdit(row)">
              Ok
            </el-button>
            <el-button
              v-else
              type="primary"
              size="small"
              @click="startEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteRow(row)"
            >
              删除
            </el-button>
<!--            <el-button-->
<!--              type="primary"-->
<!--              size="small"-->
<!--              @click="handleAuth(row)"-->
<!--            >-->
<!--              编辑-->
<!--            </el-button>-->
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="dialogVisible" title="编辑权限" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form :model="role" label-width="80px" label-position="left">
          <el-form-item label="角色名称">
            <el-input v-model="role.role_name" placeholder="Role Name" readonly/>
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              v-model="role.role_desc"
              :autosize="{ minRows: 2, maxRows: 4}"
              type="textarea"
              placeholder="Role Description"
              readonly
            />
          </el-form-item>
          <el-form-item label="权限">
            <el-tree
              default-expand-all
              ref="tree"
              :check-strictly="checkStrictly"
              :data="auths"
              :props="defaultProps"
              show-checkbox
              node-key="id"
              class="permission-tree"
            />
          </el-form-item>
        </el-form>
        <div style="text-align:right;">
          <el-button type="danger" @click="dialogVisible=false">取消</el-button>
          <el-button type="primary" @click="confirmRole">确定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>

    let Base64 = require('js-base64').Base64;
    import {LocalStorage} from '@/utils/storage'
    import qs from 'qs'

    export default {
        name:'List',
        data() {
            return {
                role:{
                    role_id:'',
                    role_name:'',
                    role_desc:''
                },
                auths:[],
                checkStrictly: false,
                dialogVisible: false,
                defaultProps: {
                    children: 'auth2_list',
                    label: 'name'
                },
                role_list: []
            }
        },

        methods: {

            generateArr(auths) {

                let data = [];
                auths.forEach(item => {

                    data.push(item);
                    if (item.auth2_list) {
                        const temp = this.generateArr(item.auth2_list);
                        if (temp.length > 0) {
                            data = [...data, ...temp]
                        }
                    }
                });

                return data
            },

            handleAuth(row) {

                this.role.role_id = row.role_id;
                this.role.role_name = row.role_name;
                this.role.role_desc = row.role_desc;
                this.dialogVisible = true;
                this.checkStrictly = true;

                let data = {
                    self_id: LocalStorage.get('self_id'),
                    idempotent: new Date().getTime(),
                    sess: LocalStorage.get('sess'),
                    role_id: row.role_id
                };

                this.$http.post(`${this.url}/get_role`,qs.stringify(data)).then((resp) => {

                    if (resp.ret_code >= 0) {

                        let res = resp.ret_data

                        if (res) {

                            var tmp_data = res.filter((item)=>{
                                return item.checked > 0
                            });

                            for (var i=0;i<tmp_data.length;i++) {

                                if (tmp_data[i]['auth2_list'] !== undefined) {

                                    var tmp_auth = tmp_data[i]['auth2_list'].filter((item2)=>{

                                        return item2['checked'] > 0

                                    });

                                    tmp_data[i]['auth2_list'] = tmp_auth
                                }
                            }

                            this.$nextTick(() => {

                                var new_data = [],obj={};

                                for (var j=0;j<tmp_data.length;j++) {

                                    obj = tmp_data[j];
                                    obj['id'] = 'p' + obj['id'];

                                    if (tmp_data[j]['auth2_list'] !== undefined) {

                                        for (var k=0;k<obj['auth2_list'].length;k++) {
                                            obj['auth2_list'][k]['id'] = 'c' + obj['auth2_list'][k]['id']
                                        }
                                    }
                                    new_data.push(obj)
                                }

                                this.$refs.tree.setCheckedNodes(this.generateArr(new_data));
                                this.checkStrictly = false
                            })

                        }

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

            confirmRole() {

                const checkedKeys = this.$refs.tree.getCheckedKeys();
                const half = this.$refs.tree.getHalfCheckedKeys();
                const allChecked = checkedKeys.concat(half);

                if (this.auths.length === 0) {
                    this.msgTip('请先配置权限')
                } else if(allChecked.length === 0) {
                    this.msgTip('请勾选权限')
                } else {

                    let newData = [],obj = {};

                    for (var i=0;i<this.auths.length;i++) {

                        let tmp = this.auths[i]

                        if (tmp['id'].includes('p')) {
                            //父节点
                            if (allChecked.includes(tmp['id'])) {
                                //要么存在父节点，要么一个未选
                                //此时该父节点存在,判断是否有子节点，若有则找出来位或val，若没有val写为8
                                if (tmp['auth2_list'] !== undefined) {
                                    let count = 0
                                    for (var j=0;j<tmp['auth2_list'].length;j++) {

                                        if (allChecked.includes(tmp['auth2_list'][j]['id'])) {
                                            count = count + parseInt(tmp['auth2_list'][j]['val'])
                                        }
                                        obj = { id:parseInt(tmp['id'].substr(1)),val:count}
                                    }
                                } else {
                                    //没有子节点
                                    obj = { id:parseInt(tmp['id'].substr(1)),val:8}
                                }
                                newData.push(obj)
                            }
                        }
                    }

                    let data = {
                        self_id: LocalStorage.get('self_id'),
                        sess: LocalStorage.get('sess'),
                        idempotent: new Date().getTime(),
                        role_id: this.role.role_id,
                        auth_list:JSON.stringify(newData)
                    };

                    this.$http.post(`${this.url}/add_role_auth_rel`,qs.stringify(data)).then((resp)=>{
                        if (resp.ret_code >= 0) {
                            this.$message({
                                message:'配置成功',
                                type:'success',
                                center:true
                            });

                            this.dialogVisible = false
                        } else {
                            this.msgTip(resp.ret_msg)
                        }
                    }).catch((error)=>{
                        if (error !== 'loginErr') {
                            console.log(error);
                            this.msgTip('系统繁忙，请稍后重试')
                        }
                    })

                }
            },

            addRole() {
                this.$router.push({path: '/role/add'})
            },

            getRoleDetail(role_id,role_name,role_desc) {
                this.$router.push({path: '/role/edit', query: {role_id:role_id,role_name:Base64.encode(role_name),role_desc:Base64.encode(role_desc)}})
            },

            startEdit(row) {
                row.edit = true
            },

            changeState(row) {

                let data = {
                    self_id: LocalStorage.get('self_id'),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    id: row.role_id,
                    name: row.role_name,
                    desc: row.role_desc,
                    state: row.state ? 1 : 0,
                };

                this.$http.post(`${this.url}/mod_role`,qs.stringify(data)).then((resp)=> {

                    if (resp.ret_code >= 0) {
                        this.$message({
                            message:resp.ret_msg,
                            type:'success',
                            center:true
                        })
                    } else {
                        row.state = !row.state;
                        this.msgTip(resp.ret_msg)
                    }
                }).catch((error)=>{
                    row.state = !row.state;
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

            checkRule(row) {

                if (row.role_name.replace(/\s/g,"").length ===0) {
                    this.msgTip('角色名称不能为空');
                    return false;
                }

                if (row.role_name.includes(';') || row.role_name.includes('|')) {
                    this.msgTip('角色名称不能包含特殊字符');
                    return false;
                }

                if (row.role_desc.replace(/\s/g,"").length ===0 ) {
                    this.msgTip('角色描述不能为空');
                    return false;
                }

                if (row.role_desc.includes(';') || row.role_desc.includes('|')) {
                    this.msgTip('角色描述不能包含特殊字符');
                    return false;
                }

                return true;
            },

            confirmEdit(row) {

                if (this.checkRule(row)) {

                    let data = {
                        self_id: LocalStorage.get('self_id'),
                        sess: LocalStorage.get('sess'),
                        idempotent: new Date().getTime(),
                        id: row.role_id,
                        name: row.role_name,
                        desc: row.role_desc,
                        state: row.state ? 1 : 0,
                    };

                    this.$http.post(`${this.url}/mod_role`,qs.stringify(data)).then((resp) => {

                        if (resp.ret_code >= 0) {
                            row.edit = false
                            this.$message({
                                message:resp.ret_msg,
                                type:'success',
                                center:true
                            })

                        } else {
                            row.edit = true;
                            this.msgTip(resp.ret_msg)
                        }
                    }).catch((error) => {
                        row.edit = true;
                        if (error !== 'loginErr') {
                            console.log(error);
                            this.msgTip('系统繁忙，请稍后重试')
                        }
                    })
                }
            },

            deleteRow(row) {

                this.$confirm('此操作将彻底删除该角色，是否继续？','提示',{
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    closeOnClickModal:false,
                    closeOnPressEscape:false,
                }).then(() => {

                    let data = {
                        self_id: LocalStorage.get('self_id'),
                        sess: LocalStorage.get('sess'),
                        idempotent: new Date().getTime(),
                        id: row.role_id,
                    };

                    this.$http.post(`${this.url}/rmv_role`,qs.stringify(data)).then((resp) => {

                        if (resp.ret_code >= 0) {
                            const index = this.role_list.indexOf(row)
                            this.role_list.splice(index, 1)
                            this.$message({
                                message:'删除成功',
                                type:'success',
                                center:true
                            })
                        } else {
                            this.msgTip(resp.ret_msg)
                        }
                    }).catch((error) => {
                        if (error !== 'loginErr') {
                            console.log(error);
                            this.msgTip('系统繁忙，请稍后重试')
                        }
                    })

                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                })
            },

            //获取角色列表
            getRoles() {

                let data = {
                    self_id: LocalStorage.get('self_id'),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime()
                };

                this.$http.post(`${this.url}/get_role_list`,qs.stringify(data)).then((resp) => {
                    if (resp.ret_code >= 0) {
                        if (resp.ret_data) {
                            var arr = resp.ret_data,newData = [],obj = {};
                            for (var i=0;i<arr.length;i++) {

                                obj = arr[i]
                                obj['edit'] = false;
                                obj['state'] = obj['state'] === 1;
                                newData.push(obj)
                            }
                            this.role_list = newData;
                        } else {
                            this.role_list = [];
                        }
                    } else {
                        this.msgTip(resp.ret_msg)
                    }

                }).catch((error) => {
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })
            },

            getAuths() {

                let data = {
                    self_id: LocalStorage.get('self_id'),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime()
                };

                this.$http.post(`${this.url}/get_auth_list`,qs.stringify(data)).then((resp) => {

                    if (resp.ret_code >= 0) {

                        if (resp.ret_data) {

                            var arr = resp.ret_data,newData = [],obj = {};
                            for (var i=0;i<arr.length;i++) {

                                obj = arr[i];
                                obj['id'] = 'p'+obj['id'];
                                if (arr[i]['auth2_list'] !== undefined) {
                                    for (var j=0;j<obj['auth2_list'].length;j++) {
                                        obj['auth2_list'][j]['id'] = 'c'+obj['auth2_list'][j]['id'];
                                    }
                                }
                                newData.push(obj)
                            }
                            this.auths = newData;
                        } else {
                            this.auths = [];
                        }

                    } else {
                        this.$message({
                            message:resp.ret_msg,
                            type:'error',
                            center:true
                        })
                    }

                }).catch((error) => {
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.msgTip('系统繁忙，请稍后重试')
                    }
                })
            }
        },

        created() {
            this.getRoles()
            this.getAuths()
        }
    }
</script>
