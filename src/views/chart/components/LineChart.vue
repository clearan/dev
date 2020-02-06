<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
    import echarts from 'echarts'

    require('echarts/theme/macarons') // echarts theme
    import resize from './mixins/resize'

    export default {
        mixins: [resize],
        props: {
            className: {
                type: String,
                default: 'chart'
            },
            width: {
                type: String,
                default: '100%'
            },
            height: {
                type: String,
                default: '350px'
            },
            autoResize: {
                type: Boolean,
                default: true
            },
            chartData: {
                type: Object,
                required: true
            },
            timeType: {
                type: Object,
                required: true
            },
            nameType: {
                type: String,
            },
            sortCount: {
                type: Number
            }
        },
        data() {
            return {
                chart: null,
                arr: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
                    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
            }
        },
        watch: {
            chartData: {
                deep: true,
                handler(val) {
                    this.setOptions(val)
                }
            },


            sortCount(newValue, oldValue) {
                if (newValue === 24) {
                    this.arr = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
                        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
                } else if (newValue === 7) {
                    this.arr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
                } else if (newValue === 12) {
                    this.arr = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
                } else {
                    this.arr = Array.from(Array(newValue), (item, index) => index + 1)
                }
                this.setOptions(this.chartData)
            }
        },


        mounted() {

            this.$nextTick(() => {
                this.initChart()
            })
        },
        beforeDestroy() {
            if (!this.chart) {
                return
            }
            this.chart.dispose()
            this.chart = null
        },
        methods: {
            initChart() {
                this.chart = echarts.init(this.$el, 'macarons')
                this.setOptions(this.chartData)
            },

            setOptions({expectedData} = {}) {
                let nameType = this.nameType || '收益总数'

                this.chart.setOption({
                    xAxis: {
                        data: this.arr,
                        boundaryGap: false,
                        axisTick: {
                            show: false
                        }
                    },
                    grid: {
                        left: 10,
                        right: 10,
                        bottom: 20,
                        top: 30,
                        containLabel: true
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        },
                        padding: [5, 10]
                    },
                    yAxis: {
                        axisTick: {
                            show: false
                        }
                    },
                    legend: {
                        data: [nameType]
                    },
                    series: [
                        {
                            name: nameType, itemStyle: {
                                normal: {
                                    color: '#FF005A',
                                    lineStyle: {
                                        color: '#FF005A',
                                        width: 2
                                    }
                                }
                            },
                            smooth: true,
                            type: 'line',
                            data: expectedData,
                            animationDuration: 2800,
                            animationEasing: 'cubicInOut'
                        }
                    ]
                })
            }
        },

    }
</script>
