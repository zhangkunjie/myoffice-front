<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="图书名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.author" placeholder="作者"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.isbn" placeholder="书号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="filters.category"
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
            v-model="filters.status"
            style="width:150px"
            placeholder="状态"
          >
            <el-option
              v-for="item in statusList"
              :key="item.code"
              :value="item.code"
              :label="item.name"
            ></el-option>
          </el-select>
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
      :data="dataList"
      highlight-current-row
      v-loading="listLoading"
      @selection-change="selsChange"
      style="width: 100%;"
    >
      <el-table-column prop="isbn" label="书号" min-width="15%"></el-table-column> 
      <el-table-column prop="name" label="书名" min-width="20%"></el-table-column>
      <el-table-column prop="author" label="作者" min-width="10%"></el-table-column>
      <el-table-column
        prop="category"
        label="类别"
        min-width="20%"
        :formatter="formatCategory"
      ></el-table-column>
      <el-table-column prop="page" label="页数" min-width="10%" sortable></el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        min-width="10%"
        :formatter="formatStatus"
      ></el-table-column>
      <el-table-column min-width="15%" label="操作">
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
      <el-form-item label="ISBN:" prop="isbn"  style="width:60%" >
          <el-input v-model="editForm.isbn" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="书名:" prop="name"  style="width:60%" >
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
         <el-form-item label="作者:" prop="author"  style="width:60%" >
          <el-input v-model="editForm.author" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="类别:" prop="category">
          <el-select
            v-model="editForm.category"
            @change="getCategory"
            style="width:40%"
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
        <el-form-item label="状态:" prop="status" v-model="editForm.status">
          <el-select
            v-model="editForm.status"
            style="width:40%"
            placeholder="状态:"
          >
            <el-option
              v-for="item in statusList"
              :key="item.code"
              :value="item.code"
              :label="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="页数:" prop="page"  style="width:30%" >
          <el-input v-model="editForm.page" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="读书笔记:" prop="note">
          <el-input type="textarea" v-model="editForm.note" auto-complete="off"></el-input>
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
    >
      <el-form label-width="100px" :model="addForm" ref="addForm">
        <el-form-item label="ISBN:" prop="isbn"  style="width:60%" >
          <el-input v-model="addForm.isbn" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="书名:" prop="name"  style="width:60%" >
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
         <el-form-item label="作者:" prop="author"  style="width:60%" >
          <el-input v-model="addForm.author" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="类别:" prop="category">
          <el-select
            v-model="addForm.category"
            @change="getCategory"
            style="width:40%"
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
        <el-form-item label="状态:" prop="status" v-model="addForm.status">
          <el-select
            v-model="addForm.status"
            style="width:40%"
            placeholder="状态:"
          >
            <el-option
              v-for="item in statusList"
              :key="item.code"
              :value="item.code"
              :label="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="页数:" prop="page"  style="width:30%" >
          <el-input v-model="addForm.page" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="读书笔记:" prop="note">
          <el-input type="textarea" v-model="addForm.note" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
      </div>
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
  addBook,
  deleteBook,
  updateBook
} from "../../api/api";

export default {
  data() {
    return {
      filters: {
        name: "",
        author:"",
        isbn:"",
        category: "",
        status: ""
      },
      dataList: [],
      statusList: [
        { code: "", name: "全部" },
        { code: 0, name: "未读" },
        { code: 1, name: "在读" },
        { code: 2, name: "已读" },
      ],
      statusMap: {
        "": "全部",
        0: "未读",
        1: "在读",
        2: "已读"
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
        isbn: [{ required: true, message: "请输入书号" }],
        name: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
        auhor: [{ required: true, message: "请输入作者" }],
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
    //状态转换
    formatStatus: function(row, column) {
      return this.statusMap.get(row.status);
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getBooks();
    },
    //获取图书列表
    getBooks() {
      //获取类别码表数据
      let params1 = {"categoryId":2};
      getCategoryList(params1).then(res => {
        this.categoryList = res.pairs.data;
        let total_item = { code: "", name: "全部" };
        this.categoryList.unshift(total_item);
        //增加全部选项
        this.categoryList;
        this.categoryMap = new Map(
          this.categoryList.map(i => [i.code, i.name])
        );
      });
      let params2 = {"categoryId":3};
      getCategoryList(params2).then(res => {
        this.statusList = res.pairs.data;
        let total_item = { code: "", name: "全部" };
        this.statusList.unshift(total_item);
        //增加全部选项
        this.statusList;
        this.statusMap = new Map(
          this.statusList.map(i => [i.code, i.name])
        );
      });
      let filter_createday = "";
      if (this.filters.createDay != undefined && this.filters.createDay != "") {
        filter_createday = moment(this.filters.createDay).format("YYYY-MM-DD");
      }
      let para = {
        name: this.filters.name,
        author:this.filters.author,
        status: this.filters.status,
        isbn:this.filters.isbn,
        category: this.filters.category,
        pageNo: this.page,
        pageSize: 15
      };
      this.listLoading = true;
      //NProgress.start();
      getBookListPage(para).then(res => {
        this.total = res.pairs.data.total;
        this.dataList = res.pairs.data.list;
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
          deleteBook(para).then(res => {
            this.listLoading = false;
            //NProgress.done();
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getBooks();
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
            updateBook(para).then(res => {
              this.editLoading = false;
              //NProgress.done();
              this.$message({
                message: "提交成功",
                type: "success"
              });
              this.$refs["editForm"].resetFields();
              this.editFormVisible = false;
              this.getBooks();
            });
          });
        }
      });
    },
    //新增
    addSubmit: function() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          let para = Object.assign({}, this.addForm);
          if (para.length == 0) {
            this.$message({
              message: "未添加任何任务",
              type: "error"
            });
            return;
          }
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            //NProgress.start();
            addBook(para).then(res => {
              this.addLoading = false;
              //NProgress.done();
              this.$message({
                message: "提交成功",
                type: "success"
              });
              this.$refs["addForm"].resetFields();
              this.addFormVisible = false;
              this.getBooks();
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
            this.getBooks();
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
.middleWidth {
  width: 80%;
}
.center {
  text-align: center;
}
</style>