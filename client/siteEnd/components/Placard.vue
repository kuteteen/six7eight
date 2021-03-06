<template>
    <div style="height: 100%">
        <el-button v-if="canAdd"
                   size="medium" style="margin: 0 6px 6px;"
                   type="success" icon="el-icon-circle-plus-outline"
                   @click="dialogVisible = true">添 加</el-button>

        <el-table
                :data="tableData"
                height="82%">
            <el-table-column
                    label="发布日期"
                    width="155">
                <template slot-scope="scope">
                    <span>{{ scope.row.createTime}}</span>
                </template>
            </el-table-column>
            <el-table-column
                    prop="user.username"
                    label="发布账户"
                    min-width="90">
            </el-table-column>
            <el-table-column
                    prop="content"
                    label="内容"
                    min-width="220">
            </el-table-column>
            <el-table-column
                    fixed="right"
                    label="操作">
                <template slot-scope="scope">
                    <el-button-group>
                        <el-button v-if="canEdit"
                                   type="primary" size="small"
                                   @click="edit(scope.row)">编 辑</el-button>
                        <el-button v-if="canDel"
                                   type="danger" size="small"
                                   @click="remove(scope.row.id)">删 除</el-button>
                    </el-button-group>
                </template>
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

        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" top="6vh" width="30%" @closed="cancelDialog">
            <el-form :model="dialog" :rules="rules" ref="dialog">
                <el-form-item label="" prop="content">
                    <el-input
                            type="textarea"
                            :autosize="{ minRows: 3, maxRows: 10}"
                            placeholder="请输入内容"
                            v-model.trim="dialog.content">
                    </el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button v-if="!dialog.edit" type="primary" @click="add">确 定</el-button>
                <el-button v-if="dialog.edit" type="primary" @click="update">保 存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import {axiosGet, axiosPost} from "@/slfaxios";

    export default {
        name: "Placard",
        async created() {
            await this.getTableData();
        },
        data() {
            return {
                tableData: [],
                currentPage: 1,
                pageSize: 10,
                dataTotal: 0,
                dialogVisible: false,
                dialogTitle: '添加公告',
                dialog: {
                    content: ''
                },
                rules: {
                    content: [
                        {required: true, message: '请输公告内容!', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            async getTableData() {
                let [datas, total] = await axiosGet('/site/auth/placards?currentPage=' +
                    this.currentPage + '&pageSize=' + this.pageSize);
                this.tableData = datas;
                this.dataTotal = total;
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
                this.dialogTitle = "添加公告";
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
                            let placard = await axiosPost('/site/auth/placard/add', this.dialog);
                            if (placard) {
                                this.tableData.unshift(placard);
                                this.dialogVisible = false;
                            }
                        }else{
                            this.$message.error('数据已经提交了,请勿重复提交!');
                        }
                    } else {
                        return false;
                    }
                });
            },
            edit(placard) {
                this.dialogTitle = '编辑公告';
                this.dialog = {
                    id: placard.id,
                    content: placard.content,
                    edit: true,
                    placard: placard
                };
                this.dialogVisible = true;
            },
            update() {
                this.$refs.dialog.validate(async (valid) => {
                    if (valid) {
                        if (!this.dialog.isCommitted) {
                            this.dialog.isCommitted = true;
                            let updated = await axiosPost('/site/auth/placard/update', this.dialog);
                            this.dialog.placard.content = updated.content;
                            this.dialogVisible = false;
                        }else{
                            this.$message.error('数据已经提交了,请勿重复提交!');
                        }
                    } else {
                        return false;
                    }
                });
            },
            remove(id) {
                this.$confirm('此操作将永久删除所选公告！', '注意', {
                    confirmButtonText: '确 定',
                    cancelButtonText: '取 消',
                    type: 'warning'
                }).then(async () => {
                    await axiosGet('/site/auth/placard/del/' + id);
                    this.tableData = this.tableData.filter((val) => {
                        return val.id !== id;
                    });
                }).catch((e) => {
                    console.log(e);
                });
            }
        },
        computed: {
            canAdd() {
                return this.$store.state.permissions.some(item => {
                    return item === 'addPlacardSite';
                });
            },
            canEdit() {
                return this.$store.state.permissions.some(item => {
                    return item === 'editPlacardSite';
                });
            },
            canDel() {
                return this.$store.state.permissions.some(item => {
                    return item === 'dealPlacardSite';
                });
            }
        }
    }
</script>

<style lang="scss">

</style>