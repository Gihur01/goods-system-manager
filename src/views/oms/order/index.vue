<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <!-- <el-button
          style="float:right"
          type="primary"
          @click="handleSearchList()"
          size="small">
          查询搜索
        </el-button>
        <el-button
          style="float:right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small">
          重置
        </el-button> -->
      </div>
      <div style="margin-top: 15px">
        
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="仓库选择:">
            <el-select v-model="listQuery.warehouseId" @change="handleSearchList()" placeholder="请选择库" id="select-warehouse"  clearable>
              <el-option v-for="item in warehouseOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
<!-- this needs to be added in api -->
          <el-form-item label="搜索包裹编号：">
            <el-input v-model="listQuery.parcelID" class="input-width" placeholder="包裹单编号"></el-input>
          </el-form-item>
          <el-form-item label="提交时间：">
            <el-date-picker
              class="input-width"
              v-model="listQuery.createTime"
              value-format="yyyy-MM-dd"
              type="date"
              placeholder="请选择时间"
              >
            </el-date-picker>
          </el-form-item>

          <el-form-item label="筛选包裹状态：">
            <div>
            <el-checkbox-group v-model="statusTagSelectionValues" @change="handleSearchList()" size="small">
              <el-checkbox-button  
                v-for="item in statusFilterOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"></el-checkbox-button>
            </el-checkbox-group>
            <el-button @click="handleUpdateParcelState" style="margin: 10px;" type="primary">
              搜索
              <i class="el-icon-search"></i>
            </el-button>
          </div>
          </el-form-item>
          <!-- <el-form-item label="订单分类：">
            <el-select v-model="listQuery.orderType" class="input-width" placeholder="全部" clearable>
              <el-option v-for="item in orderTypeOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item> -->
          <!-- <el-form-item label="订单来源：">
            <el-select v-model="listQuery.sourceType" class="input-width" placeholder="全部" clearable>
              <el-option v-for="item in sourceTypeOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item> -->
        </el-form>
      </div>
    </el-card>
    <!-- <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
    </el-card> -->

    <el-card shadow="none" >
<!-- 这个我需要修改！ -->
      <!-- <div class="input-group"> -->

        <span class="filter-label">状态设置：</span>
        <el-select v-model="operateType" placeholder="批量操作" clearable style="max-width:100px; margin-left: 5px;">
          <el-option v-for="item in operateOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    <!-- </div> -->
      <el-button @click="handleBatchOperate()" style="margin: 10px;" type="primary">
      提交
      </el-button>
      
      <el-button @click="handlePrintParcel" style="margin: 10px;">
        打印
      </el-button>
      <el-button @click="handlePrintParcel" style="margin: 10px;">
        导出商品清单
      </el-button>
      <el-button  @click="handleExpandAll" style="margin: 10px; float: right;">
      全部展开/收起
      </el-button>
      <el-button @click="handleCheckAll" style="margin: 10px; float: right;" >
      全选
      </el-button>
      
    </el-card>
    
<!-- collapse list -->

    <div class="grid-container" id="order-grid">
      <Collapsible 
          v-for="(item,index) in list"
          :key="index"
          :id="item.id" 
          :expanded="expandedOrders[item.id]"
          @click="handleToggleOrder">

          <template slot="title">
            <span>{{ item.parcelSn==null? "无包裹单号":item.parcelSn }}</span>
            <el-checkbox v-model="checkBoxValues[item.id]"></el-checkbox>
          </template>

          <!-- list of items in this order(package) -->
          <div class="grid-container" id="order-item-grid" >
            <div  class="product-container" v-for="product in itemList[item.id]">
              <div class="product-text" id="product-title">{{ product.productName }}</div>
              <div class="product-text" id="product-sn">{{ product.productSn }}</div>
              <div class="product-text" id="product-quantity">{{ product.productQuantity }}</div>
            
          
          </div>

          </div>
      </Collapsible>
   </div>

   <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        
        layout="total, sizes,prev, pager, next,jumper"
        :current-page.sync="listQuery.pageNum"
        :page-size="listQuery.pageSize"
        :page-sizes="[5,10,15]"
        :total="total"
        >
      </el-pagination>
    </div>
  </div>

