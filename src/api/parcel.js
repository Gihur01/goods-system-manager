import request from '@/utils/request'
export function printParcel(params){
    return request({
        url:'/order/listParcel',
        method:'post',
        params:params
      })
}

export function fetchParcelList(params) {
  return request({
    url:'/order/listParcel',
    method:'get',
    params:params
  })
}

//this fetches a list,showing quantity of each item
export function fetchSummaizedItemList(params){
  return request({
    url:'/order/update/stockup',
    method:'post',
    params:params
  })
}