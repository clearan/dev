<template>

  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;"
  >
    <div class="app-container">

      <el-steps :active="active"
                :space="500"
                finish-status="success"
                align-center
                style="margin-top: 30px"
      >
        <el-step title="一级菜单"></el-step>
        <el-step title="二级菜单"></el-step>
        <el-step title="配置成功"></el-step>
      </el-steps>

      <el-form ref="onePerForm" :model="onePerForm" :rules="onePerRules" align-center  v-if="active === 1">
        <div style="display: flex;flex-direction: column;align-items: center;margin-top: 50px">

          <el-form-item style="width: 600px"   prop="Oname">
            <el-input  maxlength="16" placeholder="请填写一级菜单名称" v-model="onePerForm.Oname"/>
          </el-form-item>

          <el-form-item style="width: 600px;margin-top: 20px"  prop="Ourl" >
<!--            <el-input  placeholder="请填写URL" v-model="onePerForm.Ourl" maxlength="20"/>-->
            <el-col :span="12" >
              <el-autocomplete
                popper-class="my-autocomplete"
                v-model="onePerForm.Ourl"
                :fetch-suggestions="querySearch"
                placeholder="请填写URL"
                style="width:600px"
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
          </el-form-item >

          <el-form-item  style="width: 600px;margin-top: 20px"  prop="Odesc">
            <el-input :rows="4" maxlength="200" placeholder="请填写描述信息" type="textarea" v-model="onePerForm.Odesc"/>
          </el-form-item>

          <el-form-item style="width: 600px;margin-top: 20px">
            <el-button type="primary"  style="width: 100%" @click="toTwo" >下一步</el-button>
          </el-form-item>
        </div>

      </el-form>

      <el-form ref="twoPerForm" :model="twoPerForm" :rules="twoPerRules"  v-if="active===2">
        <div style="display: flex;flex-direction: column;align-items: center;margin-top: 50px"
               v-for="(item,index) in twoPerForm.attrList"
               :key="index">

          <el-form-item :prop="'attrList.' + index + '.Tname'"
                        style="width:600px"
                        :rules=twoPerRules.Tname
          >
            <el-input v-model="item.Tname" placeholder="请填写二级菜单名称" maxlength="16"></el-input>
            <el-button type="danger"  v-if="twoPerForm.attrList.length > 1"  @click="removeItem(index)" style="position: absolute;margin-left: 25px">删除</el-button>
          </el-form-item>

          <el-form-item :prop="'attrList.' + index + '.Turl'"
                        :rules=twoPerRules.Turl
                        style="width:600px"
          >
<!--            <el-input v-model="item.Turl" placeholder="请填写URL"/>-->
            <el-col :span="12" >
              <el-autocomplete
                popper-class="my-autocomplete"
                v-model="item.Turl"
                :fetch-suggestions="querySearch2"
                placeholder="请填写URL"
                style="width:600px"
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

          <el-form-item :prop="'attrList.' + index + '.Tval'"
                        style="width:600px"
                        :rules=twoPerRules.Tval
          >
            <el-input v-model="item.Tval" placeholder="请填写权限值"/>
          </el-form-item>

          <el-form-item :prop="'attrList.' + index + '.Tdesc'"
                        style="width:600px"
                        :rules=twoPerRules.Tdesc
          >
            <el-input :rows="4" v-model="item.Tdesc" type="textarea" placeholder="请填写描述信息" maxlength="200"/>
          </el-form-item>
        </div>

        <div style="display: flex;flex-direction: column;align-items: center;margin-top: 40px">
          <el-form-item >
            <el-button type="primary"   @click="addChildMenu">新增二级菜单</el-button>
            <el-button type="primary"   @click="toThird" >下一步</el-button>
          </el-form-item>
        </div>
      </el-form>

      <el-form v-if="active===3">
        <div style="display: flex;flex-direction: column;align-items: center;margin-top: 50px">
          <el-alert
            :closable="closable"
            center
            title="您已成功配置菜单"
            :description="tips"
            type="success"
            show-icon
            style="width:50%;height: 200px"
          >
          </el-alert>
          <el-button type="success"   @click="toList" style="width: 10%;margin-top: 30px">完成</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>
