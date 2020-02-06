<template>

  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;">

    <div class="app-container">

      <el-table
        border fit highlight-current-row style="width: 100%"
        :data="check_list"
        row-key="id"
        :default-sort = "{prop: 'create_time', order: 'descending'}"
      >

        <el-table-column
          min-width="10%"
          align="center"
          sortable
          prop="sort_id"
          label="序号"
        >
          <template slot-scope="{row}">
            {{row.sort_id}}
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="role_name"
          label="申请人"
        >
          <template slot-scope="{row}">
            <span>{{ row.user_name }}</span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="role_desc"
          label="申请角色"
        >
          <template slot-scope="{row}">
            <span>{{ row.role_name }}</span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="state"
          label="申请时间"
        >
          <template slot-scope="{row}">
            <span>{{ row.create_time|formatDate  }}</span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          prop="state"
          label="审核状态"
         >
          <template slot-scope="{row}">
            <el-tag v-if="row.state==1" type="success" size="medium">已通过</el-tag>
            <el-tag v-else-if="row.state==0" type="info" size="medium">待审核</el-tag>
            <el-tag v-else type="danger" size="medium">已拒绝</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          min-width="18%"
          align="center"
          label="操作"
         >
          <template slot-scope="{row}">
            <div v-if="row.state == 0">
              <el-button
                type="success"
                size="small"
                @click="checkSubmit(row,1)">
                通过
              </el-button>

              <el-button
                type="danger"
                size="small"
                @click="checkSubmit(row,2)"
              >
                拒绝
              </el-button>
            </div>
            <div v-else>
              -
            </div>

          </template>

        </el-table-column>

      </el-table>

      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    </div>

  </div>

</template>
<script>
    import Pagination from '@/components/Pagination'
    import {formatDate} from '@/utils/date'
    import {LocalStorage} from '@/utils/storage'
    import qs from 'qs'
    export default {
        name:'List',
        components: { Pagination },
        data() {
            return {
                check_list: [],
                listQuery: {
                    page: 1,
                    limit: 10
                },
                total:0
            }
        },
        methods: {
            checkSubmit(row,val) {

                this.$confirm('是否立即审核？','提示',{
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    closeOnClickModal:false,
                    closeOnPressEscape:false,
                    type: 'warning'
                }).then(()=>{
                    let data = {
                        self_id: parseInt(LocalStorage.get('self_id')),
                        user_id: parseInt(row.user_id),
                        sess: LocalStorage.get('sess'),
                        idempotent: new Date().getTime(),
                        role_id:row.role_id,
                        id:row.id,
                        state:val
                    }
                    this.$http.post(`${this.url}/approve_role`,qs.stringify(data)).then((resp)=>{

                        if (resp.ret_code >= 0){
                            for (var i=0;i<this.check_list.length;i++) {
                                if (row.user_id == this.check_list[i]['user_id']) {
                                    this.check_list[i]['state'] = val
                                }
                            }
                            this.$message({
                                message:'审核成功',
                                type:'success',
                                center:true
                            })
                            //window.location.reload();
                        }else{
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
                }).catch(()=>{
                    this.$message({
                        type: 'info',
                        message: '已取消审核'
                    });
                })
            },

            getList(obj) {

                if (obj!==undefined && obj.flag !== undefined) {
                    this.listQuery.page =1
                }

                var data = {
                    self_id: parseInt(LocalStorage.get('self_id')),
                    sess: LocalStorage.get('sess'),
                    idempotent: new Date().getTime(),
                    pos: (this.listQuery.page - 1)*this.listQuery.limit,
                    offset: this.listQuery.limit
                }

                this.$http.post(`${this.url}/get_app_role_list`,qs.stringify(data)).then((resp)=>{

                    if (resp.ret_code >= 0) {
                        if (resp.ret_data.data_list) {
                            let list = resp.ret_data.data_list
                            for (var i=0;i<list.length;i++) {
                                //list[i]['sort_id'] = this.listQuery.limit-i
                                list[i]['sort_id'] = i+1
                            }

                            this.check_list = list
                        }else {
                            this.check_list = []
                        }
                        this.total = resp.ret_data.total_num
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
        filters:{
            //时间戳
            formatDate(time) {
                return formatDate(time);
            },
        },
        created() {
            this.getList()
        }
    }
</script>
