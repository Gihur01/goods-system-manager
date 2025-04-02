import request from '@/utils/request'
  const token = localStorage.getItem("loginToken");  // 从本地存储中获取 token
  if (!token) {
    console.error("Token is missing or expired.");
  }
// 1. 获取所有物流信息（POST 请求）
export function fetchAll(data) {
  return request({
    url: '/cus/fetchAll',
    method: 'post',
    data: data, // 这里是请求体，必须用 `data`

  })
}

// 2. 删除物流记录（POST 请求，支持批量删除）
export function removeLogistics(logisticsList) {
  return request({
    url: '/cus/removeLogistics',
    method: 'post',
    data: logisticsList
  })
}

// 3. 保存或更新物流记录（POST 请求）
export function saveOrUpdateLogistics(data) {
  return request({
    url: '/cus/saveOrUpdate',
    method: 'post',
    data: data
  })
}

