<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item label="时间">
          <el-date-picker
            v-model="filters.startDay"
            type="date"
            :picker-options="pickerStartTime"
            format="yyyy-MM-dd"
            placeholder
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="至" label-width="25px">
          <el-date-picker
            v-model="filters.endDay"
            type="date"
            format="yyyy-MM-dd"
            :picker-options="pickerEndTime"
            placeholder
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getUsers">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table
      :data="data"
      highlight-current-row
      v-loading="listLoading"
      @selection-change="selsChange"
      style="width: 100%;"
    >
      <el-table-column type="index" label="#" width="60"></el-table-column>
      <el-table-column prop="createDay" label="日期" min-width="100" sortable></el-table-column>
      <el-table-column prop="avgImplementRate" label="平均执行率" min-width="100"></el-table-column>
    </el-table>
    <el-row style="width:100%;back-ground:yellow">
      <el-col v-loading="listLoading" :span="24" style="width:100%">
        <div id="chartColumn" style="height:400px;"></div>
      </el-col>
    </el-row>
  </section>
</template>

<script>
import util from "../../common/js/util";
import echarts from "echarts";
import moment, { max } from "moment";
//import NProgress from 'nprogress'
import {
  findAvgImplementRate,
  getUserListPage,
  removeUser,
  batchRemoveUser,
  editUser,
  addUser,
  getArticleSource,
  getReportMetricHistogram
} from "../../api/api";
import { major } from "semver";
export default {
  data() {
    return {
      filters: {
        startDay: moment()
          .add(-7, "days")
          .format("L"),
        endDay: moment()
          .add(-1, "days")
          .format("L"),
        intervalOption: "day",
        metricOption: ""
      },
      //开始时间选择过滤：不能选择超过明天的时间
      pickerStartTime: {
        disabledDate: time => {
          let tommorw = Date.now() + 1000 * 3600 * 24;
          return time.getTime() > tommorw;
        }
      },
      //结束时间选择过滤：不能选择超过明天的时间
      pickerEndTime: {
        disabledDate: time => {
          let tommorw = Date.now() + 1000 * 3600 * 24;
          return time.getTime() > tommorw;
        }
      },
      //metricOptions: [{ id: "0", label: "全部" }],
      metricOptions: [],
      intervalOptions: [
        { id: "day", label: "天" },
        { id: "hour", label: "时" },
        { id: "week", label: "周" }
      ],
      data: [],
      options: [],
      total: 0,
      page: 1,
      listLoading: false,
      sels: [], //列表选中列
      editFormVisible: false, //编辑界面是否显示
      editLoading: false,
      editFormRules: {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }]
      },
      //编辑界面数据
      editForm: {
        id: 0,
        name: "",
        sex: -1,
        age: 0,
        birth: "",
        addr: ""
      },

      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }]
      },
      //新增界面数据
      addForm: {
        name: "",
        sex: -1,
        age: 0,
        birth: "",
        addr: ""
      },
      chartColumn: null,
      chartBar: null,
      chartLine: null,
      chartPie: null
    };
  },
  methods: {
    getIntervalValue() {},
    //填充报表指标的查询下拉选择菜单
    getMetricOptions() {
      let params = {
        report_id: 1
      };
    },
    getMetricValue: function(value) {
      let params = { metric_id: this.metricOption };
      //getReportMetricHistogram(params).then(res => {
      //alert(res.data);
      //});
    },
    drawColumnChart(xAxis, seriesData) {
      var option = {
        xAxis: {
          type: "category",
          data: xAxis
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            data: seriesData,
            type: "line"
          }
        ]
      };
      this.chartColumn = echarts.init(document.getElementById("chartColumn"));
      this.chartColumn.setOption(option, true);
    },
    //性别显示转换
    formatSex: function(row, column) {
      return row.sex == 1 ? "男" : row.sex == 0 ? "女" : "未知";
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getUsers();
    },
    //获取用户列表
    getUsers() {
      let params = {
        startDay: moment(new Date(this.filters.startDay)).format("YYYY-MM-DD"),
        endDay: moment(new Date(this.filters.endDay)).format("YYYY-MM-DD")
      };
      this.listLoading = true;
      //NProgress.start();
      findAvgImplementRate(params).then(res => {
        this.data = res.pairs.data;
        let xAxis = [];
        let seriesData = [];
        for (var i = 0; i < this.data.length; i++) {
          xAxis[i] = this.data[i].createDay;
          seriesData[i] = this.data[i].avgImplementRate;
        }
        //有数据才显示图表
        this.drawColumnChart(xAxis, seriesData);
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
          removeUser(para).then(res => {
            this.listLoading = false;
            //NProgress.done();
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getUsers();
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
      this.addForm = {
        name: "",
        sex: -1,
        age: 0,
        birth: "",
        addr: ""
      };
    },
    //编辑
    editSubmit: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm);
            para.birth =
              !para.birth || para.birth == ""
                ? ""
                : util.formatDate.format(new Date(para.birth), "yyyy-MM-dd");
            editUser(para).then(res => {
              this.editLoading = false;
              //NProgress.done();
              this.$message({
                message: "提交成功",
                type: "success"
              });
              this.$refs["editForm"].resetFields();
              this.editFormVisible = false;
              this.getUsers();
            });
          });
        }
      });
    },
    //新增
    addSubmit: function() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.addForm);
            para.birth =
              !para.birth || para.birth == ""
                ? ""
                : util.formatDate.format(new Date(para.birth), "yyyy-MM-dd");
            addUser(para).then(res => {
              this.addLoading = false;
              //NProgress.done();
              this.$message({
                message: "提交成功",
                type: "success"
              });
              this.$refs["addForm"].resetFields();
              this.addFormVisible = false;
              this.getUsers();
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
            this.getUsers();
          });
        })
        .catch(() => {});
    }
  },
  mounted() {
    this.getUsers();
  },
  updated: function() {
    //this.drawCharts()
  },
  components: {}
};
</script>
<style scoped>
</style>