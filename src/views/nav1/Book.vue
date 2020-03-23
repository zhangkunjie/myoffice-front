<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="任务名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="filters.category"
            @change="getCategory"
            style="width:80px"
            placeholder="类别"
          >
            <el-option
              v-for="item in categoryList"
              :key="item.code"
              :value="item.code"
              :label="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="filters.priority"
            @change="getPriorityList"
            style="width:150px"
            placeholder="优先级"
          >
            <el-option
              v-for="item in priorityList"
              :key="item.code"
              :value="item.code"
              :label="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-date-picker
            v-model="filters.createDay"
            type="date"
            format="yyyy-MM-dd"
            placeholder="日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" v-on:click="getBooks">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <!--列表-->
    <el-table
      :data="activityDataList"
      highlight-current-row
      v-loading="listLoading"
      @selection-change="selsChange"
      style="width: 100%;"
    >
      <el-table-column prop="name" label="任务" min-width="25%"></el-table-column>
      <el-table-column
        prop="category"
        label="类别"
        min-width="10%"
        sortable
        :formatter="formatCategory"
      ></el-table-column>
      <el-table-column
        prop="priority"
        label="优先级"
        sortable
        min-width="10%"
        :formatter="formatPriority"
      ></el-table-column>
      
      <el-table-column prop="createDay" label="日期" min-width="10%" sortable></el-table-column>
      <el-table-column prop="startTime" label="开始" min-width="10%" sortable></el-table-column>
      <el-table-column prop="endTime" label="结束" min-width="10%" sortable></el-table-column>
      <el-table-column prop="implementRate" label="执行率" min-width="10%" sortable></el-table-column>
      <el-table-column min-width="15%">
        <template scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination
        layout="prev, pager, next"
        @current-change="handleCurrentChange"
        :page-size="15"
        :total="total"
        style="float:right;"
      ></el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
        <el-form-item label="任务:" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="类别:" prop="category">
          <el-select
            v-model="editForm.category"
            @change="getCategory"
            style="width:80px"
            placeholder="类别:"
          >
            <el-option
              v-for="item in categoryList"
              :key="item.code"
              :value="item.code"
              :label="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="editForm.priority" @change="getPriorityList" placeholder="优先级">
            <el-option
              v-for="item in priorityList"
              :key="item.code"
              :value="item.code"
              :label="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期:" prop="createDay">
          <el-date-picker
            v-model="editForm.createDay"
            type="date"
            format="yyyy-MM-dd"
            placeholder="日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="开始时间:" prop="startTime" >
          <el-time-select
            v-model="editForm.startTime"
            type="time"
            value-format="HH:mm"
            placeholder="开始时间"
            format="HH:mm"
          ></el-time-select>
        </el-form-item>
        <el-form-item label="结束时间:" prop="endTime">
          <el-time-select
            v-model="editForm.endTime"
            type="time"
            value-format="HH:mm"
            format="HH:mm"
          ></el-time-select>
        </el-form-item>
        <el-form-item label="执行率:" prop="implementRate">
          <el-input v-model="editForm.implementRate" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注:" prop="remark">
          <el-input v-model="editForm.remark" auto-complete="off" :rows="2"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog
      title="新增"
      v-model="addFormVisible"
      :close-on-click-modal="false"
      customClass="customWidth"
    >
      <el-form label-width="0px" :model="addForm" ref="addForm">
        <el-form-item style="float:right">
          <el-button type="primary" size="small" @click="addColumn()">新增</el-button>
          <el-button type="primary" @click.native="addSubmit" size="small" :loading="addLoading">提交</el-button>
        </el-form-item>
        <el-table
          :data="addData"
          highlight-current-row
          v-loading="listLoading"
          @selection-change="selsChange"
          style="width: 100%;"
        >
          <el-table-column label="#" type="index" width="60" align="center"></el-table-column>
          <el-table-column label="类别" width="115px">
            <template slot-scope="scope">
              <el-form-item
                :prop="'data.'+ scope.$index +'.category'"
                :rules="addFormRules.category"
              >
                <el-select
                  v-model="scope.row.category"
                  @change="getCategory"
                  placeholder="类别"
                  style="margin-top:20px;"
                >
                  <el-option
                    v-for="item in categoryList"
                    :key="item.code"
                    :value="item.code"
                    :label="item.name"
                  ></el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="140px">
            <template slot-scope="scope">
              <el-form-item
                :prop="'data.'+ scope.$index +'.priority'"
                :rules="addFormRules.priority"
              >
                <el-select
                  v-model="scope.row.priority"
                  @change="getPriorityList"
                  placeholder="优先级"
                  style="margin-top:20px;"
                >
                  <el-option
                    v-for="item in priorityList"
                    :key="item.code"
                    :value="item.code"
                    :label="item.name"
                  ></el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="任务" width="200px">
            <template slot-scope="scope">
              <el-form-item :prop="'data.'+ scope.$index +'.name'" :rules="addFormRules.name">
                <el-input v-model="scope.row.name" style="margin-top:20px;"></el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="日期" style="width:180px">
            <template slot-scope="scope">
              <el-form-item
                :prop="'data.'+ scope.$index +'.createDay'"
                :rules="addFormRules.createDay"
                style="width:150px;"
              >
                <el-date-picker
                  v-model="scope.row.createDay"
                  type="date"
                  :picker-options="pickerCreataDay"
                  format="yyyy-MM-dd"
                  placeholder="日期"
                  style="margin-top:20px;width:120px"
                ></el-date-picker>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="开始时间">
            <template slot-scope="scope">
              <el-form-item
                :prop="'data.'+ scope.$index +'.startTime'"
                :rules="addFormRules.startTime"
              >
                <el-time-picker
                  v-model="scope.row.startTime"
                  type="time"
                  value-format="HH:mm:ss"
                  format="HH:mm:ss"
                  style="margin-top:20px;;width:100px"
                ></el-time-picker>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="结束时间">
            <template slot-scope="scope">
              <el-form-item :prop="'data.'+ scope.$index +'.endTime'" :rules="addFormRules.endTime">
                <el-time-picker
                  v-model="scope.row.endTime"
                  type="time"
                  value-format="HH:mm:ss"
                  format="HH:mm:ss"
                  style="margin-top:20px;;width:100px"
                ></el-time-picker>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="备注">
            <template slot-scope="scope">
              <el-input v-model="scope.row.remark"></el-input>
            </template>
          </el-table-column>
          <el-table-column>
            <template scope="scope">
              <el-button type="danger" size="small" @click="deleteColumn(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
    </el-dialog>
  </section>
