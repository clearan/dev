<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">

      <template v-if='navShow'>
        <el-badge :value="sms_total_num" class="item" v-if="is_show[0]">
          <el-link >待发送短信</el-link>
        </el-badge>
        <el-badge :value="online_num" class="item" v-if="is_show[1]">
          <el-link size="small" @click="pushLink(1)">在线会员</el-link>
        </el-badge>
        <el-badge :value="worker_num" class="item" v-if="is_show[1]">
          <el-link size="small" @click="pushLink(2)">接单人数</el-link>
        </el-badge>
        <el-badge :value="proplem_mem_num" class="item" v-if="is_show[1]">
          <el-link size="small" @click="pushLink(3)">可疑会员</el-link>
        </el-badge>
        <el-badge :value="mem_cash_in_num" class="item" v-if="is_show[2]">
          <el-link size="small" @click="pushLink(4)">会员提款</el-link>
        </el-badge>
        <el-badge :value="mch_recharge_num" class="item" v-if="is_show[3]">
          <el-link size="small" @click="pushLink(5)">商户充值</el-link>
        </el-badge>
        <el-badge :value="mission_app_num" class="item" v-if="is_show[0]">
          <el-link size="small" @click="pushLink(6)">任务审核</el-link>
        </el-badge>

      </template>
      <template>
        <a href="javascript:void(0);">
          <i :class="iclass" @click="showHide" style="position:absolute;right:90px;top:18px;"></i>
        </a>
      </template>


      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1574943890&di=d7c62e9938dfc93737b5db4c0a76fa13&imgtype=jpg&er=1&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201709%2F26%2F20170926003219_RCjJE.jpeg" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">

          <el-dropdown-item>
            {{name}}
          </el-dropdown-item>


          <router-link to="/info/index" >
            <el-dropdown-item divided>
              修改密码
            </el-dropdown-item>
          </router-link>

<!--          <a target="_blank" href="https://panjiachen.github.io/vue-element-admin-site/#/">-->
<!--            <el-dropdown-item>Docs</el-dropdown-item>-->
<!--          </a>-->
          <el-dropdown-item divided>
            <span style="display:block;" @click="updateConfig">更新配置</span>
          </el-dropdown-item>
          <el-dropdown-item divided>
            <span style="display:block;" @click="uploadFile">文件</span>
          </el-dropdown-item>
          <el-dropdown-item divided>
            <span style="display:block;" @click="logout">退出</span>

          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import {LocalStorage} from '@/utils/storage'
import qs from 'qs'
export default {
  components: {
    Breadcrumb,
    Hamburger
  },
    data() {
      return {
          name:LocalStorage.get('user_name'),
          sms_total_num:undefined,
          online_num:undefined,
          worker_num:undefined,
          mem_cash_in_num:undefined,
          mch_recharge_num:undefined,
          mission_app_num:undefined,
          proplem_mem_num:undefined,
          is_show:[false,false,false,false],
          navShow:true,
          iclass:'el-icon-arrow-left'
      }
    },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  methods: {

      uploadFile(){
          let data = {
              self_id: parseInt(LocalStorage.get('self_id')),
              sess: LocalStorage.get('sess'),
              idempotent: new Date().getTime(),
              fdata:'aaa'

          };
          this.$http.post('http://10.10.35.137:9090/cgi/file_upload',qs.stringify(data)).then((resp)=>{
              console.log(resp)
          })
      },

      pushLink(val) {

          if (val === 1) {
              this.$router.push({path: '/monitor/index'})
          } else if (val === 2) {
              this.$router.push({path: '/monitor/order'})
          } else if (val === 3) {
              this.$router.push({path: '/monitor/doubt'})
          } else if (val === 4) {
              this.$router.push({path: '/member/withdraw'})
          } else if (val === 5) {
              this.$router.push({path: '/recharge/index'})
          } else {
              this.$router.push({path: '/service/index'})
          }

      },

    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    logout() {
      // await this.$store.dispatch('user/logout')
      // this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      //   console.log(this.$route)
      //   console.log(this.$route.fullPath)
      //  return
        localStorage.clear();
        window.location.href=process.env.VUE_APP_PUSH_URL;
       // window.location.href=`${process.env.VUE_APP_PUSH_URL}#/login?redirect=${this.$route.fullPath}`;
    },
      updateConfig() {
          let data = {
              t:Math.random()
          };
          this.$http.post(`${this.url}/update_config`,qs.stringify(data)).then((resp) => {
              console.log(resp)
          })
      },

      get_data() {
          let data = {
              self_id: parseInt(LocalStorage.get('self_id')),
              sess: LocalStorage.get('sess'),
              idempotent: new Date().getTime()
          };

          this.$http.post(`${this.url}/get_monitor_data`,qs.stringify(data)).then((resp)=>{
              if (resp.ret_code === 0) {
                  this.sms_total_num = resp.ret_data.sms_total_num === 0 ?undefined : resp.ret_data.sms_total_num
                  this.online_num = resp.ret_data.online_num === 0 ?undefined : resp.ret_data.online_num
                  this.worker_num = resp.ret_data.worker_num === 0 ?undefined : resp.ret_data.worker_num
                  this.mem_cash_in_num = resp.ret_data.mem_cash_in_num === 0 ?undefined : resp.ret_data.mem_cash_in_num
                  this.mch_recharge_num = resp.ret_data.mch_recharge_num === 0 ?undefined : resp.ret_data.mch_recharge_num
                  this.mission_app_num = resp.ret_data.mission_app_num === 0 ?undefined : resp.ret_data.mission_app_num
                  this.proplem_mem_num = resp.ret_data.proplem_mem_num === 0 ?undefined : resp.ret_data.proplem_mem_num
              }else{
                  this.sms_total_num = undefined
                  this.online_num = undefined
                  this.worker_num = undefined
                  this.mem_cash_in_num = undefined
                  this.mch_recharge_num = undefined
                  this.mission_app_num = undefined
                  this.proplem_mem_num = undefined
              }
          })
      },

      toggleLink() {
        console.log(2)
      },
      showHide() {
        this.navShow = this.navShow ? false : true
        this.iclass = this.iclass === 'el-icon-arrow-left' ? 'el-icon-arrow-down' : 'el-icon-arrow-left'
      }
  },

    created() {
      let route = JSON.stringify(LocalStorage.get('user_info'))
      if (route) {
        this.is_show[0] = route.includes('service/index') ? route.includes('service/index') :false
        this.is_show[1] = route.includes('member/index') ? route.includes('member/index') :false
        this.is_show[2] = route.includes('member/withdraw') ? route.includes('member/withdraw') :false
        this.is_show[3] = route.includes('recharge/index') ? route.includes('recharge/index') :false
      }
      this.get_data()
    },

    mounted() {
      setInterval(()=>{
          this.get_data()
      },(LocalStorage.get('time'))*1000||15*1000)
    }
}
</script>

<style lang="scss" scoped>
  /deep/ .el-badge__content.is-fixed {
    margin-top: 9px;
  }
  /deep/ .el-badge {
    position: relative;
    vertical-align: middle;
    display: inline-block;
    margin-bottom: 28px;
    margin-right: 50px;
  }
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