<!--    <div class="table-container">
      <el-table ref="orderTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="编号" width="80" align="center">
          <template slot-scope="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="订单编号" width="180" align="center">
          <template slot-scope="scope">{{scope.row.orderSn}}</template>
        </el-table-column>
        <el-table-column label="提交时间" width="180" align="center">
          <template slot-scope="scope">{{scope.row.createTime | formatCreateTime}}</template>
        </el-table-column>

        <el-table-column label="订单金额" width="120" align="center">
          <template slot-scope="scope">￥{{scope.row.totalAmount}}</template>
        </el-table-column>
        <el-table-column label="订单状态" width="120" align="center">
          <template slot-scope="scope">{{scope.row.status | formatStatus}}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleViewOrder(scope.$index, scope.row)"
            >查看订单</el-button>
            <el-button
              size="mini"
              @click="handleCloseOrder(scope.$index, scope.row)"
              v-show="scope.row.status===0">关闭订单</el-button>
            <el-button
              size="mini"
              @click="handleDeliveryOrder(scope.$index, scope.row)"
              v-show="scope.row.status===1">订单发货</el-button>
            <el-button
              size="mini"
              @click="handleViewLogistics(scope.$index, scope.row)"
              v-show="scope.row.status===2||scope.row.status===3">订单跟踪</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDeleteOrder(scope.$index, scope.row)"
              v-show="scope.row.status===4">删除订单</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="batch-operate-container">
      <el-select
        size="small"
        v-model="operateType" placeholder="批量操作">
        <el-option
          v-for="item in operateOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button
        style="margin-left: 20px"
        class="search-button"
        @click="handleBatchOperate()"
        type="primary"
        size="small">
        确定
      </el-button>
    </div>
   
    <el-dialog
      title="关闭订单"
      :visible.sync="closeOrder.dialogVisible" width="30%">
      <span style="vertical-align: top">操作备注：</span>
      <el-input
        style="width: 80%"
        type="textarea"
        :rows="5"
        placeholder="请输入内容"
        v-model="closeOrder.content">
      </el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeOrder.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCloseOrderConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <logistics-dialog v-model="logisticsDialogVisible"></logistics-dialog>
  </div> -->
  
