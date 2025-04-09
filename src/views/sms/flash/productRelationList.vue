<template>
  <div>
    <h2>{{ language === 'zh' ? 'NEO 清关跟踪系统' : 'NEO Customs clearance tracking system' }}</h2>

    <div>
      <!-- 时间选择器 -->
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        unlink-panels
        :picker-options="{
          disabledDate(time) {
            return time.getTime() > Date.now(); // 禁止选择未来时间
          }
        }"
        style="margin-bottom: 10px;"
      ></el-date-picker>
      <button @click="refreshData">{{ language === 'zh' ? '刷新' : 'Refresh' }}</button>

    </div>

    <!-- 操作按钮 -->
    <div class="button-group">
      <button @click="triggerFileUpload">{{ language === 'zh' ? '新增和更新' : 'Add / Update' }}</button>
      <button
        @click="downloadFile('http://47.91.89.160:8080/cus/download/example/FCL_EU_Tracing_Upload_Template-Beta.xls')">
        {{ language === 'zh' ? '下载示例' : 'Download Example' }}
      </button>
      <button @click="deleteSelected">{{ language === 'zh' ? '删除' : 'Delete' }}</button>


      <button @click="triggerExcelUpload">{{ language === 'zh' ? '上传附件' : 'Upload Customs_clearance_doc' }}</button>
      <button
        @click="downloadFile('http://47.91.89.160:8080/cus/download/example/Customs_clearance_doc(Beta)_EGLV143XXXXXXX.xlsx')">
        {{ language === 'zh' ? '下载清关附件' : 'Download Customs_clearance_doc' }}
      </button>
      <button @click="toggleLanguage" class="language-toggle-btn">
        {{ language === 'zh' ? '切换到英文' : 'Switch to Chinese' }}
      </button>

      <!-- 隐藏的上传输入框 -->
      <input type="file" ref="fileInput" hidden @change="handleFileUpload"/>
      <input type="file" ref="excelInput" hidden accept=".xls,.xlsx" @change="handleExcelUpload"/>
    </div>

    <!-- 表格区域 -->
    <table class="logistics-table" border="1">
      <thead>
      <tr>
        <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll"/></th>
        <th>{{ language === 'zh' ? '最新轨迹' : 'Latest Track' }}</th>
        <th>{{ language === 'zh' ? '轨迹更新时间' : 'Track Update Time' }}</th>
        <th>{{ language === 'zh' ? '运单号' : 'Waybill Number' }}</th>
        <th>{{ language === 'zh' ? '客户单号' : 'Customer Order No.' }}</th>
        <th>{{ language === 'zh' ? '转运单号' : 'Transit No.' }}</th>
        <th>{{ language === 'zh' ? '柜号' : 'Container No.' }}</th>
        <th>{{ language === 'zh' ? '状态' : 'Status' }}</th>
        <th>{{ language === 'zh' ? '物流渠道名称' : 'Logistics Channel' }}</th>
        <th>{{ language === 'zh' ? '装柜港口' : 'Loading Port' }}</th>
        <th>{{ language === 'zh' ? '装柜时间' : 'Loading Time' }}</th>
        <th>{{ language === 'zh' ? '卸柜港口' : 'Arrival Port' }}</th>
        <th>{{ language === 'zh' ? '卸柜时间' : 'Arrival Date' }}</th>
        <th>{{ language === 'zh' ? '收件日期' : 'Receive Date' }}</th>
        <th>{{ language === 'zh' ? '收件时间' : 'Receive Time' }}</th>
        <th>{{ language === 'zh' ? '清关材料' : 'Customs Docs' }}</th>
        <th>{{ language === 'zh' ? '清关结果' : 'Customs Clearance Result' }}</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="logistics in logisticsList" :key="logistics.id">
        <td><input type="checkbox" v-model="selectedItems" :value="logistics.id"/></td>

        <td>
          <a href="javascript:void(0)" @click="fetchLogisticsHistory(logistics.id)">
            {{ getValue(logistics.latestTrackNotes) }}
          </a>
        </td>
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
          <span v-else>未提供 / Not Provided</span>
        </td>

        <td>
          <template v-if="logistics.customsClearanceResult">
            <a href="javascript:void(0)" @click="downloadFile(logistics.customsClearanceResult)">
              {{ getFileName(logistics.customsClearanceResult) }}
            </a>
          </template>
          <span v-else>未提供 / Not Provided</span>
        </td>
      </tr>
      </tbody>
    </table>
    <el-dialog title="历史轨迹  Historical Tracks" :visible.sync="historyDialogVisible" width="600px">
      <div v-if="logisticsHistoryList && logisticsHistoryList.length">
        <div v-for="(history, index) in logisticsHistoryList" :key="index" class="history-item">
          <strong>轨迹备注 (Track Note):</strong> {{ history.note }}
          <br/>
          <strong>更新时间 (Update Time):</strong> {{ formatTimestamp(history.trackUpdateTime) }}
          <hr/>
        </div>
      </div>
      <div v-else>没有历史轨迹 / No historical tracks available</div>
      <template #footer>
        <el-button @click="historyDialogVisible = false">关闭 / Close</el-button>
      </template>
    </el-dialog>
  </div>
