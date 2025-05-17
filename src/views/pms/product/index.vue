<template>
  <div class="app-container">

    <!-- 筛选条件分组 -->
    <div class="filter-group">
      <!-- 仓库 & 分类筛选 -->
      <el-card class="filter-card" shadow="never">
        <div class="filter-item">
          <span class="filter-label">仓库：</span>
          <el-select
            v-model="listQuery.warehouseId"
            placeholder="请选择库"
            clearable
            @change="handleSearchList"
          >
            <el-option
              v-for="item in warehouseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="filter-item">
          <span class="filter-label">分类：</span>
          <el-cascader
            v-model="selectProductCateValue"
            :options="productCateOptions"
            clearable
            @change="handleSearchList"
          />
        </div>
      </el-card>

      <!-- 搜索栏 -->
      <el-card class="filter-card" shadow="never">
        <div class="filter-item">
          <span class="filter-label">搜索：</span>
          <el-input
            v-model="listQuery.keyword"
            placeholder="商品名称"
            style="width: 200px"
          />
          <el-button
            type="primary"
            size="small"
            @click="handleSearchList"
          >
            <i class="el-icon-search" />
          </el-button>
        </div>
      </el-card>

      <!-- 日期范围筛选 -->
      <el-card class="filter-card" shadow="never">
        <div class="filter-item">
          <span class="filter-label">上架时间：</span>
          <el-date-picker
            v-model="listQuery.StartMonth"
            type="month"
            placeholder="开始月份"
            class="date-picker"
          />
          <span class="date-separator">至</span>
          <el-date-picker
            v-model="listQuery.EndMonth"
            type="month"
            placeholder="结束月份"
            class="date-picker"
          />
          <el-button
            type="primary"
            size="small"
            @click="handleSearchList"
          >
            <i class="el-icon-search" />
          </el-button>
        </div>
      </el-card>

      <!-- 标签筛选 -->
      <el-card class="filter-card" shadow="never">
        <div class="filter-item">
          <i class="el-icon-star-off" />
          <span class="filter-label">标签：</span>
          <el-button
            v-for="tag in tagOptions"
            :key="tag.id"
            :plain="!tagStates[tag.id]"
            type="primary"
            class="tag-button"
            @click="handleTagChange(tag.id)"
          >
            {{ tag.label }}
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 商品展示 -->
    <div class="grid-container" id="product-grid">
      <el-card class="grid-item" v-for="(item, index) in list" :key="item.id" @click="handleShowProduct(item.id, item)">
        <img style="width: 100px; height: 100px;" :src="item.pic">
        <div class="product-text" id="item-title">{{ item.name }}</div>
        <div style="display: flex; flex-direction: column;">
          <div class="item-price">{{ item.currency }}{{ item.price }}</div>
          <div class="item-stock">库存: {{ item.stock }}</div>
        </div>
      </el-card>
    </div>

    <!-- 分页 -->
    <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                   layout="total, sizes,prev, pager, next,jumper" :page-size="listQuery.pageSize" :page-sizes="[100, 500, 1000]"
                   :current-page.sync="listQuery.pageNum" :total="total">
    </el-pagination>

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
  pageSize: 100,
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
.filter-card {
  margin-bottom: 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.grid-container{
  display: grid;
  grid-template-columns: repeat(10, 1fr); /* 每行 10 列 */
  gap: 16px; /* 卡片之间的间距 */
  margin-top: 20px;
}
.grid-item {
  width: 100%;
}

.date-picker {
  width: 140px;
}

.tag-button {
  margin: 0 4px;
}
</style>
