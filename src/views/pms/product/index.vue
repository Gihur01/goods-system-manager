<template>
  <div class="app-container">
    <el-card class="flex-filter-container" shadow="never">
      <!-- <div> -->
        <!-- <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button style="float: right" @click="handleSearchList()" type="primary" size="small">
          查询结果
        </el-button>
        <el-button style="float: right;margin-right: 15px" @click="handleResetSearch()" size="small">
          重置
        </el-button> -->
        <!-- <div class="input-group">
          <span class="filter-label" >国家：</span>
            <el-select v-model="listQuery.country" placeholder="请选择国家" id="select-country" clearable>
              <el-option v-for="item in countryOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
        </div> -->
        <div class="input-group">
          <span class="filter-label" >仓库：</span>
            <el-select v-model="listQuery.warehouseId" @change="handleSearchList()" placeholder="请选择库" id="select-warehouse"  clearable>
              <el-option v-for="item in warehouseOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
        </div>
        <div class="input-group">
          <span class="filter-label">分类：</span>
          <el-cascader id="category-selector" v-model="selectProductCateValue" :options="productCateOptions" @change="handleSearchList()" clearable>
          </el-cascader>
        </div>
      <!-- </div> -->
    </el-card>
    <el-card class="filter-container" shadow="never">
      <div>

        <span class="filter-label" >搜索：</span>
        <el-input style="width: 203px;" v-model="listQuery.keyword" placeholder="商品名称"></el-input>
        <el-button @click="handleSearchList()" type="primary" size="small">
          <i class="el-icon-search"></i>
        </el-button>
      </div>
    </el-card>


    <el-card class="category-selection-container" shadow="never">
        
        <!-- <div> -->
          <span class="filter-label">品牌：</span>
          <el-select id="brand-selector" v-model="listQuery.brandId" placeholder="请选择品牌" @change="handleSearchList()" clearable>
            <el-option v-for="item in brandOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        <!-- </div>
        <div> -->
          
        <!-- </div> -->
      </el-card>



