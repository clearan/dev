
<template>
  <el-table  :data="formatData" :row-style="showRow" v-bind="$attrs" v-on="$listeners">,

    <template v-if="select_fld">
      <el-table-column width="50" align="center">,
        <template slot="header" slot-scope="scope">
          <el-checkbox v-model="chooseall" @change="setchildtobeselect(formatData,$event)"/>
        </template>
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row[select_fld]" @change="toselect(scope.row)"></el-checkbox>
        </template>
      </el-table-column>
    </template>

    <el-table-column v-if="columns.length===0" width="150">
      <template slot-scope="scope">
        <span v-for="space in scope.row._level" :key="space" class="ms-tree-space"/>
        <span v-if="iconShow(0,scope)" class="tree-ctrl" @click="toggleExpanded(scope.$index)">
					  <i v-if="!scope.row._expanded" class="el-icon-plus"/>
					  <i v-else class="el-icon-minus"/>
					</span>
        {{ scope.$index }}
      </template>
    </el-table-column>
    <!--自定义树节点显示的列值-->
    <el-table-column v-for="(column, index) in columns" v-else :key="column.value" :label="column.text" :width="column.width">
      <template slot-scope="scope">
        <!-- Todo -->
        <!-- eslint-disable-next-line vue/no-confusing-v-for-v-if -->
        <span v-for="space in scope.row._level" v-if="index === 0" :key="space" class="ms-tree-space"/>
        <span v-if="iconShow(index,scope)" class="tree-ctrl" @click="toggleExpanded(scope.$index)">
					  <i v-if="!scope.row._expanded" class="el-icon-arrow-right"/>
					  <i v-else class="el-icon-arrow-down"/>
					</span>
        {{ scope.row[column.value] }}
      </template>
    </el-table-column>
    <slot/>
  </el-table>
</template>

