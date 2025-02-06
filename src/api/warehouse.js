import request from '@/utils/request'
export function fetchList(params) {
  return request({
    url:'/warehouse/list',
    method:'get',
    params:params
  })
}