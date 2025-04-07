<template>
  <div>
    <h2>物流信息管理</h2>

    <!-- 操作按钮 -->
    <div class="button-group">
      <button @click="triggerFileUpload">新增和更新</button>
      <button @click="deleteSelected">删除</button>
      <button @click="refreshData">刷新</button>
      <button @click="downloadExample">下载示例</button>
      <button @click="triggerPdfUpload">上传附件</button>

      <!-- 隐藏的上传输入框 -->
      <input type="file" ref="fileInput" hidden @change="handleFileUpload" />
      <input type="file" ref="pdfInput" hidden accept="application/pdf" @change="handlePdfUpload" />
    </div>

    <!-- 表格区域 -->
    <table class="logistics-table" border="1">
      <thead>
        <tr>
          <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
          <th>最新轨迹<br><small>Latest Track</small></th>
          <th>轨迹更新时间<br><small>Track Update Time</small></th>
          <th>运单号<br><small>Waybill Number</small></th>
          <th>客户单号<br><small>Customer Order No.</small></th>
          <th>转运单号<br><small>Transit No.</small></th>
          <th>柜号<br><small>Container No.</small></th>
          <th>状态<br><small>Status</small></th>
          <th>物流渠道名称<br><small>Logistics Channel</small></th>
          <th>装柜港口<br><small>Loading Port</small></th>
          <th>装柜时间<br><small>Loading Time</small></th>
          <th>卸柜港口<br><small>Arrival Port</small></th>
          <th>卸柜时间<br><small>Arrival Date</small></th>
          <th>收件日期<br><small>Receive Date</small></th>
          <th>收件时间<br><small>Receive Time</small></th>
          <th>清关材料<br><small>Customs Docs</small></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="logistics in logisticsList" :key="logistics.id">
          <td><input type="checkbox" v-model="selectedItems" :value="logistics.id" /></td>

          <td>{{ getValue(logistics.latestTrackNotes) }}</td>
          <td>{{ formatTimestamp(logistics.trackUpdateTime) }}</td>
          <td>{{ getValue(logistics.waybillNumber) }}</td>
          <td>{{ getValue(logistics.customerOrderNumber) }}</td>
          <td>{{ getValue(logistics.fwTrackingNumber) }}</td>
          <td>{{ getValue(logistics.containerNumber) }}</td>
          <td>{{ getValue(logistics.status) }}</td>
          <td>{{ getValue(logistics.logisticsChannel) }}</td>
          <td>{{ getValue(logistics.loadingPort) }}</td>
          <td>{{ getValue(logistics.loadingTime) }}</td>
          <td>{{ getValue(logistics.arrivalPort) }}</td>
          <td>{{ getValue(logistics.arrivalDate) }}</td>
          <td>{{ getValue(logistics.receiveDate) }}</td>
          <td>{{ getValue(logistics.receiveTime) }}</td>

          <td>
            <template v-if="logistics.customsClearanceMaterials">
              <a href="javascript:void(0)" @click="downloadFile(logistics.customsClearanceMaterials)">
                {{ getFileName(logistics.customsClearanceMaterials) }}
              </a>
            </template>
            <span v-else>未提供</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>



<script>
import axios from 'axios'
import * as XLSX from 'xlsx'
import { getToken } from '@/utils/auth'

