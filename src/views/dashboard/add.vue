<template>
  <div class="app-container">

    <el-steps :active="active" :space="500" finish-status="success" align-center>
      <el-step title="一级菜单"></el-step>
      <el-step title="二级菜单"></el-step>
      <el-step title="配置成功"></el-step>
    </el-steps>

    <el-form ref="onePerForm" :model="onePerForm" :rules="onePerRules" label-width="120px" v-if="active===1">
      <div>

        <el-form-item   style="margin-top: 30px;width: 65% ;margin-left: 100px" prop="Oname">
          <el-input  maxlength="10" placeholder="请填写一级菜单名称" v-model="onePerForm.Oname"/>
        </el-form-item>

        <el-form-item   style="margin-top: 30px;width: 65% ;margin-left: 100px" prop="Ourl" >
          <el-input  placeholder="请填写URL" v-model="onePerForm.Ourl" maxlength="20"/>
        </el-form-item >

        <el-form-item   style="margin-top: 30px;width: 65% ;margin-left: 100px" prop="Odesc">
          <el-input  maxlength="20" placeholder="请填写描述信息" type="textarea" v-model="onePerForm.Odesc"/>
        </el-form-item>

        <el-form-item style="margin-top: 30px;width: 65% ;margin-left: 100px">
          <el-button type="primary"  style="width: 100%" @click="toTwo" >下一步</el-button>
        </el-form-item>
      </div>

    </el-form>


      <el-form ref="twoPerForm" :model="twoPerForm" :rules="twoPerRules"  label-width="120px" v-if="active===2">
        <div v-for="(item,index) in twoPerForm.attrList" :key="index">

          <el-form-item :prop="'attrList.' + index + '.Tname'"
                        :rules=twoPerRules.Tname
                        style="margin-top: 30px;width: 65% ;margin-left: 100px">
            <el-input v-model="item.Tname" placeholder="请填写二级菜单名称"/>
          </el-form-item>

          <el-form-item :prop="'attrList.' + index + '.Tdesc'"
                        :rules=twoPerRules.Tdesc
                        style="margin-top: 30px;width: 65% ;margin-left: 100px">
            <el-input v-model="item.Tdesc" type="textarea" placeholder="请填写描述信息"/>
          </el-form-item>

          <el-form-item :prop="'attrList.' + index + '.Turl'"
                        :rules=twoPerRules.Turl
                        style="margin-top: 30px;width: 65% ;margin-left: 100px">
            <el-input v-model="item.Turl" placeholder="请填写URL"/>
          </el-form-item>

          <el-form-item :prop="'attrList.' + index + '.Tval'"
                        :rules=twoPerRules.Tval
                        style="margin-top: 30px;width: 65% ;margin-left: 100px">
            <el-input v-model="item.Tval" placeholder="请填写权限值"/>

          </el-form-item>

          <el-form-item>
            <el-button style="margin-left: 983px" type="danger"  v-if="twoPerForm.attrList.length > 1"  @click="removeItem(index)">删除</el-button>
          </el-form-item>


        </div>
        <el-form-item >
          <el-button type="primary"   @click="addChildMenu" style="margin-left: 415px">新增二级菜单</el-button>
          <el-button type="primary"   @click="toThird" >下一步</el-button>
          <el-button type="primary"   @click="directNext" >跳过</el-button>
        </el-form-item>
      </el-form>



    <el-form v-if="active===3">
      <el-alert style="margin-top: 30px;width: 64%;margin-left: 178px;height: 125px;"
        :closable="closable"
        center
        title="您已成功配置菜单"
        type="success"
        description="文字说明文字说明文字说明文字说明文字说明文字说明"
        show-icon>
      </el-alert>
      <el-button type="primary"   @click="toList" style="margin-left: 700px;margin-top: 20px">完成</el-button>
    </el-form>
  </div>
