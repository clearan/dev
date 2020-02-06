import router from './router'
import {Message,MessageBox} from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import {LocalStorage} from '@/utils/storage'
const _import = require('./router/_import_') //获取组件的方法
import Layout from '@/layout'
NProgress.configure({showSpinner: false}) // NProgress Configuration

let constantRoutes = [],userInfo = LocalStorage.get('user_info')

let gen = {
    path:"/",
    redirect: '/auth/list'
  },
  common = [
    {
      path: '/info',
      component: 'Layout',
      redirect: '/info/index',
      hidden: true,
      children: [
        {
          path: 'index',
          component: 'info/index',
          name: 'Index',
          meta: { title: '修改密码', icon: 'user', noCache: true }
        }
      ]
    },
    {
      path: '/404',
      component: 'error-page/404',
      hidden: true
    },
    {
      hidden: true,
      path: '/error',
      component: 'Layout',
      redirect: 'noRedirect',
      name: 'ErrorPages',
      meta: {
        title: 'Error Pages',
        icon: '404'
      },
      children: [
        {
          path: '401',
          component: 'error-page/401',
          name: 'Page401',
          meta: { title: '401', noCache: true }
        },
        {
          path: '404',
          component: 'error-page/404',
          name: 'Page404',
          meta: { title: '404', noCache: true }
        }
      ]
    }
  ],

  permission = {
    path: '/auth',
    component: 'Layout',
    redirect:'/auth/list',
    meta: { title: '系统管理'},
    children: [
      {
        path: '/auth/list',
        name: 'List',
        component: 'auth/list',
        meta: { title: '权限管理'}
      },
      {
        hidden:true,
        path: '/auth/add',
        name: 'Add',
        component: 'auth/add',
        meta: { title: '添加权限'}
      },
      {
        path: '/role/list',
        name: 'List',
        component: 'role/list',
        meta: { title: '角色管理'}
      },
      {
        hidden:true,
        path: '/role/add',
        name: 'Add',
        component:'role/add',
        meta: { title: '添加角色'}
      },
      {
        hidden: true,
        path: '/role/edit',
        name: 'Edit',
        component: 'role/edit',
        meta: { title: '编辑角色'}
      },
      {
        path: '/user/list',
        name: 'List',
        component: 'user/list',
        meta: { title: '用户列表'}
      },
      {
        hidden: true,
        path: '/user/detail',
        name: 'Detail',
        component: 'user/detail',
        meta: { title: '用户详情'}
      },
      // {
      //   path: '/check/list',
      //   name: 'Check',
      //   component:'check/list',
      //   meta: { title: '审核列表'}
      // },
      {
        hidden: true,
        path: '/role/tree',
        name: 'Tree',
        component: 'role/tree',
        meta: { title: 'xxx'}
      }
    ]
  }
function compare(property){
  return function(a,b){
    var value1 = a[property];
    var value2 = b[property];
    return value1 - value2;
  }
}