</template>


<script>
import axios from 'axios'
import * as XLSX from 'xlsx'
import {getToken} from '@/utils/auth'

export default {
  data() {
    return {
      dateRange: [],
      language: 'en',
      logisticsList: [], // 物流数据
      selectedItems: [], // 选中的物流记录ID
      selectAll: false, // 全选状态
      logisticsHistoryList: [],
      historyDialogVisible: false,
    }
  },
  methods: {
    // 点击最新轨迹，查询历史轨迹
    fetchLogisticsHistory(logisticsId) {
      axios.get(`http://47.91.89.160:8080/cus/getLogisticsHistory?logisticsId=${logisticsId}`, {
        headers: {Authorization: getToken()}
      }).then(response => {
        this.logisticsHistoryList = response.data;
        this.historyDialogVisible = true;  // 打开历史轨迹对话框
      }).catch(error => {
        alert('获取历史轨迹失败 / Failed to fetch historical tracks: ' + error.message);
      });
    },

    // 格式化时间戳
    formatTimestamp(timestamp) {
      if (!timestamp) return '未提供 / Not Provided';
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    toggleLanguage() {
      this.language = this.language === 'zh' ? 'en' : 'zh';
    },
    getValue(value) {
      return value || '未提供 / Not Provided';
    },
    getFileName(path) {
      return path.split('/').pop();
    },
    async downloadFile(fileUrl) {
      const token = getToken()
      try {
        console.log("开始下载文件:", fileUrl); // 调试，确保文件 URL 正确传递

        const response = await axios.get(fileUrl, {
          headers: {Authorization: `${token}`}, // 如果需要 Token，请确保已正确传递
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
        alert(`下载失败：${error.response.data.message || error.message}\nDownload failed: ${error.response.data.message || error.message}`)
      }
    },
    // 获取所有物流信息
    fetchLogistics() {
      const token = getToken();

      const payload = {};
      if (this.dateRange && this.dateRange.length === 2) {
        payload.startDate = this.dateRange[0];
        payload.endDate = this.dateRange[1];
      }

      axios.post('http://47.91.89.160:8080/cus/fetchAll', payload, {
        headers: {Authorization: `${token}`}
      }).then(response => {
        this.logisticsList = Array.isArray(response.data) ? response.data : [];
      }).catch(error => {
        alert('获取物流数据失败 / Failed to fetch logistics data: ' + error.message);
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
        alert('请上传有效的 Excel 文件\nPlease upload a valid Excel file')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const binaryStr = e.target.result
        const workbook = XLSX.read(binaryStr, {type: 'binary'})
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
        alert('操作成功\nOperation Successful')
        this.refreshData() // 刷新数据
      }).catch(error => {
        console.error("保存/更新物流记录失败", error)
        alert("保存/更新失败\nSave/Update Failed")
      })
    },

    // 触发 PDF 上传
    triggerExcelUpload() {
      if (this.selectedItems.length !== 1) {
        alert('请选中一条物流记录再上传 Excel / Please select one logistics record before uploading Excel');
        return;
      }
      this.$refs.excelInput.click();
    },
    handleExcelUpload(event) {
      const file = event.target.files[0];

      // 文件检查
      if (!file) {
        alert('没有选择文件 / No file selected');
        return;
      }

      if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
        alert('请上传 Excel 文件 / Please upload an Excel file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 限制最大文件大小为 10MB
        alert('文件过大，请上传小于 10MB 的 Excel 文件 / File is too large. Please upload an Excel file smaller than 10MB');
        return;
      }

      const selected = this.findSelectedLogistics();
      if (!selected) {
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('containerNumber', selected.containerNumber);

      this.uploadExcel(formData);
    },
    findSelectedLogistics() {
      const selected = this.logisticsList.find(item => item.id === this.selectedItems[0]);
      if (!selected) {
        alert('所选记录无效 / The selected record is invalid');
        return null;
      }

      if (!selected.containerNumber) {
        alert('所选记录无柜号，无法上传 / Selected record has no container number, upload is not possible');
        return null;
      }

      return selected;
    },
    uploadExcel(formData) {
      const token = getToken();

      axios.post('http://47.91.89.160:8080/cus/uploadFile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `${token}`,
        }
      }).then(() => {
        alert('上传成功 / Upload successful');
        this.refreshData();
      }).catch(error => {
        alert(`上传失败 / Upload failed: ${error.message}`);
      });
    },

    // 删除选中的物流记录
    deleteSelected() {
      if (this.selectedItems.length === 0) {
        alert('请选择要删除的记录\nPlease select records to delete')
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
        alert("删除失败\nDelete failed")
      })
    },

    // 刷新数据
    refreshData() {
      this.fetchLogistics()
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