<script>

    import { validURL,checkVal} from '@/utils/validate'
    import {LocalStorage} from '@/utils/storage'
    import {main_url,child_url} from '@/utils/url'
    import qs from 'qs'

    export default {
        name:'Add',
        data() {
            var validateName = (rule, value, callback) => {

                if (value.replace(/\s/g,"") === '') {

                    callback(new Error('菜单名称不能为空'));

                } else if (value.includes(';') || value.includes('|')) {

                    callback(new Error('菜单名称不能有特殊字符'));

                } else {

                    callback();
                }

            };

            var validateTwoName = (rule, value, callback) => {

                var flag = true

                for (var i=0;i<this.twoPerForm.attrList.length;i++) {

                    if (Number(rule.field.substr(9,1)) !== i){

                        if (value.replace(/\s/g,"") == this.twoPerForm.attrList[i]['Tname'].replace(/\s/g,"")) {

                            flag=false;
                            break;
                        }
                    }
                }
                if (value.replace(/\s/g,"") === '') {

                    callback(new Error('菜单名称不能为空'));

                } else if(value.includes(';') || value.includes('|')) {

                    callback(new Error('菜单名称不能有特殊字符'));

                } else if(!flag){

                    callback(new Error('菜单名称不能重复'));

                } else {

                    callback();
                }
            };

            var validateDesc = (rule, value, callback) => {

                if (value.replace(/\s/g,"") === '') {

                    callback(new Error('描述不能为空'));

                } else if(value.includes(';') || value.includes('|')) {

                    callback(new Error('描述不能有特殊字符'));

                } else {

                    callback();
                }
            };

            var oneValidUrl = (rule, value, callback) => {
                //url必须是配置里面有的
                var res = this.main_url.some((item) => {

                    return item.value === value
                })

                if (res) {

                    callback();

                } else {

                    callback(new Error('url错误'));
                }
            };

            var twoValidUrl = (rule, value, callback) => {
                // if (!validURL(value)) {
                //     callback(new Error('url格式错误'));
                // } else {
                //     callback();
                // }
                //url必须是配置里面有的
                var res = this.child_url.some((item) => {

                    return item.value === value

                })
                if (res) {

                    callback();

                }else {

                    callback(new Error('url错误'));
                }
            };

            var validVal = (rule, value, callback) => {
                if (value.replace(/\s/g,"") === '') {

                    callback(new Error('权限值不能为空'));

                } else if(!checkVal(value)) {

                    callback(new Error('权限值应为2的N次方'));

                } else {

                    callback();
                }
            };

            var validVal2 = (rule, value, callback) => {

                //二级菜单权值不能相同
                var flag = true

                for (var i=0;i<this.twoPerForm.attrList.length;i++) {

                    if (Number(rule.field.substr(9,1)) !== i){

                        if (value.replace(/\s/g,"") == this.twoPerForm.attrList[i]['Tval'].replace(/\s/g,"")) {

                            flag=false;
                            break;
                        }
                    }
                }
                if (value.replace(/\s/g,"") === '') {

                    callback(new Error('权限值不能为空'));

                } else if(!checkVal(value)) {

                    callback(new Error('权限值应为2的N次方'));

                } else if(!flag){

                    callback(new Error('权限值不能重复'));

                } else {

                    callback();
                }
            };

            return {

                state1:'',
                main_url: main_url,
                child_url: child_url,
                tips:'',
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
                    Ourl:[{ trigger: 'change', validator: oneValidUrl}],
                },
                twoPerRules: {
                    Tname: [{ required: true, trigger: 'blur', validator: validateTwoName}],
                    Tdesc:[{ required: true, trigger: 'blur', validator: validateDesc}],
                    Turl:[{ required: true,trigger: 'change', validator: twoValidUrl}],
                    Tval:[{ required: true,trigger: 'blur', validator: validVal2}],
                },
                f_id: ''
            }
        },

        methods: {

            msgTip(name,val) {

                this.$message({
                    message:name,
                    type:val,
                    center:true
                })
            },

            querySearch(queryString, cb) {

                var urls = this.main_url;
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

                let data = {
                    self_id: LocalStorage.get('self_id'),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    name: this.onePerForm.Oname,
                    desc:  this.onePerForm.Odesc,
                    url: this.onePerForm.Ourl.replace(/\s/g,"").length === 0
                        ? "javascript:void(0);"
                        :  this.onePerForm.Ourl.replace(/\s/g,"")
                };

                this.$refs.onePerForm.validate(valid => {

                    if (valid) {

                        this.$http.post(`${this.url}/add_auth`,qs.stringify(data)).then((resp) => {

                            if (resp.ret_code >= 0) {
                                //返回的父级id
                                this.f_id = resp.ret_data
                                this.active++;

                            } else {
                                this.msgTip(resp.ret_msg,'error')
                            }

                        }).catch((error) => {
                            if (error !== 'loginErr') {
                                console.log(error);
                                this.msgTip('系统繁忙，请稍后重试','error')
                            }
                        })

                    } else {
                        console.log('error submit!!')
                    }
                })
            },

            toThird() {

                var _this = this,flag = true

                for ( var i=0;i<_this.twoPerForm.attrList.length;i++) {
                    if (_this.twoPerForm.attrList[i]['Tname']
                        || _this.twoPerForm.attrList[i]['Tdesc']
                        || _this.twoPerForm.attrList[i]['Tval']
                        || _this.twoPerForm.attrList[i]['Turl']) {
                        flag = false
                        break
                    }
                }

                if (flag) {
                    //一个没填
                    _this.$confirm('是否跳至下一步？','提示',{
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        closeOnClickModal:false,
                        closeOnPressEscape:false,
                        type: 'warning'
                    }).then(() => {
                        this.active++;
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '已取消跳至下一步'
                        });
                    })
                } else {
                    let newAttrList = _this.twoPerForm.attrList.map(item => {
                        return {
                            name:item.Tname,
                            desc:item.Tdesc,
                            val:parseInt(item.Tval),
                            url:item.Turl
                        }
                    });

                    var data = {
                        self_id: LocalStorage.get('self_id'),
                        sess: LocalStorage.get('sess'),
                        idempotent: new Date().getTime(),
                        auth_id: parseInt(this.f_id),
                        auth2_list:JSON.stringify(newAttrList)
                    };

                    _this.$refs.twoPerForm.validate(valid => {
                        if (valid) {
                            _this.$http.post(`${this.url}/add_auth2`,qs.stringify(data)).then((resp) => {

                                if (resp.ret_code >= 0) {
                                    this.tips = resp.ret_code > 0 ? '该权限已有角色分配，请为角色重新勾选权限' : ''
                                    this.active++;
                                } else {
                                    _this.msgTip(resp.ret_msg,'error')
                                }
                            }).catch((error) => {

                                if (error !== 'loginErr') {
                                    console.log(error);
                                    _this.msgTip('系统繁忙，请稍后重试','error')
                                }

                            })
                        } else {
                            console.log('error submit!!')
                        }
                    })
                }

            },

            toList() {

                setTimeout(() => {
                    this.$router.push('list')
                },1000)
            }
        },

        created() {

            // if(this.$route.query.fid) {
            //     this.f_id = this.$route.query.fid,
            //     this.active = parseInt(this.$route.query.activeId)
            // }

            if(this.$route.params.fid) {

                this.f_id = this.$route.params.fid,
                this.active = parseInt(this.$route.params.activeId)
            }

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

