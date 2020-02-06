<template>
  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;">
    <div class="app-container" >

      <div class="filter-container">
        <el-button v-waves  type="primary" style="margin-bottom: 15px" @click="addAuth" icon="el-icon-plus">
          新增
        </el-button>
      </div>

      <el-table
        border  highlight-current-row style="width: 100%"
        :data="tableData"
        row-key="id"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        :header-cell-style="headerStyle"
      >


        <el-table-column
          min-width="20%"
          prop="name"
          label="菜单名称"
        >
          <template slot-scope="{row}">
            <template v-if="row.edit">
              <el-input v-model="row.name"  class="edit-input" size="small" />
            </template>
            <span v-else style="margin-left: 8px">{{row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="desc"
          label="描述"
          align="center"
          min-width="20%">
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
          align="center"
          min-width="20%">
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
          align="center"
          min-width="20%">
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
          label="操作"
          min-width="20%"
          align="center"
        >

          <template slot-scope="{row}">
            <el-button
              v-if="row.f"
              type="success"
              size="small"
              @click="addChild(row)">
              添加子权限
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
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

          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="dialogVisible" title="编辑权限" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form :model="auth" label-width="80px" ref="auth" label-position="left">
          <el-form-item label="权限名称">
            <el-input v-model="auth.name" placeholder="请输入权限名称" maxLength="16"/>
          </el-form-item>
          <el-form-item label="权限描述">
            <el-input
              v-model="auth.desc"
              :autosize="{ minRows: 2, maxRows: 4}"
              type="textarea"
              placeholder="请输入权限描述"
              maxLength="200"
            />
          </el-form-item>
          <el-form-item label="URL">
<!--            <el-input v-model="auth.url" placeholder="请输入url" />-->
            <el-col :span="12" >
              <el-autocomplete
                v-if="auth.id.includes('p')"
                popper-class="my-autocomplete"
                v-model="auth.url"
                :fetch-suggestions="querySearch"
                placeholder="请填写URL"
                style="width:840px"
              >
                <i
                  slot="suffix"
                >
                </i>
                <template slot-scope="{ item }">
                  <div class="name">{{ item.value }}<span>&nbsp;&nbsp;&nbsp;</span><span class="addr">{{ item.desc }}</span></div>

                </template>
              </el-autocomplete>
              <el-autocomplete
                v-else
                popper-class="my-autocomplete"
                v-model="auth.url"
                :fetch-suggestions="querySearch2"
                placeholder="请填写URL"
                style="width:840px"
              >
                <i
                  slot="suffix"
                >
                </i>
                <template slot-scope="{ item }">
                  <div class="name">{{ item.value }}<span>&nbsp;&nbsp;&nbsp;</span><span class="addr">{{ item.desc }}</span></div>

                </template>
              </el-autocomplete>
            </el-col>
          </el-form-item>

          <el-form-item>
            <div style="text-align:right;">
              <el-button type="danger" @click="dialogVisible=false">取消</el-button>
              <el-button type="primary" @click="submitEdit">确定</el-button>
            </div>
          </el-form-item>

        </el-form>

      </el-dialog>
    </div>
  </div>

</template>
<script>

    import {LocalStorage} from '@/utils/storage'
    import qs from 'qs'
    import {main_url,child_url} from '@/utils/url'

    export default {
        name:'List',
        data() {
            return {
                main_url: main_url,
                child_url: child_url,
                auth:{
                    id:'',
                    name:'',
                    desc:'',
                    url:'',
                    state:''
                },
                dialogVisible: false,
                is_show:false,
                tableData: []
            }
        },

        methods: {

            querySearch(queryString, cb) {
                var urls = this.main_url
                var results = queryString ? urls.filter(this.createFilter(queryString)) : urls;
                cb(results);
            },
            querySearch2(queryString, cb) {
                var urls = this.child_url;
                var results = queryString ? urls.filter(this.createFilter(queryString)) : urls;
                cb(results);
            },
            createFilter(queryString) {
                return (restaurant) => {
                    return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
                };
            },
            headerStyle({row, column, rowIndex, columnIndex}) {

                if (rowIndex === 0) {
                    return `
                      text-align:center
                      `
                }
            },

            handleEdit(row) {
                this.auth.val = row.val ? row.val : 0;
                this.auth.id = row.id;
                this.auth.name = row.name;
                this.auth.desc = row.desc;
                this.auth.url = row.url;
                this.auth.state = row.state;
                this.dialogVisible = true
            },

            submitEdit() {

                if (this.checkRule(this.auth)) {

                    let postData = this.getPostData(this.auth);

                    this.$http.post(`${this.url}/${postData.post_url}`,qs.stringify(postData.data)).then((resp)=> {

                        if (resp.ret_code >= 0) {

                            this.$message({
                                message:resp.ret_msg,
                                type:'success',
                                center:true
                            });

                            for (var i=0;i<this.tableData.length;i++) {

                                if (this.auth.id.includes('p')) {

                                    if (this.tableData[i]['id'] === this.auth.id) {
                                        this.tableData[i]['name'] = this.auth.name;
                                        this.tableData[i]['desc'] = this.auth.desc;
                                        this.tableData[i]['url'] = this.auth.url
                                    }
                                } else {

                                    if (this.tableData[i]['children'] !== undefined) {

                                        for (var j=0;j<this.tableData[i]['children'].length;j++) {
                                            if (this.tableData[i]['children'][j]['id'] === this.auth.id) {
                                                this.tableData[i]['children'][j]['name'] = this.auth.name;
                                                this.tableData[i]['children'][j]['desc'] = this.auth.desc;
                                                this.tableData[i]['children'][j]['url'] = this.auth.url
                                            }
                                        }
                                    }
                                }

                            }

                            this.dialogVisible = false
                        }else {
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

            addAuth() {
                this.$router.push({path: '/auth/add'})
            },

            addChild(row) {
                //this.$router.push({path: '/auth/add', query: {fid: row.id.substr(1),activeId:2}})
                this.$router.push({name: 'Add', params: {fid: row.id.substr(1),activeId:2}})
            },

            getPostData(row) {

                let data = {
                    self_id: LocalStorage.get('self_id'),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    id: parseInt(row['id'].substr(1)),
                    name: row.name,
                    desc: row.desc,
                    state: row.state ? 1 : 0,
                    url:row.url.replace(/\s/g,"").length===0
                        ? "javascript:void(0);"
                        : row.url.replace(/\s/g,"")
                };

                let post_url='';

                if (row['id'].includes('p')) {

                    post_url = 'mod_auth'
                } else {

                    data['val'] = row.val;
                    post_url = 'mod_auth2'
                }
                return {post_url,data}
            },

            changeState(row) {

                let postData = this.getPostData(row);
                this.$http.post(`${this.url}/${postData.post_url}`,qs.stringify(postData.data)).then((resp)=> {

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

                if (row.name.replace(/\s/g,"").length === 0) {
                    this.msgTip('权限名称不能为空');
                    return false;
                }

                if (row.name.includes(';') || row.name.includes('|')) {
                    this.msgTip('权限名称不能包含特殊字符');
                    return false;
                }

                if (row.desc.replace(/\s/g,"").length ===0 ) {
                    this.msgTip('权限描述不能为空');
                    return false;
                }

                if (row.desc.includes(';') || row.desc.includes('|')) {
                    this.msgTip('权限描述不能包含特殊字符');
                    return false;
                }

                //二级权限  url必填
                // const reg = /^[a-zA-Z0-9/_]+$/
                // if(row['id'].includes('c')) {
                //     if(row.url.replace(/\s/g,"").length ===0) {
                //         this.msgTip('权限url不能为空')
                //         return false;
                //     }else if(!reg.test(row.url)) {
                //         this.msgTip('url格式错误')
                //         return false;
                //     }
                // }else {
                //     if(row.url.replace(/\s/g,"").length>0 && !reg.test(row.url)) {
                //         this.msgTip('url格式错误')
                //         return false;
                //     }
                // }

                //一级二级全都必填 url
                // const reg = /^[a-zA-Z0-9/_]+$/
                // if(row.url.replace(/\s/g,"").length ===0) {
                //     this.msgTip('权限url不能为空')
                //     return false;
                // }else if(!reg.test(row.url)) {
                //     this.msgTip('url格式错误')
                //     return false;
                // }

                if (row['id'].includes('p')) {

                    let res = this.checkUrl(this.main_url,row.url)
                    if (!res) {
                        this.msgTip('url错误')
                        return false;
                    }
                } else {
                    let res = this.checkUrl(this.child_url,row.url)
                    if (!res) {
                        this.msgTip('url错误')
                        return false;
                    }
                }

                return true;

            },

            checkUrl(val,url) {

                return val.some((item) => {
                    return item.value === url
                })
            },


            deleteRow(row) {

                this.$confirm('此操作将彻底删除该权限，是否继续？','提示',{
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
                        id: parseInt(row['id'].substr(1)),
                    };

                    let postUrl = row['id'].includes('p') ? 'rmv_auth' : 'rmv_auth2';

                    this.$http.post(`${this.url}/${postUrl}`,qs.stringify(data)).then((resp)=> {

                        if (resp.ret_code >= 0) {

                            if (row.id.includes('c')) {

                                for (var i=0;i<this.tableData.length;i++) {

                                    if (this.tableData[i]['children'] !== undefined) {
                                        const index =  this.tableData[i]['children'].indexOf(row)
                                        if (index >= 0) {
                                            this.tableData[i]['children'].splice(index,1)
                                        }
                                    }
                                }

                            } else {
                                const index = this.tableData.indexOf(row)
                                this.tableData.splice(index, 1)
                            }

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
            }
        },


        created() {

            let data = {
                self_id: LocalStorage.get('self_id'),
                sess: LocalStorage.get('sess'),
                idempotent: new Date().getTime()
            };

            this.$http.post(`${this.url}/get_auth_list`,qs.stringify(data)).then((resp) => {

                if (resp.ret_code >= 0) {

                    if (resp.ret_data) {

                        var arr = resp.ret_data.sort(function (a,b) {
                            var value1 = a['id'];
                            var value2 = b['id'];
                            return value1 - value2;
                        }),newData = [],obj = {};

                        for (var i=0;i<arr.length;i++) {

                            obj = arr[i];
                            obj['edit'] = false;
                            obj['state'] = obj['state'] === 1 ;
                            obj['f'] = true;
                            obj['url'] = obj['url'] === 'javascript:void(0);' ? '' : obj['url'];
                            obj['id'] = 'p'+obj['id'];

                            if (arr[i]['auth2_list'] !== undefined) {

                                obj['children'] = arr[i]['auth2_list'];
                                delete obj['auth2_list'];

                                for (var j=0;j<obj['children'].length;j++) {
                                    obj['children'][j]['id'] = 'c'+obj['children'][j]['id'];
                                    obj['children'][j]['edit'] = false;
                                    obj['children'][j]['state'] = obj['children'][j]['state'] === 1;
                                }
                            }

                            newData.push(obj)
                        }



                        this.tableData = newData;

                    } else {

                        this.tableData = [];
                    }

                }else {

                    this.msgTip(resp.ret_msg)
                }

            }).catch((error)=>{
                if (error !== 'loginErr') {
                    console.log(error);
                    this.msgTip('系统繁忙，请稍后重试')
                }
            })
        }
    }
</script>
<style scoped>
  li {
    line-height: normal;
    padding: 7px;
  }
  .name {
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .addr {
    font-size: 12px;
    color: #b4b4b4;
  }
  .highlighted .addr {
    color: #ddd;
  }
</style>

