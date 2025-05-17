<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
      </div>
      <div style="margin-top: 15px">

        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">

          <el-form-item label="搜索包裹编号：">
            <div>
            <el-input v-model="listQuery.parcelID" class="input-width" placeholder="包裹单编号"></el-input>
            <el-button @click="handleSearchList" style="margin: 10px;" type="primary">
                搜索
                <i class="el-icon-search"></i>
            </el-button>
          </div>
          </el-form-item>
          <el-form-item label="提交时间：">
            <el-date-picker class="input-width" v-model="listQuery.createTime" value-format="yyyy-MM-dd" type="date"
              placeholder="请选择时间">
            </el-date-picker>
          </el-form-item>

          <el-form-item label="筛选包裹状态：">
            <el-select v-model="listQuery.parcelStatus" class="input-width" placeholder="已创建" @change="handleSearchList" clearable>
              <el-option v-for="item in statusFilterOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
            <!-- <div>
              <el-checkbox-group v-model="statusTagSelectionValues" @change="handleSearchList()" size="small">
                <el-checkbox-button v-for="item in statusFilterOptions" :key="item.value" :label="item.label"
                  :value="item.value"></el-checkbox-button>
              </el-checkbox-group>
              <el-button @click="handleSearchList" style="margin: 10px;" type="primary">
                搜索
                <i class="el-icon-search"></i>
              </el-button>
            </div> -->
          </el-form-item>

        </el-form>
      </div>
    </el-card>

    <el-card class="button-bar" shadow="none">
      <div>
        <el-button @click="handleExportProducts" style="margin: 10px;">
          导出商品清单
        </el-button>
        <el-button @click="handleCompletePreparation" style="margin: 10px;">
          备货完毕
        </el-button>
      </div>
      <span v-if="componentStates.selectedAll" class="center-group">已选择全部！</span>

      <div class="right-group">
        <el-button @click="handleExpandAll" style="margin: 10px;">
          全部展开/收起
        </el-button>
        <el-button @click="handleCheckAll" style="margin: 10px;">
          勾选全部
        </el-button>
        <el-button @click="handleSelectAll" style="margin: 10px;">
          全择（所有分页）
        </el-button>
      </div>

    </el-card>

    <!-- collapse list -->

    <div class="grid-container" id="order-grid">
      <Collapsible v-for="(item,index) in list" :key="index" :id="item.id" :expanded="expandedOrders[item.id]"
        @click="handleToggleOrder">

        <template slot="title">
          <span>{{ item.parcelSn==null? "无包裹单号":item.parcelSn }}</span>
          <el-checkbox v-model="checkBoxValues[item.id]" @change="handleToggleCheckbox($event, item.id)"></el-checkbox>
          <!-- <Checkbox :id="item.id" :checked="checkBoxValues" ></Checkbox> -->
        </template>

        <!-- list of items in this order(package) -->
        <div class="grid-container" id="order-item-grid">
          <div class="product-container" v-for="product in itemList[item.id]">
            <div class="product-text" id="product-title">{{ product.productName }}</div>
            <div class="product-text" id="product-sn">{{ product.productSn }}</div>
            <div class="product-text" id="product-quantity">{{ product.productQuantity }}</div>


          </div>

        </div>
      </Collapsible>
    </div>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper" :current-page.sync="listQuery.pageNum"
        :page-size="listQuery.pageSize" :page-sizes="[20,50,100]" :total="total">
      </el-pagination>
    </div>
  </div>



