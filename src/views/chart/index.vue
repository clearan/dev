<template>

  <div style="
    border: 1px solid #ebeef5;
    background-color: #fff;
    color: #303133;
    transition: .3s;
    min-height: 798px;"
  >
    <div class="app-container">
      <panel-group @handleSetLineChartData="handleSetLineChartData" :varArr = "var_arr" :sumArr = "sum_arr"/>

      <div>
        <el-date-picker
          type="date"
          v-model="value1"
          placeholder="选择一个日期"
          value-format="timestamp"
          @change="date_change"
        >
        </el-date-picker>

        <el-date-picker
          v-model="value2"
          type="week"
          format="yyyy 第 WW 周"
          placeholder="选择周"
          style="margin-left:20px"
          @change="week_change"
        >
        </el-date-picker>

        <el-date-picker
          v-model="value3"
          type="month"
          placeholder="选择月"
          style="margin-left:20px"
          value-format="timestamp"
          @change="month_change"
        >
        </el-date-picker>

        <el-date-picker
          v-model="value4"
          type="year"
          placeholder="选择年"
          style="margin-left:20px"
          value-format="timestamp"
          @change="year_change"
          >
        </el-date-picker>

      </div>

      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <line-chart :chart-data="lineChartData"  :nameType = "cou_name" :sortCount="sort_count"/>
      </el-row>
    </div>
  </div>

</template>
<script>
    import PanelGroup from './components/PanelGroup'
    import LineChart from './components/LineChart'
    import Pagination from '@/components/Pagination'
    import {LocalStorage} from '@/utils/storage'
    import {formatDate} from '@/utils/date'
    import {formatMoney} from '@/utils/money'
    import qs from 'qs'

    export default {
        components: {
            PanelGroup,
            LineChart,
        },
        data() {
            return {
                lineChartData: {},
                resultData:{
                  mem:{
                    expectedData:[]
                  },
                  sem:{
                    expectedData:[]
                  },
                  mon:{
                    expectedData:[]
                  },
                  mis:{
                    expectedData:[]
                  },

                },
                value1:new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
                value2:'',
                value3:'',
                value4:'',
                state:0,
                timestamp:new Date(new Date().setHours(0, 0, 0, 0)).getTime()/1000,
                time_pairs:[],

                var_arr:[0,0,0,0],
                sum_arr:[0,0,0,0],
                cou_name:'',
                cou_type:'',
                sort_count:0
            }
        },
        methods: {
            handleSetLineChartData(type) {
                this.lineChartData = this.resultData[type]
                if (type === 'mem') {
                  this.cou_name = '注册会员'
                } else if (type === 'sem') {
                  this.cou_name = '短信总数'
                } else if (type === 'mon') {
                  this.cou_name = '收益总数'
                } else {
                  this.cou_name = '任务总数'
                }
                this.cou_type = type
            },

            date_change() {
              this.timestamp = this.value1/1000
              this.state = 0
              this.value2 = ''
              this.value3 = ''
              this.value4 = ''
              this.get_data()
              this.sort_count = 24
            },

            week_change() {
              this.timestamp = this.value2 ? new Date(this.value2.setHours(0, 0, 0, 0)).getTime()/1000 : ''
              this.state = 1
              this.value1 = ''
              this.value3 = ''
              this.value4 = ''
              this.get_data()
              this.sort_count = 7

            },

            month_change() {
              this.timestamp = this.value3/1000
              this.state = 2
              this.value1 = ''
              this.value2 = ''
              this.value4 = ''
              this.get_data()
              this.sort_count = new Date(new Date(this.value3).getYear(),new Date(this.value3).getMonth()+1,0).getDate()

            },

            year_change() {
              this.timestamp = this.value4/1000
              this.state = 3
              this.value1 = ''
              this.value2 = ''
              this.value3 = ''
              this.get_data()
              this.sort_count = 12
            },

            get_data() {
              let data = {
                self_id: parseInt(LocalStorage.get('self_id')),
                sess: LocalStorage.get('sess'),
                idempotent: new Date().getTime(),
                state:this.state,
                time:this.timestamp
              }

              this.$http.post(`${this.url}/get_report`,qs.stringify(data)).then((resp)=>{

                if (resp.ret_code === 0) {

                  this.var_arr = [resp.ret_data.mem_num,resp.ret_data.mis_num,resp.ret_data.sms_total_num,resp.ret_data.pur_num]
                  this.sum_arr = [resp.ret_data.mem_sum,resp.ret_data.mis_sum,resp.ret_data.sms_total_sum,resp.ret_data.pur_sum]

                  this.resultData.mem.expectedData = resp.ret_data.mem_report
                  this.resultData.sem.expectedData = resp.ret_data.sms_total_report
                  let tmp = resp.ret_data.pur_report
                  this.resultData.mon.expectedData = tmp.map(val=>(val*0.01).toFixed(2))
                  this.resultData.mis.expectedData = resp.ret_data.mis_report
                  this.lineChartData = this.cou_type === '' ?this.resultData.mon:this.resultData[this.cou_type]
                  // this.time_pairs = resp.ret_data.time_pairs

                } else {
                  this.msgTip(resp.ret_msg)
                }
              }).catch((error)=>{
                if (error !== 'loginErr') {
                    console.log(error);
                    this.msgTip('系统繁忙,请稍后重试')
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


        },

        created() {
          this.get_data()
          this.sort_count = 24
        }
    }
</script>

<style lang="scss" scoped>
  .dashboard-editor-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);
    position: relative;

    .github-corner {
      position: absolute;
      top: 0px;
      border: 0;
      right: 0;
    }

    .chart-wrapper {
      background: #fff;
      padding: 16px 16px 0;
      margin-bottom: 32px;
    }
  }

  @media (max-width:1024px) {
    .chart-wrapper {
      padding: 8px;
    }
  }
</style>