<!-- 标签 -->
    <div class="flex-filter-container">

      <el-card class="month-selection-container" shadow="never">

      <span >上架</span>
      <el-date-picker
        class="month-picker"
        v-model="listQuery.StartMonth"
        type="month"
        placeholder="选择开始月份">
      </el-date-picker>

      <el-date-picker
        class="month-picker"
        v-model="listQuery.EndMonth"
        type="month"
        placeholder="选择截止月份">
      </el-date-picker>
      <el-button @click="handleSearchList()" type="primary" size="small">
          <i class="el-icon-search"></i>
        </el-button>
      </el-card>
    

      <el-card class="tag-selection-container" shadow="never">
        <i class="el-icon-star-off"></i>
        <span style="margin-right: 10px;">标签</span>
        <el-button 
          class="tag-button" type="primary"
          :plain="tagStates[0]"
          @click="handleTagChange(0)"
        >全部</el-button>
        <el-button class="tag-button" type="primary" plain 
          v-for="item in tagOptions" 
          :key="item.id"
          :plain="tagStates[item.id]"
          @click="handleTagChange(item.id)">
          {{ item.label,tagStates[item.id] }}</el-button>
      </el-card>

      
    </div>




    <!-- <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button class="btn-add" @click="handleAddProduct()" size="mini">
        添加
      </el-button>
    </el-card> -->
    <br>

      <div class="grid-container" id="product-grid">
          
            <el-card class="grid-item" v-for="(item, index) in list" :key="item.id"
              @click="handleShowProduct(item.id, item)">
            
              <img style="width: 100px; height: 100px;" :src="item.pic">
              <div class="product-text" id="item-title">{{ item.name }}</div>
              <div style="display: flex; justify-content: space-between;">
                <div class="item-price">￥{{ item.price }}</div>
                <div class="item-stock">库存: {{ item.stock }}</div>
              </div>
            
          </el-card>

        

        <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper" :page-size="listQuery.pageSize" :page-sizes="[20, 50, 1000]"
        :current-page.sync="listQuery.pageNum" :total="total">
      </el-pagination>
    </div>
    </div>

    <!-- <div class="table-container">
      <el-table ref="productTable" :data="list" style="width: 100%" @selection-change="handleSelectionChange"
        v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="编号" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="商品图片" width="120" align="center">
          <template slot-scope="scope"><img style="height: 80px" :src="scope.row.pic"></template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template slot-scope="scope">
            <p>{{ scope.row.name }}</p>
            <p>品牌：{{ scope.row.brandName }}</p>
          </template>
        </el-table-column>
        <el-table-column label="价格/货号" width="120" align="center">
          <template slot-scope="scope">
            <p>价格：￥{{ scope.row.price }}</p>
            <p>货号：{{ scope.row.productSn }}</p>
          </template>
        </el-table-column>
        <el-table-column label="标签" width="140" align="center">
          <template slot-scope="scope">
            <p>上架：
              <el-switch @change="handlePublishStatusChange(scope.$index, scope.row)" :active-value="1"
                :inactive-value="0" v-model="scope.row.publishStatus">
              </el-switch>
            </p>
            <p>新品：
              <el-switch @change="handleNewStatusChange(scope.$index, scope.row)" :active-value="1" :inactive-value="0"
                v-model="scope.row.newStatus">
              </el-switch>
            </p>
            <p>推荐：
              <el-switch @change="handleRecommendStatusChange(scope.$index, scope.row)" :active-value="1"
                :inactive-value="0" v-model="scope.row.recommandStatus">
              </el-switch>
            </p>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.sort }}</template>
        </el-table-column>
        <el-table-column label="SKU库存" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="handleShowSkuEditDialog(scope.$index, scope.row)"
              circle></el-button>
          </template>
        </el-table-column>
        <el-table-column label="销量" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.sale }}</template>
        </el-table-column>
        <el-table-column label="test" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.verifyStatus }}</template>
        </el-table-column>
        <el-table-column label="审核状态" width="100" align="center">
          <template slot-scope="scope">
            <p>{{ scope.row.verifyStatus | verifyStatusFilter }}</p>
            <p>
              <el-button type="text" @click="handleShowVerifyDetail(scope.$index, scope.row)">审核详情
              </el-button>
            </p>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template slot-scope="scope">
            <p>
              <el-button size="mini" @click="handleShowProduct(scope.$index, scope.row)">查看
              </el-button>
              <el-button size="mini" @click="handleUpdateProduct(scope.$index, scope.row)">编辑
              </el-button>
            </p>
            <p>
              <el-button size="mini" @click="handleShowLog(scope.$index, scope.row)">日志
              </el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除
              </el-button>
            </p>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="batch-operate-container">
      <el-select size="small" v-model="operateType" placeholder="批量操作">
        <el-option v-for="item in operates" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <el-button style="margin-left: 20px" class="search-button" @click="handleBatchOperate()" type="primary"
        size="small">
        确定
      </el-button>
    </div>
    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper" :page-size="listQuery.pageSize" :page-sizes="[5, 10, 15]"
        :current-page.sync="listQuery.pageNum" :total="total">
      </el-pagination>
    </div>
    <el-dialog title="编辑货品信息" :visible.sync="editSkuInfo.dialogVisible" width="40%">
      <span>商品货号：</span>
      <span>{{ editSkuInfo.productSn }}</span>
      <el-input placeholder="按sku编号搜索" v-model="editSkuInfo.keyword" size="small" style="width: 50%;margin-left: 20px">
        <el-button slot="append" icon="el-icon-search" @click="handleSearchEditSku"></el-button>
      </el-input>
      <el-table style="width: 100%;margin-top: 20px" :data="editSkuInfo.stockList" border>
        <el-table-column label="SKU编号" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.skuCode"></el-input>
          </template>
        </el-table-column>
        <el-table-column v-for="(item, index) in editSkuInfo.productAttr" :label="item.name" :key="item.id"
          align="center">
          <template slot-scope="scope">
            {{ getProductSkuSp(scope.row, index) }}
          </template>
        </el-table-column>
        <el-table-column label="销售价格" width="80" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.price"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="商品库存" width="80" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.stock"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="库存预警值" width="100" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.lowStock"></el-input>
          </template>
        </el-table-column>
      </el-table> -->
      <!-- <span slot="footer" class="dialog-footer">
        <el-button @click="editSkuInfo.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleEditSkuConfirm">确 定</el-button>
      </span>
    </el-dialog> -->
  </div>
</template>
<script>
import {
  fetchList,
  updateDeleteStatus,
  updateNewStatus,
  updateRecommendStatus,
  updatePublishStatus
} from '@/api/product'
import { fetchList as fetchSkuStockList, update as updateSkuStockList } from '@/api/skuStock'
import { fetchList as fetchProductAttrList } from '@/api/productAttr'
import { fetchList as fetchBrandList } from '@/api/brand'
import { fetchList as fetchWarehouseList } from '@/api/warehouse'
import { fetchListWithChildren } from '@/api/productCate'

