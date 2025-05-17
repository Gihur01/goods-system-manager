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
export function fetchSummarizedItemList(params){
  return request({
    url:'/order/update/stockup',
    method:'post',
    params:params
  })
}


export function updateParcelState(state,data){
  switch(state){
    case 4:
      return request({
        url:'/order/update/completePacking',
        method:'post',
        data:data
      })
    case 5:
      return request({
        url:'/order/update/collectParcel',
        method:'post',
        data:data
      })

  }
  
}