<script>
    import Vue from "vue";
    export default {
        name: "TreeTable",
        data() {
            return {
                //chooseson: true, //全选
                key: true, //单个点击直到全部选中
                //当前全选状态
                chooseall: false,
                arr:[],
                is_check_flag:true,
                all_arr:[]
            };
        },
        props: {
            /* eslint-disable */
            data: {
                type: [Array, Object],
                required: true
            },
            select_arr:{
                type: [Array],
                required: true
            },
            columns: {
                type: Array,
                default: () => []
            },
            evalFunc: Function,
            evalArgs: Array,
            expandAll: {
                type: Boolean,
                default: false
            },
            //-----------------------------------------
            tree_width: {
                type: String,
                default: '150'
            },
            select_fld: {
                type: String,
                //default: "id"
                default: ""
            },
            //-----------------------------------------
            // 如果数据源是靠字父级字段来表示树的话，primary_fld和parent_fld必须同时传入，并指定root_value
            primary_fld: {
                type: String,
                default: "id",
                required: true

            },
            parent_fld: {
                type: String,
                //default: "parent_id"
                default: ""
            },
            // 根级节点值
            root_value: {
                type: [String, Number],
                //default: "parent_id"
                default: ""
            },
            // 可选，子节点数的字段，如果含有此字段，将会加快加载速度
            child_count_fld: {
                type: String,
                //default: "childCount"
                default: ""
            }
        },
        computed: {

            // 格式化数据源
            formatData: function() {
                let result = [];
                let tmp;
                let func = this.evalFunc;

                if (this.is_source_table) {
                    // 数据源是一个表格数组,依靠关键字段和父级id组成关系
                    tmp = 0;
                    func = this.tableToTree;
                } else if (Array.isArray(this.data)) {
                    tmp = this.data;
                } else {
                    tmp = [this.data];
                }

                const args = this.evalArgs ? [result, tmp, this.expandAll].concat(this.evalArgs) : [result, tmp, this.expandAll];
                //return func.apply(null, args);
                func.apply(null, args);
                return result;
            },
            // 判断数据源是否使用父级字段来表示的二维的表格树
            is_source_table: function() {
                return this.primary_fld && this.parent_fld;
            }
        },
        methods: {
            //代替原来的 treeToArray函数
            tableToTree: function(tResult, tStartRecno, expandAll, parent, level, item) {

                const that = this;
                let parent_value = that.root_value;
                let _level = 1;
                let record = null;
                let child = null;
                const marLTemp = []
                let tmp = []

                if (parent) {
                    parent_value = parent[that.primary_fld];
                    _level = level;
                }


                //Array.from(data).forEach(function(record) {
                for (let i = tStartRecno, count = that.data.length; i < count; i++) {
                    record = that.data[i];

                    if (record[that.parent_fld] !== parent_value) {
                        continue;
                    }
                    if (record._expanded === undefined) {
                        Vue.set(record, '_expanded', expandAll)
                    }

                    Vue.set(record, '_level', _level)
                    // 如果有父元素
                    if (parent) {
                        Vue.set(record, 'parent', parent)
                        // 如果父元素有偏移量，需要计算在this的偏移量中
                        // 偏移量还与前面同级元素有关，需要加上前面所有元素的长度和
                        if (!marLTemp[_level]) {
                            marLTemp[_level] = 0
                        }
                        Vue.set(record, '_marginLeft', marLTemp[_level] + parent._marginLeft)
                        Vue.set(record, '_width', record[item] / parent[item] * parent._width)
                        // 在本次计算过偏移量后加上自己长度，以供下一个元素使用
                        marLTemp[_level] += record._width
                    } else {
                        // 如果为根
                        // 初始化偏移量存储map
                        marLTemp[record[that.primary_fld]] = []
                        // map中是一个数组，存储的是每级的长度和
                        // 初始情况下为0
                        marLTemp[record[that.primary_fld]][_level] = 0
                        Vue.set(record, '_marginLeft', 0)
                        Vue.set(record, '_width', 1)
                    }
                    tmp.push(record)
                    tResult.push(record);
                    // 表含有表示子节点数量的字段
                    let is_seek_child = 1;
                    if (that.child_count_fld) {
                        is_seek_child = record[that.child_count_fld];
                    }
                    if (is_seek_child) {
                        const next_recno = i + 1;
                        const next_level = _level + 1;

                        child = that.tableToTree(tResult, next_recno, expandAll, record, next_level, item);

                        if (child.length > 0) {
                            //tmp = tmp.concat(child);
                            if (!record.child) {
                                Vue.set(record, 'child', child);
                            }
                        }

                    }
                }
                //})


                return tmp
            },

            next_brother: function(tRow) {
                const that = this;
                let id = tRow[that.primary_fld],
                    targetIdx = -1,
                    source = (tRow.parent) ? tRow.parent.child : that.formatData;
                result = null;

                targetIdx = source.findIndex(function(value, index, arr) {
                    return value[that.primary_fld] === id;
                });
                targetIdx++;
                if (targetIdx < source.length) {
                    result = source[targetIdx];
                }
                return result;
            },
            // 添加节点
            // 1.不传递tRow，表示在表尾追加根节点
            // 2.传递tRow,默认是在当前节点下添加子节点
            // 3. 传递tRow ,并且 tIsInsert 大于或等于1，表示在当前节点前插入一节点
            append: function(tRow, tIsInsert) {
                const that = this;
                let scatter = {},
                    new_id = (new Date()).getTime().toString(),
                    id = (tRow)?tRow[that.primary_fld]:"";
                scatter[that.primary_fld] = new_id;
                if (tRow && tIsInsert) {
                    let targetIdx = that.data.findIndex(function(value, index, arr) {
                        return value[that.primary_fld] === id;
                    });
                    if (id >= 0) {
                        if (that.parent_fld) {
                            scatter[that.parent_fld] = tRow[that.parent_fld];
                        }
                        if (tRow.parent) {
                            scatter.parent = tRow.parent;
                        }
                        that.data.splice(targetIdx, 0, scatter);
                    }
                } else {
                    //添加根节点或子节点
                    scatter[that.parent_fld] = (tRow)?id:that.root_value;

                    that.data.push(scatter);
                }
            },
            delete: function(tRow) {
                let that = this,
                    node = null,
                    parent = null,
                    id = tRow[that.primary_fld];

                if (tRow.child && tRow.child.length > 0) {
                    tRow.child.forEach((v, i) => {
                        that.delete(v);
                    });
                }
                let targetIdx = that.data.findIndex(function(value, index, arr) {
                    return value[that.primary_fld] === id;
                });

                that.data.splice(targetIdx, 1);

                node = tRow;
                //while (node["parent"]) {
                if (node["parent"]) {
                    node = node["parent"];
                    targetIdx = node.child.findIndex(function(value, index, arr) {
                        return value[that.primary_fld] === id;
                    });

                    if (targetIdx >= 0) {
                        node.child.splice(targetIdx, 1);
                    }
                }
                if (tRow.parent) {
                    that.refresh_node_select(tRow.parent);
                }
            },

            showRow: function(row) {
                const show = row.row.parent ?
                    row.row.parent._expanded && row.row.parent._show :
                    true;
                row.row._show = show;
                return show ?
                    "animation:treeTableShow 1s;-webkit-animation:treeTableShow 1s;" :
                    "display:none;";
            },
            // 切换下级是否展开
            toggleExpanded: function(trIndex) {
                const record = this.formatData[trIndex];
                record._expanded = !record._expanded;
            },
            // 图标显示
            iconShow(index, tScope) {
                const record = tScope.row;
                //console.info(tScope.$index);
                return index === 0 && record.child && record.child.length > 0;


            },
            //功能函数:选中部分子集
            setchildtobeselect(arr, key) {

                this.is_check_flag = false
                const that = this;
                arr.forEach((v, i) => {
                    //v.checks = key;
                    v[that.select_fld] = key;
                    // v._expanded = key;//选中后展开子项
                    if (v.child) {
                        this.setchildtobeselect(v.child, v[that.select_fld]);
                    }
                });

                var flagOn = true,flagOff = true
                for (var i=0;i<arr.length;i++) {
                    if(!arr[i]['checked']) {
                        flagOn = false
                    }else {
                        flagOff = false
                    }
                }

               if(key && arr.length === this.formatData.length) {
                   //全选
                   //获取一级
                   var select_arr = []
                   for (var i=0;i<arr.length;i++) {
                       if(!arr[i]['val']) {
                           select_arr.push(arr[i]['id'])
                       }
                   }

                   var tmp_arr = [],obj ={}
                   for (var i=0;i<arr.length;i++) {
                       if(!arr[i]['parent_id'] && arr[i]['child']) {
                           //一级存在子集
                           continue
                       }else if(select_arr.includes(arr[i]['parent_id'])) {
                           //二级
                           obj={id:arr[i]['parent_id'],val:arr[i]['val']}

                       }else {
                           //一级不存在二级
                           obj={id:arr[i]['id'],val:8}
                       }
                       tmp_arr.push(obj)
                   }

                   let target = [];
                   let keysArr =[...new Set( tmp_arr.map(item=>item.id))]  ;

                   keysArr.forEach(item=>{
                       const  this_arr = tmp_arr.filter(keys=>keys.id == item);
                       const sum = this_arr.reduce((a,b)=>a+b.val,0)
                       target.push({
                           id:item,
                           val:sum
                       })
                   })
                   this.arr = target
               }
               if(!key && arr.length === this.formatData.length) {
                   //console.log(22)
                   this.arr = []
               }

                this.$emit('listenPost',this.arr)
                this.$emit('listenClick',this.is_check_flag)

            },
            //是否所有的都被选中
            isallchecked(arr) {
                const that = this;
                arr.forEach((v, i) => {
                    if (!v[that.select_fld]) {
                        this.key = false;
                    }
                    if (v.child) {
                        this.isallchecked(v.child);
                    }
                });
            },

            // 节点下的子节点，全部都没有被选中或子节点个数为0时返回true，否则返回false
            is_all_false(tNode) {
                const that = this;
                let result = true;
                if (!Array.isArray(tNode.child)) {
                    return result;
                }
                tNode.child.forEach((v, index) => {
                    // 只要有一个兄弟是true,终止递归
                    if (v[that.select_fld]) {
                        result = false;
                        return result; //终止此次循环，减少循环次数
                    }
                });
                return result;
            },
            // 如果节点为被选状态，通过检查子节点是否有被选中，否则修正它
            refresh_node_select(tNode) {
                const that = this;
                let node = tNode;
                while (true) {
                    // 选中?
                    if (node[that.select_fld]) {
                        if (that.is_all_false(node)) {
                            //Vue.set(node,that.select_fld,false);
                            node[that.select_fld] = false;
                        } else {
                            break;
                        }
                    }
                    if (node["parent"]) {
                        node = node["parent"];
                    } else {
                        break;
                    }

                }
            },

            //某个复选框被点击时
            toselect(row) {

                const that = this;
                let node = null;
                // row._expanded = row.checks;//选中后是否展开
                //1、若有子集先让子选中
                if (row.child) {
                    this.setchildtobeselect(row.child, row[that.select_fld]);
                }
                //2、然后判断是否全选中
                this.key = true; //重置为true，防止上次已经是false的状态
                this.isallchecked(this.formatData);
                //3、设置多选框的状态
                if (!row[that.select_fld]) {
                    //this.setparentfalse(this.formatData, row[that.primary_fld], row._level); //设置父级选中的状态为false
                    if (row.parent) {
                        that.refresh_node_select(row.parent);
                    }
                    //设置全选框的状态
                    that.chooseall = false;
                    //document.getElementById("chooseall").checked = false;
                } else {
                    node = row;
                    while (node["parent"]) {
                        node = node["parent"];
                        if (!node[that.select_fld]) {
                            node[that.select_fld] = true;
                        }
                    }
                    //this.setparenttrue(this.formatData, row[that.primary_fld], row._level); //设置父级选中的状态为true
                }
                if (this.key) {
                    that.chooseall = true;
                    //document.getElementById("chooseall").checked = true; //设置全选框的状态
                }

                this.is_check_flag = false
                var new_arr =this.select_arr
                //var new_arr =[]
                // var new_arr=[]
                // if(!that.arr) {
                //     console.log(111)
                //     new_arr=[]
                // }else{
                //    // new_arr=that.select_arr
                // }


                if(row.checked) {
                        var obj={},val = 0
                        if(row.parent_id) {
                            //二级选中
                            obj = {id:row.parent_id,val:row.val}

                        }
                        if(row.parent_id == '' && !row.child) {
                            //一级没有儿子
                            obj={id:row.id,val:8}

                        }
                        if(row.parent_id == '' && row.child) {
                            //一级有儿子
                            for(var i=0;i<row.child.length;i++) {
                                val = val + row.child[i]['val']
                            }
                            obj={id:row.id,val:val}

                        }

                        new_arr.push(obj)

                        let target = [];
                        let keysArr =[...new Set( new_arr.map(item=>item.id))]  ;

                        keysArr.forEach(item=>{
                            const  arr = new_arr.filter(keys=>keys.id == item);
                            const sum = arr.reduce((a,b)=>a+b.val,0)
                            target.push({
                                id:item,
                                val:sum
                            })
                        })
                        new_arr = target

                    }else{
                        //console.log(row)
                        //console.log(new_arr);
                        if(row.parent_id) {
                            //二级且取消

                            for(var j=0;j<new_arr.length;j++) {
                                if(new_arr[j]['id'] === row.parent_id) {
                                    let res = new_arr[j]['val'] - row.val
                                    if(res == 0) {
                                        new_arr.splice(j,1)
                                    }else{
                                        new_arr[j]['val'] = res
                                    }
                                }
                            }
                        }
                        if(!row.parent_id) {
                            //console.log('---')
                            //一级取消
                            var obj = {},tmp=[]
                            for(var j=0;j<new_arr.length;j++) {

                                if(new_arr[j]['id'] !== row.id) {
                                    //new_arr.splice(j,1)
                                    obj={id:new_arr[j]['id'],val:new_arr[j]['val']}
                                    tmp.push(obj)
                                }

                            }
                            new_arr = tmp
                        }
                    }

console.log(new_arr)



                this.$emit('listenPost',new_arr)
                this.$emit('listenClick',this.is_check_flag)
            }
        },
        mounted() {
            this.$nextTick(() => {
                var that = this;
                const all = document.getElementById("chooseall");
            });
        },
    };
</script>
<style rel="stylesheet/css">
  @keyframes treeTableShow {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @-webkit-keyframes treeTableShow {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>

<style>
  .ms-tree-space {
    position: relative;
    top: 1px;
    display: inline-block;
    font-style: normal;
    font-weight: 400;
    line-height: 1;
    width: 18px;
    height: 14px;
  }
  .ms-tree-space::before {
    content: "";
  }
  .processContainer {
    width: 100%;
    height: 100%;
  }
  table td {
    line-height: 26px;
  }
  .tree-ctrl {
    position: relative;
    cursor: pointer;
    color: #2196f3;
    margin-left: -18px;
  }
</style>