</template>
<script>
  import {fetchItemList,closeOrder,deleteOrder,getOrderDetail} from '@/api/order'
  import {fetchParcelList, printParcel} from '@/api/parcel'
  import {fetchList as fetchWarehouseList } from '@/api/warehouse'
  import {formatDate} from '@/utils/date';
  import LogisticsDialog from '@/views/oms/order/components/logisticsDialog';
  import Collapsible from '@/components/Collapsible2';

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 10,
    parcelID: null,
    parcelStatus: null,
    warehouseId: null,
  };
  const defaultItemListQuery ={
    // id: null,
    location: null, //the country 
    // orderId: null,
    // orderSn: null,
    parcelId:null,
    // productId:null,
    productName:null,
    warehouseId:null,
    pageNum: 1,
    pageSize: 50,
  };
  export default {
    name: "orderList",
    components:{LogisticsDialog,Collapsible},
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        itemListQuery: Object.assign({}, defaultItemListQuery),
        listLoading: true,
        list: [],
        total: null,
        operateType: null,
        multipleSelection: [], //legacy multi select array for the data list
        expandedOrders:{}, //store order expanded state
        itemList:{}, //store list of all items (in the parcels)
        checkBoxValues: {}, //stores the values of checkboxes.
        checkBoxValuesCompare:{}, //Stores the state of checkboxes after preparation button is pressed.
        statusTagSelectionValues:[], //Stores value of the status tags
        warehouseOptions:[],

        //variables used for printing:
        parcelIdMap:{},
        printList:[], //list of parcels to be printed
        printedList:[], //list of parcels already printed
        //logic: selected - printed = to be printed

        
        //this stores the states of the checkboxes and collapsibles.
        //Mainly whether they are all toggled.
        componentStates:{
          checkedAll: false,
          expandedAll:false,
        },
        closeOrder:{
          dialogVisible:false,
          content:null,
          orderIds:[]
        },
        statusFilterOptions: [
          {
            label: '待备货',
            value: 0
          },
          {
            label: '已备货',
            value: 1
          },
          {
            label: '已打包',
            value: 2
          },
          {
            label: '已发送',
            value: 3
          },
          {
            label: '已收货',
            value: 4
          }
        ],
        statusUpdateOptions:[

        ],
        orderTypeOptions: [
          {
            label: '正常订单',
            value: 0
          },
          {
            label: '秒杀订单',
            value: 1
          }
        ],
        sourceTypeOptions: [
          {
            label: 'PC订单',
            value: 0
          },
          {
            label: 'APP订单',
            value: 1
          }
        ],
        operateOptions: [
          {
            label: "批量发货",
            value: 1
          },
          {
            label: "关闭订单",
            value: 2
          },
          {
            label: "删除订单",
            value: 3
          }
        ],
        logisticsDialogVisible:false
      }
    },
    created() {
      
      this.initPage();
      
    },
    filters: {
      formatCreateTime(time) {
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      },
      formatPayType(value) {
        if (value === 1) {
          return '支付宝';
        } else if (value === 2) {
          return '微信';
        } else {
          return '未支付';
        }
      },
      formatSourceType(value) {
        if (value === 1) {
          return 'APP订单';
        } else {
          return 'PC订单';
        }
      },
      formatStatus(value) {
        if (value === 1) {
          return '待发货';
        } else if (value === 2) {
          return '已发货';
        } else if (value === 3) {
          return '已完成';
        } else if (value === 4) {
          return '已关闭';
        } else if (value === 5) {
          return '无效订单';
        } else {
          return '待付款';
        }
      },
    },
    methods: {
      initPage(){
        this.getList();
        this.getWarehouseList();

        //init the checkbox states and expanded states
        for(let item of this.list){
          this.expandedOrders[item.id]=false;
          this.checkBoxValues[item.id]=false;
          // this.$set(this.expandedOrders,item.id,false);
          // this.$set(this.checkBoxValues,item.id,false);
        };
      },

      //sets the expanded state of the individual collapsible elements
      updateCollapsibleState(id){
        console.log(id);
        if(this.expandedOrders[id] == true){
          this.$set(this.expandedOrders,id,false);
        }
        else{
          this.$set(this.expandedOrders,id,true);
        }
      },

      getParcelItems(id){
        if(id in this.itemList){
          //if the list of items was already requested for this id
          //...
        }
        else{
          this.itemListQuery.parcelId=id;
          // console.log(this.itemListQuery);

          //this fails to send the query to backend! Why?
          fetchItemList(this.itemListQuery).then(response => {
          this.$set(this.itemList,id,response.data.list);
          });
          // console.log(this.itemList);
        };

        //TODO: add code to put the list into localstorage (to be considered)
      },

      handleToggleOrder(id) {
        this.updateCollapsibleState(id);
        this.getParcelItems(id);
      },

      handleStatusSelection(){
        console.log(statusTagSelectionValues)
      },

      //批量备货
      handleUpdateParcelState(){
        if(this.checkBoxValues==this.checkBoxValuesCompare){

          //TODO: add logic to detect unchanged submissions...
          
        }
        this.$message({
          message: '提交成功！',
          type: 'success'
        });
      },

      handleCheckAll(){
        if(this.componentStates.checkedAll==false){
          this.list.forEach(element => {
            this.$set(this.checkBoxValues,element.id,true)
         });
         this.$set(this.componentStates, "checkedAll", true)
        }
        else{
          this.list.forEach(element => {
            this.$set(this.checkBoxValues,element.id,false)
         });
         this.$set(this.componentStates, "checkedAll", false)
        };

        console.log(this.checkBoxValues)
      },

      handleExpandAll(){
        if(this.componentStates.expandedAll==false){
          this.list.forEach(element => {
            this.$set(this.expandedOrders,element.id,true)
            this.getParcelItems(element.id);
         });
         this.$set(this.componentStates, "expandedAll", true)
        }

        else{
          this.list.forEach(element => {
            this.updateCollapsibleState(element.id);
         });
         this.$set(this.componentStates, "expandedAll", false)
        };
        
      },

      handlePrintParcel(){
        let selectedList=Object.keys(this.checkBoxValues).map(key=>{
          if(this.checkBoxValues[key]==true)
          return key;
        });

        //in this list, the already printed ids are filtered out
        let filteredList = selectedList.filter((id) => !this.printedList.includes(id));
        console.log(filteredList);
        let parcelSnList=[];
        let emptySnList=[];

        for(let parcel of this.list){
          this.parcelIdMap[parcel.id]=parcel.parcelSn;
        };

        for(let id of filteredList){
          if(this.parcelIdMap[id]!=null){
            parcelSnList.push(this.parcelIdMap[id]);
          }
          else
            emptySnList.push(id);
        }
        for(let i of filteredList)
          this.printedList.push(i);
        
        console.log("parcelSnList, ",parcelSnList);
        console.log("emptyList, ",emptySnList);
        console.log("Printedlist ",this.printedList);

        //for testing, just print this fixed pdf.
        this.autoPrintPDFByPath("/labels/java_clients_rest_PrintLabels.pdf")
        
        

      },

      handleExportProducts(){

      },

      handleResetSearch() {
        this.listQuery = Object.assign({}, defaultListQuery);
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
      },
      // handleSelectionChange(val){
      //   this.multipleSelection = val;
      // },
      // handleViewOrder(index, row){
      //   this.$router.push({path:'/oms/orderDetail',query:{id:row.id}})
      // },
      // handleCloseOrder(index, row){
      //   this.closeOrder.dialogVisible=true;
      //   this.closeOrder.orderIds=[row.id];
      // },
      // handleDeliveryOrder(index, row){
      //   let listItem = this.covertOrder(row);
      //   this.$router.push({path:'/oms/deliverOrderList',query:{list:[listItem]}})
      // },
      // handleViewLogistics(index, row){
      //   this.logisticsDialogVisible=true;
      // },
      // handleDeleteOrder(index, row){
      //   let ids=[];
      //   ids.push(row.id);
      //   this.deleteOrder(ids);
      // },
      handleBatchOperate(){
        if(this.multipleSelection==null||this.multipleSelection.length<1){
          this.$message({
            message: '请选择要操作的订单',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        if(this.operateType===1){
          //批量发货
          let list=[];
          for(let i=0;i<this.multipleSelection.length;i++){
            if(this.multipleSelection[i].status===1){
              list.push(this.covertOrder(this.multipleSelection[i]));
            }
          }
          if(list.length===0){
            this.$message({
              message: '选中订单中没有可以发货的订单',
              type: 'warning',
              duration: 1000
            });
            return;
          }
          this.$router.push({path:'/oms/deliverOrderList',query:{list:list}})
        }else if(this.operateType===2){
          //关闭订单
          this.closeOrder.orderIds=[];
          for(let i=0;i<this.multipleSelection.length;i++){
            this.closeOrder.orderIds.push(this.multipleSelection[i].id);
          }
          this.closeOrder.dialogVisible=true;
        }else if(this.operateType===3){
          //删除订单
          let ids=[];
          for(let i=0;i<this.multipleSelection.length;i++){
            ids.push(this.multipleSelection[i].id);
          }
          this.deleteOrder(ids);
        }
      },
      handleSizeChange(val){
        this.listQuery.pageNum = 1;
        this.listQuery.pageSize = val;
        this.getList();
      },
      handleCurrentChange(val){
        this.listQuery.pageNum = val;
        this.getList();
      },
      handleCloseOrderConfirm() {
        if (this.closeOrder.content == null || this.closeOrder.content === '') {
          this.$message({
            message: '操作备注不能为空',
            type: 'warning',
            duration: 1000
          });
          return;
        }
        let params = new URLSearchParams();
        params.append('ids', this.closeOrder.orderIds);
        params.append('note', this.closeOrder.content);
        closeOrder(params).then(response=>{
          this.closeOrder.orderIds=[];
          this.closeOrder.dialogVisible=false;
          this.getList();
          this.$message({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
        });
      },
      getList() {
        this.listLoading = true;
        fetchParcelList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      },
      getWarehouseList() {
        fetchWarehouseList().then(response => {
          this.warehouseOptions = [];
          let warehouseList = response.data;
          // console.log(warehouseList)
          for (let i = 0; i < warehouseList.length; i++) {
            this.warehouseOptions.push({ label: warehouseList[i].name, value: warehouseList[i].id });
          }
        });
      },


      //auto print pdf, courtesy ChatGPT! :)
      autoPrintPDFByPath(pdfPath) {
        const iframe = document.createElement("iframe");

        iframe.style.display = "none"; // Hide iframe
        iframe.src = pdfPath;

        iframe.onload = function () {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        };

        document.body.appendChild(iframe);
      }
      // deleteOrder(ids){
      //   this.$confirm('是否要进行该删除操作?', '提示', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   }).then(() => {
      //     let params = new URLSearchParams();
      //     params.append("ids",ids);
      //     deleteOrder(params).then(response=>{
      //       this.$message({
      //         message: '删除成功！',
      //         type: 'success',
      //         duration: 1000
      //       });
      //       this.getList();
      //     });
      //   })
      // },
      // covertOrder(order){
      //   let address=order.receiverProvince+order.receiverCity+order.receiverRegion+order.receiverDetailAddress;
      //   let listItem={
      //     orderId:order.id,
      //     orderSn:order.orderSn,
      //     receiverName:order.receiverName,
      //     receiverPhone:order.receiverPhone,
      //     receiverPostCode:order.receiverPostCode,
      //     address:address,
      //     deliveryCompany:null,
      //     deliverySn:null
      //   };
      //   return listItem;
      // }
    }
  }
</script>
<style scoped>
  .input-width {
    width: 203px;
  }
</style>