const defaultListQuery = {
  keyword: null,
  pageNum: 1,
  pageSize: 20,
  publishStatus: null,
  verifyStatus: null,
  productSn: null,
  productCategoryId: null,
  brandId: null,
  // tags:{0:0,1:0,2:0}
};
export default {
  name: "productList",
  data() {
    return {
      selectedStartMonth: '',
      selectedEndMonth: '',
      editSkuInfo: {
        dialogVisible: false,
        productId: null,
        productSn: '',
        productAttributeCategoryId: null,
        stockList: [],
        productAttr: [],
        keyword: null,
        warehouseId: null,
      },
      operates: [
        {
          label: "商品上架",
          value: "publishOn"
        },
        {
          label: "商品下架",
          value: "publishOff"
        },
        {
          label: "设为推荐",
          value: "recommendOn"
        },
        {
          label: "取消推荐",
          value: "recommendOff"
        },
        {
          label: "设为新品",
          value: "newOn"
        },
        {
          label: "取消新品",
          value: "newOff"
        },
        {
          label: "转移到分类",
          value: "transferCategory"
        },
        {
          label: "移入回收站",
          value: "recycle"
        }
      ],
      operateType: null,
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      total: null,
      listLoading: true,
      selectProductCateValue: null,
      multipleSelection: [],
      productCateOptions: [],
      brandOptions: [],
      warehouseOptions: [],
      countryOptions: [],
      tagStates: {},
      tagOptions:[
        {
          label: "新品",
          id:1,
        },
        {
          label: "推荐",
          id:2,
        },
      ],
      
      publishStatusOptions: [{
        value: 1,
        label: '上架'
      }, {
        value: 0,
        label: '下架'
      }],
      verifyStatusOptions: [{
        value: 1,
        label: '审核通过'
      }, {
        value: 0,
        label: '未审核'
      }],

    }
  },
  created() {   //"created" hook; at this point, methods are loaded, but dom not constructed. Best for data fetching.
    
    this.getList();
    this.getBrandList();
    this.getWarehouseList();
    this.getProductCateList();
    this.initPage();
  },
  watlch: {
    selectProductCateValue: function (newValue) {
      if (newValue != null && newValue.length == 2) {
        this.listQuery.productCategoryId = newValue[1];
      } else {
        this.listQuery.productCategoryId = null;
      }

    }
  },
  filters: {
    verifyStatusFilter(value) {
      if (value === 1) {
        return '审核通过';
      } else {
        return '未审核';
      }
    }
  },
  methods: {
    getProductSkuSp(row, index) {
      let spData = JSON.parse(row.spData);
      if (spData != null && index < spData.length) {
        return spData[index].value;
      } else {
        return null;
      }
    },
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then(response => {
        this.listLoading = false;
        this.list = response.data.list;
        this.total = response.data.total;
      });
    },
    getBrandList() {
      fetchBrandList({ pageNum: 1, pageSize: 100 }).then(response => {
        this.brandOptions = [];
        let brandList = response.data.list;
        for (let i = 0; i < brandList.length; i++) {
          this.brandOptions.push({ label: brandList[i].name, value: brandList[i].id });
        }
      });
    },
    getWarehouseList() {
      fetchWarehouseList().then(response => {
        this.warehouseOptions = [];
        let warehouseList = response.data;
        console.log(warehouseList)
        for (let i = 0; i < warehouseList.length; i++) {
          this.warehouseOptions.push({ label: warehouseList[i].name, value: warehouseList[i].id });
        }
      });
    },
    getProductCateList() {
      fetchListWithChildren().then(response => {
        let list = response.data;
        this.productCateOptions = [];
        for (let i = 0; i < list.length; i++) {
          let children = [];
          if (list[i].children != null && list[i].children.length > 0) {
            for (let j = 0; j < list[i].children.length; j++) {
              children.push({ label: list[i].children[j].name, value: list[i].children[j].id });
            }
          }
          this.productCateOptions.push({ label: list[i].name, value: list[i].id, children: children });
        }
      });
    },

    initPage(){
      this.$set(this.tagStates, 0, false);
      this.tagOptions.forEach(tag => {
        this.$set(this.tagStates, tag.id, false);
      });
    },

    handleTagChange(id){
      this.tagStates[id] = !this.tagStates[id];
      
    },

    handleShowSkuEditDialog(index, row) {
      this.editSkuInfo.dialogVisible = true;
      this.editSkuInfo.productId = row.id;
      this.editSkuInfo.productSn = row.productSn;
      this.editSkuInfo.productAttributeCategoryId = row.productAttributeCategoryId;
      this.editSkuInfo.keyword = null;
      fetchSkuStockList(row.id, { keyword: this.editSkuInfo.keyword }).then(response => {
        this.editSkuInfo.stockList = response.data;
      });
      if (row.productAttributeCategoryId != null) {
        fetchProductAttrList(row.productAttributeCategoryId, { type: 0 }).then(response => {
          this.editSkuInfo.productAttr = response.data.list;
        });
      }
    },
    handleSearchEditSku() {
      fetchSkuStockList(this.editSkuInfo.productId, { keyword: this.editSkuInfo.keyword }).then(response => {
        this.editSkuInfo.stockList = response.data;
      });
    },
    handleEditSkuConfirm() {
      if (this.editSkuInfo.stockList == null || this.editSkuInfo.stockList.length <= 0) {
        this.$message({
          message: '暂无sku信息',
          type: 'warning',
          duration: 1000
        });
        return
      }
      this.$confirm('是否要进行修改', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateSkuStockList(this.editSkuInfo.productId, this.editSkuInfo.stockList).then(response => {
          this.$message({
            message: '修改成功',
            type: 'success',
            duration: 1000
          });
          this.editSkuInfo.dialogVisible = false;
        });
      });
    },
    handleSearchList() {
      this.listQuery.pageNum = 1;
      this.getList();
    },
    handleAddProduct() {
      this.$router.push({ path: '/pms/addProduct' });
    },
    handleBatchOperate() {
      if (this.operateType == null) {
        this.$message({
          message: '请选择操作类型',
          type: 'warning',
          duration: 1000
        });
        return;
      }
      if (this.multipleSelection == null || this.multipleSelection.length < 1) {
        this.$message({
          message: '请选择要操作的商品',
          type: 'warning',
          duration: 1000
        });
        return;
      }
      this.$confirm('是否要进行该批量操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = [];
        for (let i = 0; i < this.multipleSelection.length; i++) {
          ids.push(this.multipleSelection[i].id);
        }
        switch (this.operateType) {
          case this.operates[0].value:
            this.updatePublishStatus(1, ids);
            break;
          case this.operates[1].value:
            this.updatePublishStatus(0, ids);
            break;
          case this.operates[2].value:
            this.updateRecommendStatus(1, ids);
            break;
          case this.operates[3].value:
            this.updateRecommendStatus(0, ids);
            break;
          case this.operates[4].value:
            this.updateNewStatus(1, ids);
            break;
          case this.operates[5].value:
            this.updateNewStatus(0, ids);
            break;
          case this.operates[6].value:
            break;
          case this.operates[7].value:
            this.updateDeleteStatus(1, ids);
            break;
          default:
            break;
        }
        this.getList();
      });
    },
    handleSizeChange(val) {
      this.listQuery.pageNum = 1;
      this.listQuery.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val;
      this.getList();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handlePublishStatusChange(index, row) {
      let ids = [];
      ids.push(row.id);
      this.updatePublishStatus(row.publishStatus, ids);
    },
    handleNewStatusChange(index, row) {
      let ids = [];
      ids.push(row.id);
      this.updateNewStatus(row.newStatus, ids);
    },
    handleRecommendStatusChange(index, row) {
      let ids = [];
      ids.push(row.id);
      this.updateRecommendStatus(row.recommandStatus, ids);
    },
    handleResetSearch() {
      this.selectProductCateValue = [];
      this.listQuery = Object.assign({}, defaultListQuery);
    },
    handleDelete(index, row) {
      this.$confirm('是否要进行删除操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = [];
        ids.push(row.id);
        this.updateDeleteStatus(1, ids);
      });
    },
    handleUpdateProduct(index, row) {
      this.$router.push({ path: '/pms/updateProduct', query: { id: row.id } });
    },
    handleShowProduct(index, row) {
      console.log("handleShowProduct", row);
    },
    handleShowVerifyDetail(index, row) {
      console.log("handleShowVerifyDetail", row);
    },
    handleShowLog(index, row) {
      console.log("handleShowLog", row);
    },
    updatePublishStatus(publishStatus, ids) {
      let params = new URLSearchParams();
      params.append('ids', ids);
      params.append('publishStatus', publishStatus);
      updatePublishStatus(params).then(response => {
        this.$message({
          message: '修改成功',
          type: 'success',
          duration: 1000
        });
      });
    },
    updateNewStatus(newStatus, ids) {
      let params = new URLSearchParams();
      params.append('ids', ids);
      params.append('newStatus', newStatus);
      updateNewStatus(params).then(response => {
        this.$message({
          message: '修改成功',
          type: 'success',
          duration: 1000
        });
      });
    },
    updateRecommendStatus(recommendStatus, ids) {
      let params = new URLSearchParams();
      params.append('ids', ids);
      params.append('recommendStatus', recommendStatus);
      updateRecommendStatus(params).then(response => {
        this.$message({
          message: '修改成功',
          type: 'success',
          duration: 1000
        });
      });
    },
    updateDeleteStatus(deleteStatus, ids) {
      let params = new URLSearchParams();
      params.append('ids', ids);
      params.append('deleteStatus', deleteStatus);
      updateDeleteStatus(params).then(response => {
        this.$message({
          message: '删除成功',
          type: 'success',
          duration: 1000
        });
      });
      this.getList();
    }
  }
}
</script>

<style scoped>
/* #product-sn{

} */

#product-quantity{
  padding-left: 5px;
}
</style>
