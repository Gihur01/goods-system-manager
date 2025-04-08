<template>
  <div>
    <h2>{{ language === 'zh' ? 'NEO 清关更新' : 'NEO Customs clearance Update' }}</h2>

    <!-- 操作按钮 -->
    <div class="button-group">
      <button @click="openNoteDialog">{{ language === 'zh' ? '轨迹更新' : 'Trajectory update' }}</button>
      <button @click="refreshData">{{ language === 'zh' ? '刷新' : 'Refresh' }}</button>
      <button @click="triggerPdfUpload">{{ language === 'zh' ? '上传附件' : 'Upload PDF' }}</button>
      <button @click="openDetailDialog">{{ language === 'zh' ? '详细信息' : 'Details' }}</button>
      <button @click="toggleLanguage" class="language-toggle-btn">
            {{ language === 'zh' ? '切换到英文' : 'Switch to Chinese' }}
      </button>
      <!-- 隐藏的上传输入框 -->
      <input type="file" ref="fileInput" hidden @change="handleFileUpload" />
      <input type="file" ref="pdfInput" hidden accept="application/pdf" @change="handlePdfUpload" />
    </div>

    <!-- 表格区域 -->
    <table class="logistics-table" border="1">
      <thead>
        <tr>
          <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
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
          <td><input type="checkbox" v-model="selectedItems" :value="logistics.id" /></td>
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
            <span v-else>{{ language === 'zh' ? '未提供' : 'Not Provided' }}</span>
          </td>
          <td>
            <template v-if="logistics.customsClearanceResult">
              <a href="javascript:void(0)" @click="downloadFile(logistics.customsClearanceResult)">
                {{ getFileName(logistics.customsClearanceResult) }}
              </a>
            </template>
            <span v-else>{{ language === 'zh' ? '未提供' : 'Not Provided' }}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 填写最新轨迹的对话框 -->
    <el-dialog
      title="填写最新轨迹  Enter Latest Track Note"
      :visible.sync="noteDialogVisible"
      :append-to-body="true"
      width="500px"
    >
      <!-- 换成普通 textarea 先排查 -->
      <textarea
        v-model="noteInput"
        placeholder="请输入最新轨迹 / Please enter the latest trajectory."
        rows="4"
        style="width: 100%; min-height: 100px; padding: 8px; font-size: 14px;"
      ></textarea>

      <span slot="footer" class="dialog-footer">
        <el-button @click="noteDialogVisible = false">取消 / Cancel</el-button>
        <el-button type="primary" @click="submitNote">确认 / Confirm</el-button>
      </span>
    </el-dialog>

    <el-dialog title="物流详细信息  Logistics Detailed Information" :visible.sync="detailDialogVisible" width="600px">
      <div v-if="logisticsDetail">
        <div v-for="(value, key) in logisticsDetail" :key="key" class="detail-item">
          <strong>{{ key }}:</strong> {{ value || '—' }}
        </div>
      </div>
      <div v-else>加载中... / Loading ...</div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭 / Close</el-button>
      </template>
    </el-dialog>

    <el-dialog title="历史轨迹  Historical Tracks" :visible.sync="historyDialogVisible" width="600px">
      <div v-if="logisticsHistoryList && logisticsHistoryList.length">
        <div v-for="(history, index) in logisticsHistoryList" :key="index" class="history-item">
          <strong>轨迹备注 (Track Note):</strong> {{ history.note }}
          <br/>
          <strong>更新时间 (Update Time):</strong> {{ formatTimestamp(history.trackUpdateTime) }}
          <hr />
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
import { getToken } from '@/utils/auth'