if (userInfo) {
  if (userInfo.sys_role > 0) {

    if (userInfo.auth_list === undefined) {
      //系统管理用户
      constantRoutes = constantRoutes.concat(common)
      constantRoutes.push(permission)
      constantRoutes.push(gen)
      constantRoutes.push({ path: '*', redirect: '/404', hidden: true })
    } else {
      //根据id排序20200109加入，root也拥有业务能力
      userInfo.auth_list.sort(compare('id'))
      for(var k=0;k<userInfo.auth_list.length;k++) {
        if(userInfo.auth_list[k].auth2_list !== undefined) {
          userInfo.auth_list[k].auth2_list.sort(compare('id'))
        }
      }
      console.log(userInfo.auth_list)
      var arr = []
      for (var i=0;i<userInfo.auth_list.length;i++) {
        var obj = {}
        obj.path = '/'+userInfo.auth_list[i]['url']
        obj.name = '/'+userInfo.auth_list[i]['url']
        obj.component = 'Layout'
        obj.children = []
        obj.redirect ='/'+userInfo.auth_list[i]['url']+'/index'
        if (userInfo.auth_list[i]['auth2_list'] !== undefined) {
          //有二级菜单
          obj.meta = {title:userInfo.auth_list[i]['name']}
          obj.alwaysShow = true
          for (var j=0;j<userInfo.auth_list[i]['auth2_list'].length;j++) {
            var child = {}
            //加入详情页
            if (userInfo.auth_list[i]['auth2_list'][j]['url'].includes('detail')) {
              //child.path = '/'+userInfo.auth_list[i]['auth2_list'][j]['url']+'/:id'
              child.hidden = true
            }
            child.path = '/'+userInfo.auth_list[i]['auth2_list'][j]['url']
            child.name = '/'+userInfo.auth_list[i]['auth2_list'][j]['url']

            child.component = userInfo.auth_list[i]['auth2_list'][j]['url']
            child.meta = { title: userInfo.auth_list[i]['auth2_list'][j]['name']}
            obj.children.push(child)
          }
        }else {
          var child2 = {},url =userInfo.auth_list[i]['url']
          child2.path = 'index'
          // child2.component = () => import('@/views/'+url+'/index')
          child2.component = url+'/index'
          child2.name = userInfo.auth_list[i]['url']
          child2.meta = { title: userInfo.auth_list[i]['name']}
          obj.children.push(child2)
        }
        arr.push(obj)
      }//截止这里20200109

      //非root但是有系统权限
      constantRoutes = constantRoutes.concat(common)
      constantRoutes.push(permission)
      constantRoutes.push(gen)
      constantRoutes = constantRoutes.concat(arr)//新增20200109
      constantRoutes.push({ path: '*', redirect: '/404', hidden: true })
    }

  } else {
    //一般用户
    if (userInfo.auth_list !== undefined ) {
      //根据id排序
      userInfo.auth_list.sort(compare('id'))
      for(var k=0;k<userInfo.auth_list.length;k++) {
        if(userInfo.auth_list[k].auth2_list !== undefined) {
          userInfo.auth_list[k].auth2_list.sort(compare('id'))
        }
      }

      //有菜单栏，显示storage中的权限菜单
      let g_route = ''//init会展现的页面
      console.log(userInfo.auth_list)
      if (userInfo.auth_list[0]['auth2_list'] !==undefined) {
        g_route = userInfo.auth_list[0]['auth2_list'][0]['url']
        // console.log(userInfo.auth_list)
        // console.log(userInfo.auth_list[0]['auth2_list'])
        // console.log(g_route)
        // if (g_route.includes('detail')) {
        //   g_route = userInfo.auth_list[0]['auth2_list'][1]['url']
        // }
      }else {
        g_route = userInfo.auth_list[0]['url']
      }
      let init = {
        path:"/",
        redirect: '/'+g_route
      }

      var arr = []
      for (var i=0;i<userInfo.auth_list.length;i++) {
        var obj = {}
        obj.path = '/'+userInfo.auth_list[i]['url']
        obj.name = '/'+userInfo.auth_list[i]['url']
        obj.component = 'Layout'
        obj.children = []
        obj.redirect ='/'+userInfo.auth_list[i]['url']+'/index'
        if (userInfo.auth_list[i]['auth2_list'] !== undefined) {
          //有二级菜单
          obj.meta = {title:userInfo.auth_list[i]['name']}
          obj.alwaysShow = true
          for (var j=0;j<userInfo.auth_list[i]['auth2_list'].length;j++) {
            var child = {}
            //加入详情页
            if (userInfo.auth_list[i]['auth2_list'][j]['url'].includes('detail')) {
              //child.path = '/'+userInfo.auth_list[i]['auth2_list'][j]['url']+'/:id'
              child.hidden = true
            }
            child.path = '/'+userInfo.auth_list[i]['auth2_list'][j]['url']
            child.name = '/'+userInfo.auth_list[i]['auth2_list'][j]['url']

            child.component = userInfo.auth_list[i]['auth2_list'][j]['url']
            child.meta = { title: userInfo.auth_list[i]['auth2_list'][j]['name']}
            obj.children.push(child)
          }
        }else {
          var child2 = {},url =userInfo.auth_list[i]['url']
          child2.path = 'index'
          // child2.component = () => import('@/views/'+url+'/index')
          child2.component = url+'/index'
          child2.name = userInfo.auth_list[i]['url']
          child2.meta = { title: userInfo.auth_list[i]['name']}
          obj.children.push(child2)
        }
        arr.push(obj)
      }

      arr.push(init)
      arr = arr.concat(common)

      arr.push( { path: '*', redirect: '/404', hidden: true })

      constantRoutes = arr
    }else {
      /*
        没有auth_list，可能两种情况
        1、申请角色成功，但角色没有分配权限，显示一个提示页面“您的角色没有任何权限”
        2、没有申请角色
      */
      var page = []
      if (userInfo.role_id !== undefined ) {
        page = [
          {
            path:"/",
            redirect: '/warn/index'
          },
          {
            path: '/warn',
            component: 'Layout',
            redirect: '/warn/index',
            hidden: true,
            children: [
              {
                path: 'index',
                component: 'warn/index',
                name: 'Index',
                meta: { title: '提示页'}
              }
            ]
          },
          {
            path: '/info',
            component: 'Layout',
            redirect: '/info/index',
            hidden: true,
            children: [
              {
                path: 'index',
                component: 'info/index',
                name: 'Index',
                meta: { title: '修改密码'}
              }
            ]
          }
        ]
      }else {
        page=[
          {
            path:"/",
            redirect: '/apply/index'
          },

          {
            path: '/apply',
            component: 'Layout',
            children: [{
              path: '/apply/index',
              name: 'Index',
              component: 'apply/index',
              meta: { title: '申请角色'}
            },{
              hidden: true,
              path: '/apply/success',
              name: 'Success',
              component: 'apply/success',
              meta: { title: '申请角色'}
            }],
          },

          {
            path: '/info',
            component: 'Layout',
            redirect: '/info/index',
            hidden: true,
            children: [
              {
                path: 'index',
                component: 'info/index',
                name: 'Index',
                meta: { title: '修改密码'}
              }
            ]
          }
        ]
      }
      constantRoutes = page
    }
  }
}

