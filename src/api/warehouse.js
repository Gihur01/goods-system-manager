import request from '@/utils/request'
export function fetchList(params) {
  return request({
    url:'/admin/warehouses',
    method:'get',
    params:params
  })
}