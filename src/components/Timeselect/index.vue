<template>
  <div>
    <el-date-picker
      v-model="value1"
      type="date"
      placeholder="选择开始日期"
      value-format="timestamp"
      style="width: 250px"
      @change="beg_change"
    >
    </el-date-picker>

    <span>至</span>

    <el-date-picker
      v-model="value2"
      type="date"
      placeholder="选择结束日期"
      value-format="timestamp"
      style="width: 250px"
      @change="end_change"
    >
    </el-date-picker>

    <el-button v-waves style="margin-left: 20px;margin-bottom: 3px;" class="filter-item" @click="getTime(1)" :type="button[0]">
      今日
    </el-button>
    <el-button v-waves style="margin-left: 20px;margin-bottom: 3px;" class="filter-item" @click="getTime(2)" :type="button[1]">
      昨日
    </el-button>
    <el-button v-waves style="margin-left: 20px;margin-bottom: 3px;" class="filter-item" @click="getTime(3)" :type="button[2]">
      本周
    </el-button>
    <el-button v-waves style="margin-left: 20px;margin-bottom: 3px;" class="filter-item" @click="getTime(4)" :type="button[3]">
      上周
    </el-button>
    <el-button v-waves style="margin-left: 20px;margin-bottom: 3px;" class="filter-item" @click="getTime(5)" :type="button[4]">
      本月
    </el-button>
    <el-button v-waves style="margin-left: 20px;margin-bottom: 3px;" class="filter-item" @click="getTime(6)" :type="button[5]">
      上月
    </el-button>
    <el-button v-waves style="margin-left: 20px;margin-bottom: 3px;" class="filter-item" @click="getTime(7)" :type="button[6]">
      全部
    </el-button>
  </div>
</template>

<script>
    export default {
        name :'Timeselect',
        data() {
            return {
                value1:'',
                value2:'',
                button:['','','','','','',''],
            }
        },

        methods:{
            beg_change() {
                this.$emit('getTime',{value1:this.value1,value2:this.value2})
                this.button = ['','','','','','','']
            },

            end_change() {
                this.$emit('getTime',{value1:this.value1,value2:this.value2})
                this.button = ['','','','','','','']
            },

            getTime(val) {
                let init = new Date(new Date().setHours(0, 0, 0, 0))
                let day = new Date().getDay()

                if (val === 1) {//今日
                    this.value1 = init
                    this.value2 = init
                } else if (val === 2) {//昨日
                    this.value1 = init-24*3600*1000
                    this.value2 = init-24*3600*1000
                } else if (val === 3) {//本周
                    this.value1 = init-day*24*3600*1000
                    this.value2 = init-day*24*3600*1000+6*24*3600*1000
                } else if (val === 4) {//上周
                    this.value1 = init-(day+7)*24*3600*1000
                    this.value2 = init-(day+6)*24*3600*1000+5*24*3600*1000
                } else if (val === 5) {//本月
                    this.value1 = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()
                    this.value2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate()).getTime();
                } else if(val === 6) {//上月
                    this.value1 = new Date(new Date().getFullYear(), new Date().getMonth()-1, 1).getTime()
                    this.value2 = new Date(new Date().getFullYear(), new Date().getMonth()-1, new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate()).getTime();
                } else {
                    this.value1 = ''
                    this.value2 = ''
                }
                this.button = ['','','','','','','']
                this.button[val-1] = 'primary'
                this.$emit('getTimeResult',{value1:this.value1,value2:this.value2})
            },
        }
	}
</script>
