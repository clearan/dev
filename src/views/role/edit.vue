<template>
  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;">

    <div class="app-container" style="">
      <el-form label-width="120px" style="width:40%" >
        <el-form-item label="角色名称">
          <el-input type="text" v-model="role_name"  readonly/>
        </el-form-item>

        <el-form-item label="角色描述">
          <el-input type="text" v-model="role_desc"  readonly/>
        </el-form-item>

      </el-form>

      <div style="margin-top: 40px;"><el-divider></el-divider></div>

      <div style="width: 74%;margin:40px 0 0 51px">
        <div v-for="(item,index) in editableTabs">
          <el-collapse v-model="activeNames" @change="handleChange">
            <el-collapse-item  name="1">
              <template slot="title">
                <el-checkbox
                  v-if="!item.auth2_list"
                  v-model="item.checked"
                >

                </el-checkbox> {{item.name}}

                <!--              <el-form>-->
                <!--                <el-form-item label="权限名称">-->
                <!--                  <el-input type="text" v-model="item.name"  readonly/>-->
                <!--                </el-form-item>-->

                <!--                <el-form-item label="权限描述">-->
                <!--                  <el-input type="text" v-model="item.desc"  readonly/>-->
                <!--                </el-form-item>-->
                <!--              </el-form>-->
              </template>
              <el-table
                style="margin-top: 20px"
                :data="item.auth2_list"
                :ref="'item'+index"

              >

                <el-table-column
                  type="selection"
                  width="55">
                </el-table-column>

                <el-table-column
                  min-width="300px"
                  label="名称"
                >
                  <template slot-scope="{row}">
                    <span>{{ row.name }}</span>
                  </template>
                </el-table-column>

                <el-table-column
                  min-width="300px"
                  label="描述"
                >
                  <template slot-scope="{row}">
                    <span>{{ row.desc }}</span>
                  </template>
                </el-table-column>

                <el-table-column
                  min-width="300px"
                  label="url"
                >
                  <template slot-scope="{row}">
                    <span>{{ row.url }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>

          </el-collapse>
        </div>
      </div>




<!--      <div v-for="(item,index) in editableTabs " style="margin-top: 50px">-->
<!--        <el-form label-width="120px" >-->

<!--          <el-checkbox-->
<!--            v-if="!item.auth2_list"-->
<!--            v-model="item.checked"-->
<!--          >-->

<!--          </el-checkbox>-->
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
<!--              type="selection"-->
<!--              width="55">-->
<!--            </el-table-column>-->

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

      <el-button type="primary"   @click="clickSubmit" style="margin-left: 700px;margin-top: 20px">完成</el-button>
    </div>

  </div>



</template>

<script>
    import qs from 'qs'
    import {LocalStorage} from '@/utils/storage'
    let Base64 = require('js-base64').Base64;

    export default {
        name:'Edit',
        data() {
            return {
                activeNames: ['1'],
                editableTabs:[],
                role_id:'',
                role_name:'',
                role_desc:'',
                data:[],
            }
        },
        methods:{

            clickSubmit() {
                var arr=[],obj={}

                for(var i=0;i<this.editableTabs.length;i++) {
                    var x = 'item'+i
                    var sort = this.$refs[x][0].selection
                    if(sort) {
                        for(var j=0;j<sort.length;j++) {
                            obj={id:parseInt(this.editableTabs[i]['id']),val:sort[j]['val']}
                            arr.push(obj)
                        }
                    }
                }

                for(var m=0;m<this.editableTabs.length;m++) {

                    if(this.editableTabs[m]['auth2_list'] === undefined && this.editableTabs[m]['checked']) {

                        arr.push({id:parseInt(this.editableTabs[m]['id']),val:8})
                    }
                }
                let target = []
                let keysArr = [...new Set( arr.map(item=>item.id))]

                keysArr.forEach(item=>{
                    const  this_arr = arr.filter(keys=>keys.id == item);
                    const sum = this_arr.reduce((a,b)=>a+b.val,0)
                    target.push({
                        id:item,
                        val:sum
                    })
                })

                if(target.length === 0) {
                    this.$message({
                        message:'请配置权限',
                        type:'error',
                        center:true
                    })
                    return;
                }

                let data = {
                    self_id: LocalStorage.get('self_id'),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    role_id: this.role_id,
                    auth_list:JSON.stringify(target)
                };

                this.$http.post(`${this.url}/add_role_auth_rel`,qs.stringify(data)).then((resp)=>{
                    if(resp.ret_code >= 0) {
                        setTimeout(()=>{
                            this.$router.push('list')
                        },1000)
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
            this.role_id = this.$route.query.role_id
            this.role_name = Base64.decode(this.$route.query.role_name)
            this.role_desc = Base64.decode(this.$route.query.role_desc)
            let data = {
                self_id: LocalStorage.get('self_id'),
                idempotent: new Date().getTime(),
                sess: LocalStorage.get('sess'),
                role_id: this.$route.query.role_id,
            };
            this.$http.post(`${this.url}/get_role`,qs.stringify(data)).then((resp)=>{

                if(resp.ret_code >= 0) {

                    let res = resp.ret_data

                    for(var i=0;i<res.length;i++) {

                        res[i]['checked'] = parseInt(res[i]['checked']) ? true : false

                        if(res[i]['auth2_list'] !== undefined) {
                            for (var j=0;j<res[i]['auth2_list'];j++) {
                                res[i]['auth2_list'][j]['checked'] = parseInt(res[i]['auth2_list'][j]['checked']) ? true : false
                            }
                        }
                    }

                    this.editableTabs = res

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
        },
        mounted() {
            var _this=this

            setTimeout(()=>{

                for(var i=0;i<_this.editableTabs.length;i++) {

                    if(_this.editableTabs[i]['auth2_list'] !== undefined) {

                        var x = 'item'+i

                        for(var j=0;j<_this.editableTabs[i]['auth2_list'].length;j++) {

                            if(_this.editableTabs[i]['auth2_list'][j].checked) {
                                _this.$refs[x][0].toggleRowSelection(_this.editableTabs[i]['auth2_list'][j], true);
                            }
                        }
                    }
                }
            },500)

        }
    }
</script>