</template>
<script>
    import { validURL,checkVal} from '@/utils/validate'
    import {LocalStorage} from '@/utils/storage'
    import qs from 'qs'
    export default {
        name:'Add',
        data() {
            var validateName = (rule, value, callback) => {
                if (value.replace(/\s/g,"") === '') {
                    callback(new Error('菜单名称不能为空'));
                }else if(value.includes(';') || value.includes('|')) {
                    callback(new Error('菜单名称不能有特殊字符'));
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
            var oneValidUrl = (rule, value, callback) => {
                if(value.replace(/\s/g,'')!=='') {
                    if(!validURL(value)) {
                        callback(new Error('url格式错误'));
                    }else {
                        callback();
                    }
                }else {
                    callback();
                }
            };
            var twoValidUrl = (rule, value, callback) => {
                if (!validURL(value)) {
                    callback(new Error('url格式错误'));
                } else {
                    callback();
                }
            };
            var validVal = (rule, value, callback) => {
                if (value.replace(/\s/g,"") === '') {
                    callback(new Error('权限值不能为空'));
                }else if(!checkVal(value)) {
                    callback(new Error('权限值应为2的N次方'));
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
                    Ourl:''
                },
                twoPerForm: {
                    attrList: [{
                        Tname:'',
                        Tdesc:'',
                        Turl:'',
                        Tval:''
                    }]
                },
                onePerRules: {
                    Oname: [{ required: true, trigger: 'blur', validator: validateName}],
                    Odesc:[{ required: true, trigger: 'blur', validator: validateDesc}],
                    Ourl:[{ trigger: 'blur', validator: oneValidUrl}],
                },
                twoPerRules: {
                    Tname: [{ required: true, trigger: 'blur', validator: validateName}],
                    Tdesc:[{ required: true, trigger: 'blur', validator: validateDesc}],
                    Turl:[{ required: true,trigger: 'blur', validator: twoValidUrl}],
                    Tval:[{ required: true,trigger: 'blur', validator: validVal}],
                },
                f_id: ''
            };
        },

        methods: {
            addChildMenu() {
                this.twoPerForm.attrList.push({
                    Tname: '',
                    Tdesc: '',
                    Turl: '',
                    Tval: '',
                })
            },

            removeItem(index) {
                this.twoPerForm.attrList.splice(index, 1);
            },
            toTwo() {
                var _this = this;
                var data = {
                    user_id: LocalStorage.get('user_id'),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    name: _this.onePerForm.Oname,
                    desc:  _this.onePerForm.Odesc,
                    url: _this.onePerForm.Ourl.replace(/\s/g,"").length ===0
                        ? "javascript:void(0);"
                        :  _this.onePerForm.Ourl.replace(/\s/g,"")
                }
                _this.$refs.onePerForm.validate(valid => {
                    if(valid) {
                        console.log('校验通过')
                        _this.$http.post('add_auth',qs.stringify(data)).then((resp)=>{
                            if(resp.ret_code >= 0) {
                                //返回的父级id
                                this.f_id = resp.ret_data
                                this.active++;
                            }else {
                                 //this.active++;
                                _this.$message({
                                    message:resp.ret_msg,
                                    type:'error',
                                    center:true
                                })
                            }
                        }).catch((err)=>{
                            console.log(err)
                            _this.$message({
                                message:'系统繁忙，请稍后重试',
                                type:'error',
                                center:true
                            })
                        })
                    }else {
                        console.log('error submit!!')
                    }
                })
            },

            toThird() {
                var _this = this;
                let newAttrList = this.twoPerForm.attrList.map(item=>{
                    return {
                        name:item.Tname,
                        desc:item.Tdesc,
                        val:parseInt(item.Tval),
                        url:item.Turl
                    }
                })
                var data = {
                    user_id: LocalStorage.get('user_id'),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    auth_id: this.f_id,
                    auth2_list:JSON.stringify(newAttrList)
                }

                console.log(newAttrList);
                console.log(data);
                _this.$refs.twoPerForm.validate(valid => {
                    if(valid) {
                        console.log('二级菜单规则校验通过')
                        _this.$http.post('add_auth2',qs.stringify(data)).then((resp)=>{
                            if(resp.ret_code >= 0) {
                                this.active++;
                            }else {
                                _this.$message({
                                    message:resp.ret_msg,
                                    type:'error',
                                    center:true
                                })
                            }
                        }).catch((err)=>{
                            console.log(err)
                            _this.$message({
                                message:'系统繁忙，请稍后重试',
                                type:'error',
                                center:true
                            })
                        })
                    }else {
                        console.log('error submit!!')
                    }
                })
            },


            directNext() {
                this.active++;
            },

            toList() {
                setTimeout(()=>{
                    this.$router.push('index')
                },1000)
            }
        },

        created() {
            if(this.$route.query.fid) {
                this.f_id = this.$route.query.fid.substr(1),
                this.active = this.$route.query.activeId
            }

        }
    }
</script>


<style scoped>

</style>