export default {
  data() {
    return {
      logisticsList: [], // 物流数据
      selectedItems: [], // 选中的物流记录ID
      selectAll: false, // 全选状态
    }
  },
  methods: {
    getValue(value) {
      return value || '未提供';
    },
    getFileName(path) {
      return path.split('/').pop();
    },
      formatTimestamp(timestamp) {
        if (!timestamp) return '未提供';
        const date = new Date(timestamp);
        return date.toLocaleString(); // 返回格式如 "2025/4/5 上午10:00:00"
      },
    async downloadFile(fileUrl) {
      const token = getToken()
            try {
              console.log("开始下载文件:", fileUrl); // 调试，确保文件 URL 正确传递

              const response = await axios.get(fileUrl, {
                headers: { Authorization: `${token}` }, // 如果需要 Token，请确保已正确传递
                responseType: 'blob', // 以 Blob 形式获取文件
              });

              // 确保后端返回的数据是有效的文件
              if (!response.data) {
                throw new Error("后端没有返回文件内容");
              }

              // 获取文件名（可以从 URL 或响应头中获取）
              let downloadFileName = fileUrl.split('/').pop();  // 从 URL 获取文件名
              const contentDisposition = response.headers['content-disposition'];
              if (contentDisposition) {
                const matches = contentDisposition.match(/filename="(.+)"/);
                if (matches && matches[1]) {
                  downloadFileName = decodeURIComponent(matches[1]);
                }
              }

              // 创建下载链接
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', downloadFileName); // 设置下载的文件名

              // 触发下载
              document.body.appendChild(link);
              link.click();

              // 清理资源
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url); // 释放临时 URL

            } catch (error) {
              console.error("文件下载失败:", error);
              alert(`下载失败：${error.response.data.message || error.message}`);
            }
          },
    // 获取所有物流信息
    fetchLogistics() {
      // 写死的 token
      const token = getToken()
      // 发送请求获取物流信息
      axios.post('http://47.91.89.160:8080/cus/fetchAll', {}, {
        headers: {
          'Authorization': `${token}`,  // 在请求头中加上 token
        }
      })
        .then(response => {
          console.log("完整返回:", response);  // 打印整个响应对象
          console.log("返回的数据:", response.data);  // 打印实际返回的数据

          if (response.data && Array.isArray(response.data)) {
            this.logisticsList = response.data;  // 更新表格数据
          } else {
            console.error("返回的数据格式不正确:", response.data);
            this.logisticsList = [];
          }
        })
        .catch(error => {
          console.error("获取物流信息失败:", error);  // 打印整个错误对象
          if (error.response) {
            console.log("请求头:", error.response.config.headers);
            console.error("后端错误信息:", error.response);
            alert("后端错误信息：" + error.response.data);
          } else if (error.message) {
            console.error("请求错误信息:", error.message);
            alert("请求错误信息：" + error.message);
          } else {
            console.error("未知错误:", error);
            alert("未知错误:" + JSON.stringify(error));
          }
        });
    },

    // 触发文件上传框
    triggerFileUpload() {
      this.$refs.fileInput.click()
    },

    // 处理文件上传
        handleFileUpload(event) {
          const file = event.target.files[0]
          if (!file || !file.name.endsWith('.xlsx')) {
            alert('请上传有效的 Excel 文件')
            return
          }

          const reader = new FileReader()
          reader.onload = (e) => {
            const binaryStr = e.target.result
            const workbook = XLSX.read(binaryStr, { type: 'binary' })
            const sheetName = workbook.SheetNames[0] // 读取第一个工作表
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            // 将 Excel 中的数据转化为符合后端接口要求的格式
            const formattedData = jsonData.map(row => ({
              receiveDate: row['Receive Date'],
              receiveTime: row['Receive Time'],
              waybillNumber: row['Waybill Number'],
              customerOrderNumber: row['Customer Order Number'],
              fwTrackingNumber: row['Fw Tracking Number'],
              containerNumber: row['Container Number'],
              status: row['Status'],
              logisticsChannel: row['Logistics Channel Name'],
              loadingPort: row['Loading Port'],
              loadingTime: row['Loading Time'],
              arrivalPort: row['Arrive Port'],
              arrivalDate: row['Arrive Date'],
              latestTrackNotes: row['Latest Track Notes'],
              trackUpdateTime: row['Track Update Time'],
              // Add more fields here as per your API
            }))

            // 调用接口保存/更新物流记录
            this.saveOrUpdateLogistics(formattedData)
          }
          reader.readAsArrayBuffer(file)  // 使用readAsArrayBuffer
        },



    // 调用接口保存/更新物流记录
    saveOrUpdateLogistics(data) {
      const token = getToken()
           axios.post('http://47.91.89.160:8080/cus/saveOrUpdate', data, {
        headers: {
          'Authorization': `${token}`,
        }
      }).then(response => {
        alert('操作成功')
        this.refreshData() // 刷新数据
      }).catch(error => {
        console.error("保存/更新物流记录失败", error)
        alert("保存/更新失败")
      })
    },

    // 触发 PDF 上传
        triggerPdfUpload() {
          if (this.selectedItems.length !== 1) {
            alert('请先选中一条物流记录，再上传附件')
            return
          }
          this.$refs.pdfInput.click()
        },

        // 处理 PDF 上传
        handlePdfUpload(event) {
          const file = event.target.files[0]
          if (!file || !file.name.endsWith('.pdf')) {
            alert('请上传 PDF 文件')
            return
          }

          // 获取选中物流记录的柜号
          const selectedLogistics = this.logisticsList.find(item => item.id === this.selectedItems[0])
          if (!selectedLogistics || !selectedLogistics.containerNumber) {
            alert('所选记录无柜号，无法上传')
            return
          }

          const containerNumber = selectedLogistics.containerNumber
          this.uploadPdfFile(file, containerNumber)
        },

        // 调用 API 上传 PDF 文件
        uploadPdfFile(file, containerNumber) {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('containerNumber', containerNumber)
      const token = getToken()
          axios.post('http://47.91.89.160:8080/cus/uploadFile', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `${token}`,
            }
          }).then(response => {
            alert('附件上传成功！')
            this.refreshData()
          }).catch(error => {
            console.error("附件上传失败", error)
            alert("附件上传失败：" + (error.response.data || error.message))
          })
        },

    // 删除选中的物流记录
    deleteSelected() {
      if (this.selectedItems.length === 0) {
        alert('请选择要删除的记录')
        return
      }

      // 获取选中的数据
      const logisticsListToDelete = this.selectedItems.map(id => {
        const logistics = this.logisticsList.find(item => item.id === id)
        return {
          waybillNumber: logistics.waybillNumber,
          customerOrderNumber: logistics.customerOrderNumber,
          fwTrackingNumber: logistics.fwTrackingNumber
        }
      })

      // 发送删除请求
      const token = getToken()
      axios.post('http://47.91.89.160:8080/cus/removeLogistics', logisticsListToDelete, {
        headers: {
          'Authorization': `${token}`,
        }
      }).then(response => {
        alert(response.data)
        this.refreshData()
      }).catch(error => {
        console.error("删除物流记录失败", error)
        alert("删除失败")
      })
    },

    // 刷新数据
    refreshData() {
      this.fetchLogistics()
    },

        // 下载示例 Excel 文件
        downloadExample() {
          // 示例数据
          const exampleData = [
            ["No", "Receive Date", "Receive Time", "Waybill Number", "Customer Order Number", "Fw Tracking Number", "Container Number", "Status", "Logistics Channel Name", "Loading Port", "Loading Time", "Arrive Port", "Arrive Date", "Target Post Code", "Traget Country", "E-commerce", "Fulfillment Warehouse", "Is Remote", "CTNS", "TIL PCS", "Net Weight kg", "Gross Weight kg", "Measurement m3", "Bill Weight", "Confirmed Bill Weight", "CD Type", "CC Type", "CL Type", "Material", "Additional Notes", "DESCRIPTION", "CC Amount", "Problem Item Type", "Lading Number", "Latest Track Notes", "Track Update Time"],
            [1, "2024/9/30", "1909", "CNxxxxxxxxxxxx", "Fxx952358", "1Z00xx6xxxxxxxxxxxxx", "XxKxx3xxxxx", "提交/Create", "中欧铁路UPS包税专线/China-Europe Railway DHL Tax-inclusive Line", "NingBo", "2024/11/27", "Duisburg, Germany", "2024/12/18", "12529", "德国/Germany", "Amazon", "DUS2", "Normal", 10, 100, 100, 100, 1.5, 105, "", "买单报关/customs declaration Proxy", "包税/Tax-inclusive", "整柜 AllInFCL", "", "棉衣Cotton-padded jackets", 100000, "N", "。"]
          ];

          // 创建工作簿
          const ws = XLSX.utils.aoa_to_sheet(exampleData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Example");

          // 导出文件
          XLSX.writeFile(wb, "物流信息示例.xlsx");
        },

    // 全选功能
    toggleSelectAll() {
      this.selectedItems = this.selectAll ? this.logisticsList.map(item => item.id) : []
    }
  },

  mounted() {
    this.refreshData() // 组件加载时自动获取数据
  }
}
</script>

<style scoped>
body {
  font-size: 14px;
}

/* 表格样式 */
.logistics-table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  font-size: 13px;
}

.logistics-table th,
.logistics-table td {
  padding: 8px;
  text-align: center;
  border: 1px solid #ddd;
}

.logistics-table th small {
  display: block;
  font-size: 11px;
  color: #888;
  margin-top: 4px;
}

/* 按钮样式 */
.button-group {
  margin-bottom: 15px;
}

button {
  margin: 5px;
  padding: 8px 15px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  transition: background-color 0.3s;
  cursor: pointer;
}

button:hover {
  background-color: #66b1ff;
}
</style>