</template>
<script>
  import {fetchItemList,closeOrder,deleteOrder,getOrderDetail} from '@/api/order'
  import {fetchParcelList, printParcel, fetchSummarizedItemList, updateParcelState} from '@/api/parcel'
  import {formatDate} from '@/utils/date';
  import LogisticsDialog from '@/views/oms/order/components/logisticsDialog';
  import Collapsible from '@/components/Collapsible';
  import Checkbox from '@/components/Checkbox';
  import * as XLSX from "xlsx";

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 20,
    parcelID: null,
    parcelStatus: 1,
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
    components:{LogisticsDialog,Collapsible,Checkbox},
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


        //variables used for printing:
        parcelIdMap:{},
        printedList:[], //list of parcels already printed
        //logic: selected - printed = to be printed

        
        //this stores the states of the checkboxes and collapsibles.
        //Mainly whether they are all toggled.
        componentStates:{
          checkedAll: false,
          expandedAll:false,
          selectedAll: false, //select ALL (not just current page)
        },
        closeOrder:{
          dialogVisible:false,
          content:null,
          orderIds:[]
        },
        statusFilterOptions: [
          {
            label: '已创建',
            value: 1
          },
          {
            label: '已打印标签',
            value: 2
          },
          {
            label: '已开始备货',
            value: 3
          },
          {
            label: '备货完毕-待揽收',
            value: 4
          },
          {
            label: '揽收完毕-转快递',
            value: 5
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
        // this.getWarehouseList();

        //init the checkbox states and expanded states
        for(let item of this.list){
          this.expandedOrders[item.id]=false;
          this.checkBoxValues[item.id]=false;
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
          console.log("id in list");
        }
        else{
          this.itemListQuery.parcelId=id;
          // console.log(this.itemListQuery);

          fetchItemList(this.itemListQuery).then(response => {
          this.$set(this.itemList,id,response.data.list);
          });
          console.log("id NOT in list")
           
        };
        console.log("id:",id,"list",this.itemList);
        //TODO: add code to put the list into localstorage (to be considered)
      },

      handleToggleCheckbox(value,id){
        console.log('Checkbox ID:', id, 'New Value:', value);
        if(this.componentStates.selectedAll==true)
          this.$set(this.componentStates,"selectedAll",false);

      },

      handleToggleOrder(id) {
        console.log(id)
        this.updateCollapsibleState(id);
        this.getParcelItems(id);
      },

      handleStatusSelection(){
        console.log(this.statusTagSelectionValues)
      },

      hasSelectedCheck(){
        if(this.componentStates.selectedAll || Object.values(this.checkBoxValues).includes(true)){
          return true;
        }
          return false;
      },

      //批量备货
      handleCompletePreparation(){
        
        // if(this.checkBoxValues==this.checkBoxValuesCompare){

        //   //TODO: add logic to detect unchanged submissions...
          
        // }
        if(!this.hasSelectedCheck()){
          this.$message({
          message: '未选择包裹！',
          type: 'warning'
        });
        return false;
        }

        let selectedList=[];
        if(this.componentStates.selectedAll==false){
          selectedList=Object.keys(this.checkBoxValues).map(key=>{
            if(this.checkBoxValues[key]==true){
              return parseInt(key);
            }
          });
        }

        let params=new URLSearchParams();
        params.append("parcelIds",selectedList)
        // console.log(selectedList);

        updateParcelState(4,params);

        this.$message({
          message: '提交成功！',
          type: 'success'
        });
      },

      handleSelectAll(){
        if(this.componentStates.selectedAll==true)
          this.$set(this.componentStates,"selectedAll",false)
        else
          this.$set(this.componentStates,"selectedAll",true)
        
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

        this.$set(this.componentStates,"selectedAll",false);
        console.log(this.checkBoxValues)
      },

      handleExpandAll(){
        if(this.componentStates.expandedAll==false){
          console.log("expanding all");
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


      handleExportProducts(){
        if(!this.hasSelectedCheck()){
          this.$message({
            message: '未选择包裹！',
            type: 'warning'
          });
          return false;
        }
        //first get a list of ids
        let selectedParcelIds=[];

        //if all are selected, call api with empty list (export all)
        //else, collect the parcel Ids.
        if(this.componentStates.selectedAll==false){  
          Object.keys(this.checkBoxValues).forEach(key=>{
          if(this.checkBoxValues[key]==true)
            selectedParcelIds.push(parseInt(key));
          });
        // console.log(selectedParcelIds);
        }
        
        let params=new URLSearchParams();
        params.append("parcelIds",selectedParcelIds)
        fetchSummarizedItemList(params).then(response=>{
          let data=response.data;
          console.log("data is:",data);
          let name=new Date();
          name=name.toLocaleDateString();
          name+=" 导出.xlsx";
          console.log(name);

          const worksheet = XLSX.utils.json_to_sheet(data);

          // Modify headers manually
          const customHeaders = [
            "产品名 productName", "产品条形码 productSn", "产品编码 productCode","产品数量 productQuantity","产品属性 productAttr","产品备注 productNote"];
          XLSX.utils.sheet_add_aoa(worksheet, [customHeaders], { origin: "A1" });	


          var wscols = [ //the width of columns.
            {wch:6},
            {wch:15},
            {wch:10},
            {wch:20}
          ];

          worksheet['!cols'] = wscols;
          worksheet["!rows"] = Array(data.length + 1).fill({ hpt: 25 }); // +1 to include header row

          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "工作表1");
          XLSX.writeFile(workbook, name);
        });


      },

      handleResetSearch() {
        this.listQuery = Object.assign({}, defaultListQuery);
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
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
    }
  }
</script>

<style scoped>
  .input-width {
    width: 203px;
  }

  .button-bar{
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    /* flex-direction: row; */
  }

  .right-group{
    /* flex-grow: 1; */
    display: flex;
    justify-content: right;
    
  }
  .center-group {
    flex-grow: 1;
    display: flex;
    justify-content: center;
}
  

</style>


