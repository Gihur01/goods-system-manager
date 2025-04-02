<template>
	<div>
		<h2>物流信息管理</h2>

		<!-- 按钮区域 -->
		<el-card>
			<el-button @click="triggerFileUpload">新增和更新</el-button>
			<el-button @click="deleteSelected">删除</el-button>
			<el-button @click="refreshData">刷新</el-button>
			<el-button @click="downloadExample">下载示例</el-button>
			<el-button @click="triggerPdfUpload">上传附件</el-button> <!-- 新增按钮 -->

			<input type="file" ref="fileInput" style="display: none;" @change="handleFileUpload" />
			<input type="file" ref="pdfInput" style="display: none;" accept="application/pdf" @change="handlePdfUpload" />
		</el-card>

		<!-- 表格区域 -->
		<table id="logistics-table" border="1">
			<thead>
				<tr>
					<th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
					<th>收件日期</th>
					<th>收件时间</th>
					<th>运单号</th>
					<th>客户单号</th>
					<th>转运单号</th>
					<th>柜号</th>
					<th>状态</th>
					<th>物流渠道名称</th>
					<th>装柜港口</th>
					<th>装柜时间</th>
					<th>卸柜港口</th>
					<th>卸柜时间</th>
					<th>最新轨迹</th>
					<th>轨迹更新时间</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="logistics in logisticsList" :key="logistics.id">
					<td><input type="checkbox" v-model="selectedItems" :value="logistics.id" /></td>
					<td>{{ logistics.receiveDate || '未提供' }}</td>
					<td>{{ logistics.receiveTime || '未提供' }}</td>
					<td>{{ logistics.waybillNumber || '未提供' }}</td>
					<td>{{ logistics.customerOrderNumber || '未提供' }}</td>
					<td>{{ logistics.fwTrackingNumber || '未提供' }}</td>
					<td>{{ logistics.containerNumber || '未提供' }}</td>
					<td>{{ logistics.status || '未提供' }}</td>
					<td>{{ logistics.logisticsChannel || '未提供' }}</td>
					<td>{{ logistics.loadingPort || '未提供' }}</td>
					<td>{{ logistics.loadingTime || '未提供' }}</td>
					<td>{{ logistics.arrivalPort || '未提供' }}</td>
					<td>{{ logistics.arrivalDate || '未提供' }}</td>
					<td>{{ logistics.latestTrackNotes || '未提供' }}</td>
					<td>{{ logistics.trackUpdateTime ? logistics.trackUpdateTime : '未提供' }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>


<script>
import axios from 'axios'
import * as XLSX from 'xlsx'
import { fetchAll, removeLogistics, saveOrUpdateLogistics } from '@/api/cus.js'

export default {
	data() {
		return {
			logisticsList: [], // 物流数据
			selectedItems: [], // 选中的物流记录ID
			selectAll: false, // 全选状态
		}
	},
	methods: {
		// 获取所有物流信息
		fetchLogistics() {
			// 写死的 token
			const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImNyZWF0ZWQiOjE3NDMxNTEzOTQyODMsImV4cCI6MTc0Mzc1NjE5NH0.EsxXoq4vfaVlI5o-ouHxQoz5Ui1KaGrl2JDOhnvvRydA1in5MNOp0B4tRvYOps2VuqxS9G-X15XOTzutF0UYEg'
			// 发送请求获取物流信息
			axios.post('http://47.91.89.160:8080/cus/fetchAll', {}, {
			  headers: {
			    'Authorization': `Bearer ${token}`,  // 在请求头中加上 token
			  }
			})
			// let params=new URLSearchParams();
			// fetchAll(params)
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
			const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImNyZWF0ZWQiOjE3NDMxNTEzOTQyODMsImV4cCI6MTc0Mzc1NjE5NH0.EsxXoq4vfaVlI5o-ouHxQoz5Ui1KaGrl2JDOhnvvRydA1in5MNOp0B4tRvYOps2VuqxS9G-X15XOTzutF0UYEg'
			axios.post('http://localhost:8080/cus/saveOrUpdate', data, {
				headers: {
					'Authorization': `Bearer ${token}`,
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
			const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImNyZWF0ZWQiOjE3NDMxNTEzOTQyODMsImV4cCI6MTc0Mzc1NjE5NH0.EsxXoq4vfaVlI5o-ouHxQoz5Ui1KaGrl2JDOhnvvRydA1in5MNOp0B4tRvYOps2VuqxS9G-X15XOTzutF0UYEg'

			axios.post('http://localhost:8080/cus/uploadFile', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'Authorization': `Bearer ${token}`,
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
			const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImNyZWF0ZWQiOjE3NDMxNTEzOTQyODMsImV4cCI6MTc0Mzc1NjE5NH0.EsxXoq4vfaVlI5o-ouHxQoz5Ui1KaGrl2JDOhnvvRydA1in5MNOp0B4tRvYOps2VuqxS9G-X15XOTzutF0UYEg'
			axios.post('http://localhost:8080/cus/removeLogistics', logisticsListToDelete, {
				headers: {
					'Authorization': `Bearer ${token}`,
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
table {
	width: 100%;
	margin-bottom: 20px;
	border-collapse: collapse;
}

table th,
table td {
	padding: 10px;
	text-align: center;
}

button {
	margin: 5px;
	padding: 10px;
	/* background-color: #4CAF50; */

}

button:hover {
	/* background-color: #45a049; */
}
</style>