var getRouter;

router.beforeEach( (to, from, next) => {
  NProgress.start()
  if (!getRouter) { //不加这个判断，路由会陷入死循环
    if (!LocalStorage.get('router')) {
      if (!userInfo) {
        window.location.href=`${process.env.VUE_APP_PUSH_URL}#/login?redirect=${to.path}`;
      }else{
        getRouter = constantRoutes //假装模拟后台请求得到的路由数据
        let date = new Date().getTime();
        LocalStorage.set('router', getRouter,date+60*60*1000) //存储路由到localStorage
        routerGo(to, next) //执行路由跳转方法
      }
    } else { //从localStorage拿到了路由
      //getRouter = LocalStorage.get('router') //拿到路由
      getRouter = constantRoutes //拿到路由 2019.12.2  用户申请成功角色后，不退出系统（不会清掉storage的router）。所以这里每次从登录接口拿router赋值给路由
      routerGo(to, next)
    }
  } else {
    next()
  }
})


function routerGo(to, next) {
  getRouter = filterAsyncRouter(getRouter) //过滤路由
  router.addRoutes(getRouter) //动态添加路由
  global.antRouter = getRouter //将路由数据传递给全局变量，做侧边栏菜单渲染工作
  next({ ...to, replace: true })
}

function filterAsyncRouter(asyncRouterMap) { //遍历后台传来的路由字符串，转换为组件对象
  const accessedRouters = asyncRouterMap.filter(route => {
    if (route.component) {
      // console.log(route.component)
      // console.log(typeof route.component)
      if (route.component === 'Layout') { //Layout组件特殊处理
        //console.log("=========== enter ==============")
        route.component = Layout
      } else {
        // if (typeof route.component == 'string') {
        //   route.component = _import(route.component)
        // }
        route.component = _import(route.component)
      }
    }
    if (route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children)
    }
    return true
  })

  return accessedRouters
}

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

// function diff(obj1,obj2){
//   var o1 = obj1 instanceof Object;
//   var o2 = obj2 instanceof Object;
//   if(!o1 || !o2){/*  判断不是对象  */
//     return obj1 === obj2;
//   }
//
//   if(Object.keys(obj1).length !== Object.keys(obj2).length){
//     return false;
//     //Object.keys() 返回一个由对象的自身可枚举属性(key值)组成的数组,例如：数组返回下表：let arr = ["a", "b", "c"];console.log(Object.keys(arr))->0,1,2;
//   }
//
//   for(var attr in obj1){
//     var t1 = obj1[attr] instanceof Object;
//     var t2 = obj2[attr] instanceof Object;
//     if(t1 && t2){
//       return diff(obj1[attr],obj2[attr]);
//     }else if(obj1[attr] !== obj2[attr]){
//       return false;
//     }
//   }
//   return true;
// }
