import request from '@/utils/request'
export function fetchList(params) {
  return request({
    url:'/warehouses/AllList',
    method:'get',
    params:params
  })
}