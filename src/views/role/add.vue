<template>

  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;"
  >
    <div class="app-container">

      <el-steps
        :active="active"
        :space="500"
        finish-status="success"
        align-center
        style="margin-top: 30px"
      >
        <el-step title="添加角色"></el-step>
        <el-step title="配置权限"></el-step>
        <el-step title="配置成功"></el-step>
      </el-steps>

      <el-form ref="onePerForm" :model="onePerForm" :rules="onePerRules"  v-if="active===1">

        <div style="display: flex;flex-direction: column;align-items: center;margin-top: 50px">

          <el-form-item   style="width: 600px" prop="Oname">
            <el-input  maxlength="10" placeholder="请填写角色名称" v-model="onePerForm.Oname"/>
          </el-form-item>


          <el-form-item   style="width: 600px;margin-top: 20px" prop="Odesc">
            <el-input  maxlength="20" :rows="4" placeholder="请填写描述信息" type="textarea" v-model="onePerForm.Odesc"/>
          </el-form-item>

          <el-form-item style="width: 600px;margin-top: 20px">
            <el-button type="primary"  style="width: 100%" @click="toConfig" >下一步</el-button>
          </el-form-item>
        </div>

      </el-form>

      <el-form   v-if="active===2">
        <div style="display: flex;flex-direction: column;align-items:center;margin-top: 50px">
          <el-form-item>
            <el-tree
              ref="tree"
              :data="permit_tree"
              :props="defaultProps"
              show-checkbox
              node-key="id"
              class="permission-tree"
              default-expand-all
            />
          </el-form-item>
          <el-form-item >
            <el-button type="primary"   @click="configSubmit">下一步</el-button>
          </el-form-item>
        </div>

      </el-form>

      <el-form v-if="active===3">
        <div style="display: flex;flex-direction: column;align-items: center;margin-top: 50px">
          <el-alert style="width:50%;height: 200px"
                    :closable="closable"
                    center
                    title="您已成功配置角色"
                    type="success"
                    show-icon>
          </el-alert>
          <el-button type="success"   @click="toList" style="width: 10%;margin-top: 30px">完成</el-button>
        </div>
      </el-form>
    </div>
  </div>

</template>
<script>
    import {LocalStorage} from '@/utils/storage'
    import qs from 'qs'
    export default {
        name:'Add',
        data() {
            var validateName = (rule, value, callback) => {
                if (value.replace(/\s/g,"") === '') {
                    callback(new Error('角色名称不能为空'));
                }else if(value.includes(';') || value.includes('|')) {
                    callback(new Error('角色名称不能有特殊字符'));
                }else {
                    callback();
                }
            };
            var validateDesc = (rule, value, callback) => {
                if (value.replace(/\s/g,"") === '') {
                    callback(new Error('描述不能为空'));
                }else if(value.includes(';') || value.includes('|')) {
                    callback(new Error('描述不能有特殊字符'));
                }else {
                    callback();
                }
            };

            return {
                closable:false,
                active: 1,
                onePerForm: {
                    Oname:'',
                    Odesc:'',
                },

                permit_tree:[],
                defaultProps: {
                    children: 'auth2_list',
                    label: 'name'
                },
                onePerRules: {
                    Oname: [{ required: true, trigger: 'blur', validator: validateName}],
                    Odesc:[{ required: true, trigger: 'blur', validator: validateDesc}],
                },
                role_id: '',
            };
        },

        methods: {

            toConfig() {
                var _this = this
                var data = {
                    self_id: LocalStorage.get('self_id'),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    name: _this.onePerForm.Oname,
                    desc:  _this.onePerForm.Odesc,
                }
                _this.$refs.onePerForm.validate(valid => {
                    if(valid) {
                        _this.$http.post(`${this.url}/add_role`,qs.stringify(data)).then((resp)=>{
                            if(resp.ret_code >= 0) {
                                //返回的role_id
                                this.role_id = resp.ret_code
                                this.active++;
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
                    }else {
                        console.log('error submit!!')
                    }
                })
            },

            configSubmit() {
                if(this.permit_tree.length === 0) {
                    this.$message({
                        message:'请先配置权限',
                        type:'error',
                        center:true
                    })
                }else{
                    const checkedKeys = this.$refs.tree.getCheckedKeys()
                    const half = this.$refs.tree.getHalfCheckedKeys()
                    const allChecked = checkedKeys.concat(half)
                    if(allChecked.length === 0) {
                        this.$message({
                            message:'请勾选权限',
                            type:'error',
                            center:true
                        })
                    }else{
                        let newData = [],obj = {};

                        for(var i=0;i<this.permit_tree.length;i++) {

                            let tmp = this.permit_tree[i]

                            if(tmp['id'].includes('p')) {
                                //父节点
                                if(allChecked.includes(tmp['id'])) {
                                    //要么存在父节点，要么一个未选
                                    //此时该父节点存在,判断是否有子节点，若有则找出来位或val，若没有val写为8
                                    if(tmp['auth2_list'] !== undefined) {
                                        let count = 0
                                        for(var j=0;j<tmp['auth2_list'].length;j++) {
                                            if(allChecked.includes(tmp['auth2_list'][j]['id'])) {
                                                count = count + parseInt(tmp['auth2_list'][j]['val'])
                                            }
                                            obj = { id:parseInt(tmp['id'].substr(1)),val:count}
                                        }
                                    }else {
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
                            role_id: this.role_id
                        };

                        if(newData.length > 0) {
                            data['auth_list'] = JSON.stringify(newData)
                        }

                        this.$http.post(`${this.url}/add_role_auth_rel`,qs.stringify(data)).then((resp)=>{
                            if(resp.ret_code >= 0) {
                                this.active++;
                            }else {
                                this.$message({
                                    message:resp.ret_msg,
                                    type:'error',
                                    center:true
                                })
                            }
                        }).catch((error)=>{
                            if (error !== 'loginErr') {
                                console.log(error);
                                this.$message({
                                    message:'系统繁忙，请稍后重试',
                                    type:'error',
                                    center:true
                                })
                            }
                        })
                    }


                }
            },

            toList() {
                setTimeout(()=>{
                    this.$router.push('list')
                },1000)
            },

            getAuthTree() {
                let data = {
                    self_id: LocalStorage.get('self_id'),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime()
                };

                this.$http.post(`${this.url}/get_auth_list`,qs.stringify(data)).then((resp)=>{
                    if(resp.ret_code >= 0) {
                        if(resp.ret_data) {
                            var arr = resp.ret_data,newData = [],obj = {};
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
                            this.permit_tree = newData;
                        }else {
                            this.permit_tree = [];
                        }

                    }else {
                        this.$message({
                            message:resp.ret_msg,
                            type:'error',
                            center:true
                        })
                    }
                }).catch((error)=>{
                    if (error !== 'loginErr') {
                        console.log(error);
                        this.$message({
                            message:'系统繁忙，请稍后重试',
                            type:'error',
                            center:true
                        })
                    }
                })
            }
        },

        created() {
            this.getAuthTree()
        }
    }
</script>


<style scoped>
  /deep/ .el-steps{
    justify-content: center;
  }
  /deep/.el-alert__icon.is-big {
    font-size: 55px;
    width: 22px;
  }
  /deep/.el-alert__content {
    display: table-cell;
    padding: 0 51px;
  }
  /deep/.el-alert__icon {
    font-size: 50px;
    width: 16px;
  }
</style>

