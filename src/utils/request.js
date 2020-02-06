import axios from 'axios'
import Vue from 'vue'
import { Message, MessageBox} from 'element-ui'
import {LocalStorage} from '@/utils/storage'


//let baseURL = 'http://10.10.35.137:8082/cgi/';
//将URL地址前面相同的一段封装
const $http = axios.create({
  //baseURL: baseURL
  timeout: 10000
})

// $http.defaults.retry = 4;
// $http.defaults.retryDelay = 1000;

$http.interceptors.request.use(function (config) {

  const sess = LocalStorage.get('sess')

  if (sess === '' || sess === undefined || sess === null) {
    // MessageBox.confirm('您的登录已失效，请重新登录', '温馨提示', {
    //   confirmButtonText: '确定',
    //   cancelButtonText: '取消',
    //   type: 'warning',
    //   closeOnClickModal:false,
    //   closeOnPressEscape:false,
    // }).then(() => {
    //   window.location.href=process.env.VUE_APP_PUSH_URL+'#/login?redirect='+window.location.href.split('#')[1];
    // })
    var clearTime = 3
    var time = setInterval(() => {
      clearTime--
      if (clearTime === 1) {
        clearInterval(time)
      }
      a.message = '您的登录已过期，'+clearTime+'秒后跳转至登录页面'
    }, 1000)

    var a = Message({
      message:'您的登录已过期，3秒后跳转至登录页面',
      type:'error',
      center:true,
      onClose:action=>{
        window.location.href=process.env.VUE_APP_PUSH_URL+'#/login?redirect='+window.location.href.split('#')[1];
      }
    })
  } else {

    return config;
  }

}, function (error) {
  return Promise.reject(error);
});


// 封装get
export const get = (url, params) => {
  params = params || {};
  return new Promise((resolve, reject) => {
    $http.get(url, {
      params,
    }).then(resp => {
      if (resp.status === 200 && resp.data !== undefined && resp.data !== null) {
        if (resp.data.ret_code === -50000 || resp.data.ret_code === -50001) {
          MessageBox.confirm('您的登录已失效，请重新登录', '温馨提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            closeOnClickModal:false,
            closeOnPressEscape:false,
          }).then(() => {
            new Promise(resolve => {
              localStorage.clear();
              resolve()
            }).then(() => {
              window.location.href=process.env.VUE_APP_PUSH_URL+'#/login?redirect='+window.location.href.split('#')[1];
            })
          })

        }else{
          resolve(resp.data)
        }

      } else {
        alert('网络繁忙')
      }
    }).catch(err => {
      reject(err)
    })
  })
}

//封装post
export const post = (url, params) => {
  var self_id = LocalStorage.get("self_id");

  do {
    if (self_id === undefined || self_id === null) {
        break;
    }

    if (window.self_id === undefined || window.self_id === null) {
        window.self_id = self_id
    } else {
        if (window.self_id !== self_id) {
            break;
        }
    }

    params = params || {};
    return new Promise((resolve, reject) => {
      $http.post(url,
        params
      ).then(resp => {
        if (resp.status === 200 && resp.data !== undefined && resp.data !== null) {
          if (resp.data.ret_code === -50000 || resp.data.ret_code === -50001) {

            // MessageBox.confirm('您的登录已失效，请重新登录', '温馨提示', {
            //   confirmButtonText: '确定',
            //   cancelButtonText: '取消',
            //   type: 'warning',
            //   closeOnClickModal:false,
            //   closeOnPressEscape:false,
            // }).then(() => {
            //   new Promise(resolve => {
            //     localStorage.clear();
            //     resolve()
            //   }).then(() => {
            //     // window.location.href=process.env.VUE_APP_PUSH_URL;
            //     window.location.href=process.env.VUE_APP_PUSH_URL+'#/login?redirect='+window.location.href.split('#')[1];
            //   })
            // })
            var clearTime = 3
            var time = setInterval(() => {
              clearTime--
              if (clearTime === 1) {
                clearInterval(time)
              }
              a.message = '您的登录已过期，'+clearTime+'秒后跳转至登录页面'
            }, 1000)

            var a = Message({
              message:'您的登录已过期，3秒后跳转至登录页面',
              type:'error',
              center:true,
              onClose:action=>{
                window.location.href=process.env.VUE_APP_PUSH_URL+'#/login?redirect='+window.location.href.split('#')[1];
              }
            })

          }else{
            resolve(resp.data)
          }

        } else {
          alert('网络繁忙')
        }
      }).catch(err => {
        // console.log(err.request)
        // console.log(err.config)
        // console.log(1111)
        reject(err)
      })
    })
  } while(0);

  // MessageBox.confirm('您的登录已失效，请重新登录', '温馨提示', {
  //   confirmButtonText: '确定',
  //   cancelButtonText: '取消',
  //   type: 'warning',
  //   closeOnClickModal:false,
  //   closeOnPressEscape:false,
  // }).then(() => {
  //   window.location.href=process.env.VUE_APP_PUSH_URL+'#/login?redirect='+window.location.href.split('#')[1];
  // })
  var clearTime = 3
  var time = setInterval(() => {
    clearTime--
    if (clearTime === 1) {
      clearInterval(time)
    }
    a.message = '您的登录已过期，'+clearTime+'秒后跳转至登录页面'
  }, 1000)

  var a = Message({
    message:'您的登录已过期，3秒后跳转至登录页面',
    type:'error',
    center:true,
    onClose:action=>{
      window.location.href=process.env.VUE_APP_PUSH_URL+'#/login?redirect='+window.location.href.split('#')[1];
    }
  })

  return Promise.reject("loginErr")
}


