<template>
  <div class="app-container">
    <el-table
      border fit highlight-current-row style="width: 100%"
      :data="tableData"
      row-key="id"
      :tree-props="{children: 'auth2_list', hasChildren: 'hasChildren'}"
    >


      <el-table-column
        min-width="300px"
        prop="name"
        label="菜单名称"
        sortable
      >
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.name"  class="edit-input" size="small" />
          </template>
          <span v-else>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="desc"
        label="描述"
        width="180">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.desc" class="edit-input" size="small" />
          </template>
          <span v-else>{{ row.desc }}</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="url"
        label="url"
        width="180">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.url" class="edit-input" size="small" />
          </template>
          <span v-else>{{ row.url }}</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="state"
        label="状态"
        width="180">
        <template slot-scope="{row}">
          <!--编辑状态下不可改变状态-->
          <el-switch
            :disabled=row.edit
            v-model="row.state"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="changeState(row)"
          >
          </el-switch>
        </template>

      </el-table-column>

      <el-table-column
        label="操作"
        align="right">
        <!--        <template slot-scope="scope">-->

        <!--          <el-button-->
        <!--            size="mini"-->
        <!--            @click="handleEdit(scope.$index, scope.row)">编辑</el-button>-->
        <!--          <el-button-->
        <!--            size="mini"-->
        <!--            type="danger"-->
        <!--            @click="handleDelete(scope.$index, scope.row)">删除</el-button>-->
        <!--        </template>-->

        <template slot-scope="{row}">
          <el-button
            v-if="row.f"
            type="success"
            size="small"
            @click="addChild(row)">
            添加子权限
          </el-button>
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
          <!--          <el-button-->
          <!--            v-if="row.edit"-->
          <!--            type="success"-->
          <!--            size="small"-->
          <!--            icon="el-icon-circle-check-outline"-->
          <!--            @click="confirmEdit(row)"-->
          <!--          >-->
          <!--            Ok-->
          <!--          </el-button>-->
          <!--          <el-button-->
          <!--            v-else-->
          <!--            type="primary"-->
          <!--            size="small"-->
          <!--            icon="el-icon-edit"-->
          <!--            @click="row.edit=!row.edit"-->
          <!--          >-->
          <!--            Edit-->
          <!--          </el-button>-->
          <el-button
            type="danger"
            size="small"
            @click="deleteRow(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
    import {LocalStorage} from '@/utils/storage'
    import qs from 'qs'
    export default {
        name:'List',
        data() {
            return {
                tableData: []
            }
        },
        methods: {

            addChild(row) {
                this.$router.push({path: '/permission/add', query: {fid: row.id,activeId:2}})
            },
            startEdit(row) {
                row.edit = true
            },

            getPostData(row) {
                let data = {
                    user_id: LocalStorage.get('user_id'),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    id: row['id'].substr(1),
                    name: row.name,
                    desc: row.desc,
                    state: row.state ? 1 : 0,
                    url:row.url.replace(/\s/g,"").length===0
                        ? "javascript:void(0);"
                        : row.url.replace(/\s/g,"")
                };
                let post_url='';

                if(row['id'].includes('p')) {
                    post_url = 'mod_auth'
                }else {
                    data['val'] = row.val;
                    post_url = 'mod_auth2'
                }
                return {post_url,data}
            },

            changeState(row) {
                let postData = this.getPostData(row);
                this.$http.post(postData.post_url,qs.stringify(postData.data)).then((resp)=> {
                    if(resp.ret_code >= 0) {
                        this.$message({
                            message:resp.ret_msg,
                            type:'success',
                            center:true
                        })
                    }else {
                        row.state = !row.state
                        this.$message({
                            message:resp.ret_msg,
                            type:'error',
                            center:true
                        })
                    }
                }).catch((err)=>{
                    console.log(err)
                    row.state = !row.state
                    this.$message({
                        message:'系统繁忙，请稍后重试',
                        type:'error',
                        center:true
                    })
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

                if(row.name.replace(/\s/g,"").length ===0) {
                    this.msgTip('权限名称不能为空')
                    return false;
                }

                if(row.name.includes(';') || row.name.includes('|')) {
                    this.msgTip('权限名称不能包含特殊字符')
                    return false;
                }

                if(row.desc.replace(/\s/g,"").length ===0 ) {
                    this.msgTip('权限描述不能为空')
                    return false;
                }

                if(row.desc.includes(';') || row.desc.includes('|')) {
                    this.msgTip('权限描述不能包含特殊字符')
                    return false;
                }

                //二级权限  url必填
                const reg = /^[a-zA-Z/]+$/
                if(row['id'].includes('c')) {
                    if(row.url.replace(/\s/g,"").length ===0) {
                        this.msgTip('权限url不能为空')
                        return false;
                    }else if(!reg.test(row.url)) {
                        this.msgTip('url格式错误')
                        return false;
                    }
                }else {
                    if(row.url.replace(/\s/g,"").length>0 && !reg.test(row.url)) {
                        this.msgTip('url格式错误')
                        return false;
                    }
                }

                return true;

            },
            confirmEdit(row) {
                if(this.checkRule(row)) {
                    row.edit = false
                    let postData = this.getPostData(row);
                    this.$http.post(postData.post_url,qs.stringify(postData.data)).then((resp)=> {
                        if(resp.ret_code === 0) {
                            this.$message({
                                message:resp.ret_msg,
                                type:'success',
                                center:true
                            })
                        }else {
                            this.$message({
                                message:resp.ret_msg,
                                type:'error',
                                center:true
                            })
                        }
                    }).catch((err)=>{
                        console.log(err)
                        this.$message({
                            message:'系统繁忙，请稍后重试',
                            type:'error',
                            center:true
                        })
                    })
                }
            },

            deleteRow(row) {
                this.$confirm('此操作将彻底删除该权限，是否继续？','提示',{
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    closeOnClickModal:false,
                    closeOnPressEscape:false,
                    type: 'warning'
                }).then(()=>{
                    let data = {
                        user_id: LocalStorage.get('user_id'),
                        sess: LocalStorage.get('sess'),
                        idempotent: new Date().getTime(),
                        id: row['id'].substr(1),
                    }
                    let postUrl = row['id'].includes('p') ? 'rmv_auth' : 'rmv_auth2'
                    this.$http.post(postUrl,qs.stringify(data)).then((resp)=> {
                        if(resp.ret_code === 0) {
                            const index = this.tableData.indexOf(row)
                            this.tableData.splice(index, 1)
                            this.$message({
                                message:'删除成功',
                                type:'success',
                                center:true
                            })
                        }else {
                            this.$message({
                                message:resp.ret_msg,
                                type:'error',
                                center:true
                            })
                        }
                    }).catch((err)=>{
                        console.log(err)
                        this.$message({
                            message:'系统繁忙，请稍后重试',
                            type:'error',
                            center:true
                        })
                    })

                }).catch(()=>{
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                })
            }
        },
        created() {
            this.$http.post('get_auth_list',qs.stringify({r:Date.now()})).then((resp)=>{
                // let res = [
                //     {
                //         id: 1,
                //         name: '商户平台',
                //         desc: '商户管理权限',
                //         url:'',
                //         state:1
                //     }, {
                //         id: 2,
                //         name: '会员管理',
                //         desc: '会员管理权限',
                //         url:'',
                //         state:0
                //     },{
                //         id: 3,
                //         name: '管理员',
                //         desc: '平台管理员(最高权限)',
                //         url:'',
                //         state:0,
                //         auth2_list:[{
                //             id: 4,
                //             name: '商户状态管理',
                //             desc: '对商户的状态(开启/禁用)管理',
                //             url:'aaaaa',
                //             state:1,
                //             val:2
                //         },{
                //             id: 5,
                //             name: '商户查询',
                //             desc: '查询商户列表与商户详情',
                //             url:'bbbbb',
                //             state:1,
                //             val:4
                //         },]
                //     }
                // ]
                console.log(resp)
                if(resp.ret_code ===0) {
                    if(resp.ret_data) {
                        var arr = resp.ret_data,newData = [],obj = {};
                        for(var i=0;i<arr.length;i++) {
                            obj = arr[i]
                            obj['edit'] = false;
                            obj['state'] = obj['state'] == 1 ? true : false;
                            obj['f'] = true;
                            //obj['change'] = false;
                            obj['id'] = 'p'+obj['id'];
                            if(arr[i]['auth2_list'] !== undefined) {

                                obj['children'] = arr[i]['auth2_list']
                                delete obj['auth2_list']
                                for(var j=0;j<obj['children'].length;j++) {
                                    obj['children'][j]['id'] = 'c'+obj['children'][j]['id'];
                                    obj['children'][j]['edit'] = false;
                                    obj['children'][j]['state'] = obj['children'][j]['state'] ==1 ? true : false;
                                    // obj['children'][j]['change'] = false;
                                }
                            }
                            newData.push(obj)
                        }
                        console.log(newData)
                        this.tableData = newData;
                    }else {
                        this.tableData = null;
                    }

                }else {
                    this.$message({
                        message:resp.ret_msg,
                        type:'error',
                        center:true
                    })
                }

            }).catch((error)=>{
                console.log(error)
                this.$message({
                    message:'系统繁忙，请稍后重试',
                    type:'error',
                    center:true
                })
            })
        }
    }
</script>