export default {
  data() {
    return {
      language: 'en',
      logisticsList: [],
      selectedItems: [],
      selectAll: false,
      noteDialogVisible: false,
      noteText: '',
      detailDialogVisible: false,
      logisticsDetail: null,
      logisticsHistoryList: [],
      historyDialogVisible: false,
    }
  },
  methods: {
  // 点击最新轨迹，查询历史轨迹
    fetchLogisticsHistory(logisticsId) {
      axios.get(`http://47.91.89.160:8080/cus/getLogisticsHistory?logisticsId=${logisticsId}`, {
        headers: { Authorization: getToken() }
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
    formatTimestamp(timestamp) {
      if (!timestamp) return '未提供 / Not Provided';
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    openDetailDialog() {
          if (this.selectedItems.length !== 1) {
            alert('请只选择一条记录查看详细信息 / Please select only one record to view details');
            return;
          }
          const selected = this.logisticsList.find(i => i.id === this.selectedItems[0]);
          if (!selected) return;
          this.detailDialogVisible = true;
          this.logisticsDetail = null;
          axios.post('http://47.91.89.160:8080/cus/query', {
            waybillNumber: selected.waybillNumber,
            customerOrderNumber: selected.customerOrderNumber,
            fwTrackingNumber: selected.fwTrackingNumber
          }, {
            headers: { Authorization: getToken() }
          }).then(res => {
            this.logisticsDetail = res.data;
          }).catch(err => {
            alert('查询失败 / Query failed:  ' + (err.response.data || err.message));
            this.detailDialogVisible = false;
          });
        },
    downloadFile(fileUrl) {
      const token = getToken()
      axios.get(fileUrl, {
        headers: { Authorization: `${token}` },
        responseType: 'blob',
      }).then(response => {
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', this.getFileName(fileUrl))
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }).catch(error => {
        alert('下载失败 / Download failed:' + error.message)
      })
    },
    fetchLogistics() {
      const token = getToken()
      axios.post('http://47.91.89.160:8080/cus/fetchAll', {}, {
        headers: {
          Authorization: `${token}`,
        }
      }).then(response => {
        if (Array.isArray(response.data)) {
          this.logisticsList = response.data
        } else {
          this.logisticsList = []
        }
      }).catch(error => {
        alert('获取物流数据失败 / Failed to fetch logistics data: ' + error.message)
      })
    },
    refreshData() {
      this.fetchLogistics()
    },
    triggerFileUpload() {
      this.$refs.fileInput.click()
    },
    triggerPdfUpload() {
      if (this.selectedItems.length !== 1) {
        alert('请选中一条物流记录再上传 PDF / Please select one logistics record before uploading PDF')
        return
      }
      this.$refs.pdfInput.click()
    },
    handlePdfUpload(event) {
      const file = event.target.files[0]
      if (!file || !file.name.endsWith('.pdf')) {
        alert('请上传 PDF 文件 / Please upload a PDF file')
        return
      }

      const selected = this.logisticsList.find(item => item.id === this.selectedItems[0])
      if (!selected || !selected.containerNumber) {
        alert('所选记录无柜号，无法上传 / Selected record has no container number, upload is not possible')
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('containerNumber', selected.containerNumber)
      const token = getToken()

      axios.post('http://47.91.89.160:8080/cus/uploadFile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `${token}`,
        }
      }).then(() => {
        alert('上传成功 / Upload successful')
        this.refreshData()
      }).catch(error => {
        alert('上传失败 / Upload failed:' + error.message)
      })
    },
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file || !file.name.endsWith('.xlsx')) {
        alert('请上传 Excel 文件 / Please upload an Excel file')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const formatted = jsonData.map(row => ({
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
        }))

        this.saveOrUpdateLogistics(formatted)
      }
      reader.readAsBinaryString(file)
    },
    saveOrUpdateLogistics(data) {
      const token = getToken()
      axios.post('http://47.91.89.160:8080/cus/saveOrUpdate', data, {
        headers: {
          Authorization: `${token}`,
        }
      }).then(() => {
        alert('操作成功 / Operation successful')
        this.refreshData()
      }).catch(error => {
        alert('保存/更新失败 / Save/Update failed: ' + error.message)
      })
    },
    toggleSelectAll() {
      this.selectedItems = this.selectAll ? this.logisticsList.map(item => item.id) : []
    },

    // 打开轨迹弹窗
    openNoteDialog() {
      if (this.selectedItems.length === 0) {
        alert('请先选择记录 / Please select a record first')
        return
      }
      this.noteInput = ''
      this.noteDialogVisible = true
    },

    // 提交轨迹
    submitNote() {
      const token = getToken()
      const data = {
        note: this.noteInput,
        logisticsList: this.selectedItems.map(id => {
          const item = this.logisticsList.find(l => l.id === id)
          return {
            waybillNumber: item.waybillNumber,
            customerOrderNumber: item.customerOrderNumber,
            fwTrackingNumber: item.fwTrackingNumber
          }
        })
      }

      axios.post('http://47.91.89.160:8080/cus/updateLogisticsNote', data, {
        headers: {
          Authorization: `${token}`,
        }
      }).then(() => {
        this.noteDialogVisible = false
        alert('轨迹更新成功 / Track update successful')
        this.refreshData()
      }).catch(err => {
        alert('轨迹更新失败 / Track update failed: ' + (err.response.data || err.message))
      })
    }
  },
  mounted() {
    this.refreshData()
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
