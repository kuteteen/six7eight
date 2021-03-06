<template>
    <div style="height: 100%">
        <el-button v-if="canAdd"
                   size="medium" style="margin: 0 6px 6px;"
                   type="success" icon="el-icon-circle-plus-outline"
                   @click="dialogVisible = true">提交反馈</el-button>

        <el-table
                :data="tableData"
                :row-class-name="tableRowClassName"
                height="82%">
            <el-table-column
                    label="反馈日期"
                    min-width="155">
                <template slot-scope="scope">
                    <span>{{ scope.row.createTime}}</span>
                </template>
            </el-table-column>
            <el-table-column
                    prop="content"
                    label="反馈内容"
                    min-width="200">
            </el-table-column>
            <el-table-column
                    label="处理日期"
                    min-width="155">
                <template slot-scope="scope">
                    <span v-if="scope.row.dealTime">
                        <span>{{ scope.row.dealTime}}</span>
                    </span>
                </template>
            </el-table-column>
            <el-table-column
                    prop="dealContent"
                    label="处理内容"
                    min-width="200">
            </el-table-column>
        </el-table>
        <el-pagination
                style="text-align: center;"
                :pager-count="5"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-sizes="[5, 10, 15, 20, 25, 30, 35, 40]"
                :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="dataTotal">
        </el-pagination>

        <el-dialog title="添加问题反馈" :visible.sync="dialogVisible" top="6vh" width="30%" @closed="cancelDialog">
            <el-form :model="dialog" :rules="rules" ref="dialog">
                <el-form-item label="" prop="content">
                    <el-input
                            type="textarea"
                            :autosize="{ minRows: 3, maxRows: 10}"
                            placeholder="请输入反馈内容!"
                            v-model.trim="dialog.content">
                    </el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="add">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import {axiosGet, axiosPost} from "@/slfaxios";

    export default {
        name: "Feedback",
        async beforeRouteUpdate (to, from, next) {
            await this.getTableData(to.query.aimId);
            next();
        },
        async created() {
            await this.getTableData(this.$route.query.aimId);
        },
        data() {
            return {
                tableData: [],
                currentPage: 1,
                pageSize: 10,
                dataTotal: 0,
                dialogVisible: false,
                dialog: {
                    content: ''
                },
                rules: {
                    content: [
                        {required: true, message: '请输反馈内容!', trigger: 'blur'},
                        {max: 300, message: '内容不能超过300个字符！', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            tableRowClassName({row}) {
                return row.isDeal ? 'feedback-deal' : 'feedback-not-deal';
            },
            async getTableData(aimId) {
                if (aimId) {
                    let aimFeedback = await axiosGet(`/user/auth/feedback/${aimId}`);
                    this.tableData = [aimFeedback];
                    this.dataTotal = 1;
                }else {
                    let result = await axiosGet('/user/auth/feedbacks?currentPage=' +
                        this.currentPage + '&pageSize=' + this.pageSize);
                    if (result instanceof Array) {
                        let [datas, total] = result;
                        this.tableData = datas;
                        this.dataTotal = total;
                    }
                }
            },
            async handleSizeChange(size) {
                this.pageSize = size;
                await this.getTableData();
            },
            async handleCurrentChange(page) {
                this.currentPage = page;
                await this.getTableData();
            },
            cancelDialog() {
                this.dialog = {
                    content: ''
                };
                this.$refs.dialog.resetFields();
            },
            add() {
                this.$refs.dialog.validate(async (valid) => {
                    if (valid) {
                        if (!this.dialog.isCommitted) {
                            this.dialog.isCommitted = true;
                            let feedback = await axiosPost('/user/auth/feedback/add', this.dialog);
                            if (feedback) {
                                this.tableData.unshift(feedback);
                                this.dialogVisible = false;
                            }
                        }else{
                            this.$message.error('反馈已经提交了,请勿重复提交!');
                        }
                    } else {
                        return false;
                    }
                });
            }
        },
        computed: {
            canAdd() {
                return this.$store.state.permissions.some(item => {
                    return item === 'addFeedbackUser';
                });
            }
        }
    }
</script>

<style lang="scss">
    .el-table .feedback-deal {
        background: #F0F9EB;
    }

    .el-table .feedback-not-deal {
        background: #FDF5E6;
    }
</style>