</template>

<script>
import util from "../../common/js/util";
import moment, { max } from "moment";
//import NProgress from 'nprogress'
import {
  getBookListPage,
  getCategoryList,
  removeUser,
  batchRemoveUser,
  editUser,
  addActivity,
  deleteActivity,
  updateActivity
} from "../../api/api";

export default {
  data() {
    return {
      filters: {
        name: "",
        category: "",
        priority: ""
      },
      activityDataList: [],
      priorityList: [
        { code: "", name: "全部" },
        { code: 1, name: "重要紧急" },
        { code: 2, name: "重要不紧急" },
        { code: 3, name: "不重要紧急" },
        { code: 4, name: "不重要不紧急" }
      ],
      priorityMap: {
        "": "全部",
        1: "重要紧急",
        2: "重要不紧急",
        3: "不重要紧急",
        4: "不重要不紧急"
      },
      categoryList: [],
      categoryMap: {},
      total: 0,
      page: 1,
      listLoading: false,
      sels: [], //列表选中列
      editFormVisible: false, //编辑界面是否显示
      editLoading: false,
      editFormRules: {
        name: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
        createDay: [{ required: true, message: "请选择日期" }],
        startTime: [
          { required: true, message: "请选择开始时间", trigger: "blur" }
        ],
        endTime: [
          { required: true, message: "请选择结束时间", trigger: "blur" }
        ]
      },
      //添加界面数据
      addData: [],
      addColumn() {
        let data = {
          rowNum: 1,
          name: "",
          priority: 1,
          category: 1,
          createDay: moment()
            .add(1, "days")
            .format("YYYY-MM-DD")
        };
        this.addData.push(data);
        this.addForm.data = this.addData;
      },
      deleteColumn(index) {
        this.addData.splice(index, 1);
      },
      selectlistRow: [],
      //编辑界面数据
      editForm: {},
      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        name: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
        createDay: [{ required: true, message: "请选择日期" }],
        startTime: [{ required: true, message: "请选择开始时间" }],
        endTime: [{ required: true, message: "请选择结束时间" }]
      },
      //新增界面数据
      addForm: {},
      pickerCreataDay: {
        disabledDate: time => {
          let yesterday = Date.now() - 1000 * 3600 * 24 * 2;
          return time.getTime() < yesterday;
        }
      }
    };
  },
  methods: {
    //时间选择限制
    getPriorityList() {},
    getCategory() {},
    selectRow() {},
    //优先级转换
    formatPriority: function(row, column) {
      return this.priorityMap[row.priority];
    },
    //类别转换
    formatCategory: function(row, column) {
      return this.categoryMap.get(row.category);
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getActivities();
    },
    //获取图书列表
    getBooks() {
      //获取类别码表数据
      let params = {};
      getCategoryList(params).then(res => {
        this.categoryList = res.pairs.data;
        let total_item = { code: "", name: "全部" };
        this.categoryList.unshift(total_item);
        //增加全部选项
        this.categoryList;
        this.categoryMap = new Map(
          this.categoryList.map(i => [i.code, i.name])
        );
      });
      let filter_createday = "";
      if (this.filters.createDay != undefined && this.filters.createDay != "") {
        filter_createday = moment(this.filters.createDay).format("YYYY-MM-DD");
      }
      let para = {
        name: this.filters.name,
        // priority: this.filters.priority,
        // category: this.filters.category,
        // createDay: filter_createday,
        pageNo: this.page,
        pageSize: 15
      };
      this.listLoading = true;
      //NProgress.start();
      getBookListPage(para).then(res => {
        this.total = res.pairs.data.total;
        this.activityDataList = res.pairs.data.list;
        this.listLoading = false;
        //NProgress.done();
      });
    },
    //删除
    handleDel: function(index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          this.listLoading = true;
          //NProgress.start();
          let para = { id: row.id };
          deleteActivity(para).then(res => {
            this.listLoading = false;
            //NProgress.done();
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getActivities();
          });
        })
        .catch(() => {});
    },
    //显示编辑界面
    handleEdit: function(index, row) {
      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    //显示新增界面
    handleAdd: function() {
      this.addFormVisible = true;
      this.addData.splice(0, this.addData.length);
    },
    //编辑
    editSubmit: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm);
            updateActivity(para).then(res => {
              this.editLoading = false;
              //NProgress.done();
              this.$message({
                message: "提交成功",
                type: "success"
              });
              this.$refs["editForm"].resetFields();
              this.editFormVisible = false;
              this.getActivities();
            });
          });
        }
      });
    },
    //新增
    addSubmit: function() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          let para = Object.assign({}, this.addData);
          let params = [];
          for (let i = 0; i < Object.keys(para).length; i++) {
            para[i].startTime = moment(para[i].startTime).format("HH:mm:ss");
            para[i].endTime = moment(para[i].endTime).format("HH:mm:ss");
            params[i] = para[i];
          }
          if (params.length == 0) {
            this.$message({
              message: "未添加任何任务",
              type: "error"
            });
            return;
          }
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            //NProgress.start();
            addActivity(params).then(res => {
              this.addLoading = false;
              //NProgress.done();
              this.$message({
                message: "提交成功",
                type: "success"
              });
              this.$refs["addForm"].resetFields();
              this.addFormVisible = false;
              this.getActivities();
            });
          });
        }
      });
    },
    selsChange: function(sels) {
      this.sels = sels;
    },
    //批量删除
    batchRemove: function() {
      var ids = this.sels.map(item => item.id).toString();
      this.$confirm("确认删除选中记录吗？", "提示", {
        type: "warning"
      })
        .then(() => {
          this.listLoading = true;
          //NProgress.start();
          let para = { ids: ids };
          batchRemoveUser(para).then(res => {
            this.listLoading = false;
            //NProgress.done();
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getActivities();
          });
        })
        .catch(() => {});
    }
  },
  mounted() {
    this.getBooks();
  }
};
</script>

<style>
.customWidth {
  width: 100%;
}
.center {
  text-align: center;
}
</style>