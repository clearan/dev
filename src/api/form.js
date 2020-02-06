import request from '@/utils/request'

export  function addData(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}
