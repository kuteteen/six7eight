<template>
    <el-menu background-color="#f3f3f3" router :default-active="$route.path" unique-opened @select="menuActive">
        <template v-for="item in productMenus">
            <el-submenu
                    v-if="item.onSale && item.children.length > 0"
                    :index="item.id">
                <template slot="title">
                    <i class="el-icon-goods"></i>
                    <span slot="title">{{item.name}}</span>
                </template>
                <el-menu-item
                        v-for="childItem in item.children"
                        v-if="childItem.onSale"
                        :index="'/product/' + childItem.id"
                        :key="childItem.id">
                    <i class="el-icon-tickets"></i>
                    {{childItem.name}}
                </el-menu-item>
            </el-submenu>
        </template>
        <template v-for="item in rightMenus">
            <el-submenu :index="item.id" v-if="item.type === 'menuGroup' && item.children.length > 0">
                <template slot="title">
                    <i v-if="item.icon" :class="item.icon"></i>
                    <span slot="title">{{item.name}}</span>
                </template>
                <el-menu-item v-for="childItem in item.children" :index="childItem.path" :key="childItem.id">
                    <i v-if="childItem.icon" :class="childItem.icon"
                       :style="childItem.fingerprint === 'rechargeUser' ? 'color: red;' : ''"></i>
                    <span :style="childItem.fingerprint === 'rechargeUser' ? 'color: red;' : ''">{{childItem.name}}</span>
                </el-menu-item>
            </el-submenu>
            <el-menu-item :index="item.path" v-else>
                <i v-if="item.icon" :class="item.icon"
                   :style="item.fingerprint === 'rechargeUser' ? 'color: red;' : ''"></i>
                <span slot="title" :style="item.fingerprint === 'rechargeUser' ? 'color: red;' : ''">{{item.name}}</span>
            </el-menu-item>
        </template>
    </el-menu>
</template>

<script>
    import {pageChangeMsg, closeSideMenu} from "@/utils";
    export default {
        name: "SideMenu",
        componentName: "SideMenu",
        created() {
            if(this.siteId){
                this.registerIoListener();
            }
        },
        watch: {
            siteId() {
                this.registerIoListener();
            }
        },
        methods: {
            menuActive() {
                closeSideMenu();
            },
            registerIoListener() {

                // 添加商品类别
                this.$options.sockets[this.siteId + 'type'] = (type) => {
                    this.$store.commit('addTypeToMenu', type);
                };

                // 添加商品
                this.$options.sockets[this.siteId + 'product'] = (data) => {
                    this.$store.commit('addProductToMenu', data);
                };

                // 修改商品类别或商品信息
                this.$options.sockets[this.siteId + 'typeOrProductUpdate'] = (data) => {
                    this.$store.commit('typeOrProductUpdate', data);

                    let routeId = this.$route.params.id;
                    if (routeId) {
                        if (data.type === 'product' && data.id === routeId && !data.onSale) {
                            this.$router.push('/');
                            pageChangeMsg('"' + data.name + '" 业务已经下架了！');
                        }

                        if (data.type === 'productType' && !data.onSale) {
                            let aimType = null;
                            for(let i = 0; i < this.typeRights.length; i++){
                                let type = this.typeRights[i];
                                for(let j = 0; j < type.children.length; j++){
                                    let product = type.children[j];
                                    if (product.id === routeId) {
                                        aimType = type;
                                        break;
                                    }
                                }
                            }
                            if (aimType.id === data.id) {
                                this.$router.push('/');
                                pageChangeMsg('"' + data.name + '" 业务已经下架了！');
                            }
                        }
                    }
                };
            },
        },
        computed: {
            siteId() {
                return this.$store.state.siteId;
            },
            productMenus() {
                return this.$store.state.productMenus;
            },
            rightMenus() {
                return this.$store.state.rightMenus;
            }
        }
    }
</script>

<style lang="scss">

</style>