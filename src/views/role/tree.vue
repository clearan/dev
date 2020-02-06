<!--<template>-->
<!--  <div>-->
<!--    <el-table-->
<!--      ref="aaa"-->
<!--      :data="tableData"-->
<!--      tooltip-effect="dark"-->
<!--      style="width: 100%"-->
<!--      @selection-change="handleSelectionChange">-->
<!--      <el-table-column-->
<!--        type="selection"-->
<!--        width="55">-->
<!--      </el-table-column>-->
<!--      <el-table-column-->
<!--        label="日期"-->
<!--        width="120">-->
<!--        <template slot-scope="scope">{{ scope.row.date }}</template>-->
<!--      </el-table-column>-->
<!--      <el-table-column-->
<!--        prop="name"-->
<!--        label="姓名"-->
<!--        width="120">-->
<!--      </el-table-column>-->
<!--      <el-table-column-->
<!--        prop="address"-->
<!--        label="地址"-->
<!--        show-overflow-tooltip>-->
<!--      </el-table-column>-->
<!--    </el-table>-->

<!--  </div>-->

<!--</template>-->

<!--<script>-->
<!--    export default {-->
<!--        data() {-->
<!--            return {-->
<!--                tableData: [{-->
<!--                    date: '2016-05-03',-->
<!--                    name: '王小虎',-->
<!--                    address: '上海市普陀区金沙江路 1518 弄'-->
<!--                }, {-->
<!--                    date: '2016-05-02',-->
<!--                    name: '王小虎',-->
<!--                    address: '上海市普陀区金沙江路 1518 弄'-->
<!--                }, {-->
<!--                    date: '2016-05-04',-->
<!--                    name: '王小虎',-->
<!--                    address: '上海市普陀区金沙江路 1518 弄'-->
<!--                }, {-->
<!--                    date: '2016-05-01',-->
<!--                    name: '王小虎',-->
<!--                    address: '上海市普陀区金沙江路 1518 弄'-->
<!--                }, {-->
<!--                    date: '2016-05-08',-->
<!--                    name: '王小虎',-->
<!--                    address: '上海市普陀区金沙江路 1518 弄'-->
<!--                }, {-->
<!--                    date: '2016-05-06',-->
<!--                    name: '王小虎',-->
<!--                    address: '上海市普陀区金沙江路 1518 弄'-->
<!--                }, {-->
<!--                    date: '2016-05-07',-->
<!--                    name: '王小虎',-->
<!--                    address: '上海市普陀区金沙江路 1518 弄'-->
<!--                }],-->
<!--                multipleSelection: []-->
<!--            }-->
<!--        },-->

<!--        methods: {-->
<!--            toggleSelection(rows) {-->
<!--                if (rows) {-->
<!--                    rows.forEach(row => {-->
<!--                        this.$refs.multipleTable.toggleRowSelection(row);-->
<!--                    });-->
<!--                } else {-->
<!--                    this.$refs.multipleTable.clearSelection();-->
<!--                }-->
<!--            },-->
<!--            handleSelectionChange(val) {-->
<!--                this.multipleSelection = val;-->
<!--            }-->
<!--        },-->
<!--        mounted() {-->
<!--            var x =this.tableData[1]['name']-->
<!--            this.$refs.aaa.toggleRowSelection(this.tableData[1],true);-->
<!--            this.$refs.aaa.toggleRowSelection(this.tableData[3],true);-->
<!--            // for(var i=0;i<this.tableData.length;i++) {-->
<!--            //-->
<!--            // }-->
<!--        }-->
<!--    }-->
<!--</script>-->


<template>
  <el-select v-model="value" placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
</template>

<script>
    export default {
        data() {
            return {
                options: [{
                    value: '选项1',
                    label: '黄金糕'
                }, {
                    value: '选项2',
                    label: '双皮奶'
                }, {
                    value: '选项3',
                    label: '蚵仔煎'
                }, {
                    value: '选项4',
                    label: '龙须面'
                }, {
                    value: '选项5',
                    label: '北京烤鸭'
                }],
                value: ''
            }
        }
    }
</script>
