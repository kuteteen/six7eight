(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{210:function(e,t,n){},211:function(e,t,n){},212:function(e,t,n){},243:function(e,t,n){"use strict";var i=n(210);n.n(i).a},245:function(e,t,n){"use strict";var i=n(211);n.n(i).a},247:function(e,t,n){"use strict";var i=n(212);n.n(i).a},265:function(e,t,n){"use strict";n.r(t);var i={name:"header-menu",componentName:"header-menu",methods:{handleCommand(e){this.$message("click on item "+e)}},computed:{user(){return this.$store.state.info.user}}},s=(n(247),n(6)),a=Object(s.a)(i,function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("el-row",{staticClass:"header-menu",attrs:{type:"flex",justify:"space-between"}},[n("el-col",{attrs:{span:6}},[n("div",{staticClass:"menu-btn",on:{click:function(e){}}},[n("i",{staticClass:"el-icon-menu",attrs:{title:"菜单"}})]),e._v(" "),n("div",{staticClass:"home"},[n("router-link",{attrs:{to:"/home"}},[e._v("678网络营销平台")])],1)]),e._v(" "),n("el-col",{attrs:{span:12}},[n("div",{staticClass:"user-funds"},[n("span",[e._v("余额："),n("span",[e._v("13123.0000")]),e._v("￥")]),e._v("\n               \n            "),n("span",[e._v("冻结："),n("span",[e._v("23.0123")]),e._v("￥")])])]),e._v(" "),n("el-col",{attrs:{span:8}},[n("div",{staticClass:"user-role"},[n("router-link",{attrs:{to:"/home/admin/info"}},[e._v("\n                "+e._s(e.user.username)+" ( "+e._s(e.user.role.name)+" )\n            ")])],1)])],1)},[],!1,null,null,null).exports,o={name:"side-menu",componentName:"side-menu",data:()=>({menus:[{path:"/home/wx",icon:"el-icon-setting",name:"微信推广",isShow:!0,hasChild:!0,children:[{path:"/home/wx/fans",icon:"el-icon-setting",name:"微信粉丝",isShow:!0,hasChild:!1},{path:"/home/wx/friend",icon:"el-icon-setting",name:"微信好友",isShow:!0,hasChild:!1},{path:"/home/wx/code",icon:"el-icon-setting",name:"微信扫码",isShow:!0,hasChild:!1}]},{path:"/home/order/err",icon:"el-icon-setting",name:"订单报错",isShow:!0,hasChild:!1},{path:"/home/funds",icon:"el-icon-setting",name:"资金管理",isShow:!0,hasChild:!0,children:[{path:"/home/funds/recharge",icon:"el-icon-setting",name:"充值记录",isShow:!0,hasChild:!1},{path:"/home/funds/withdraw",icon:"el-icon-setting",name:"提现记录",isShow:!0,hasChild:!1}]},{path:"/home/products",icon:"el-icon-setting",name:"商品管理",isShow:!0,hasChild:!0,children:[{path:"/home/products/types",icon:"el-icon-setting",name:"分类列表",isShow:!0,hasChild:!1},{path:"/home/products/all",icon:"el-icon-setting",name:"所有商品",isShow:!0,hasChild:!1}]},{path:"/home/placards",icon:"el-icon-setting",name:"公告管理",isShow:!0,hasChild:!0,children:[{path:"/home/placards/platform",icon:"el-icon-setting",name:"系统公告",isShow:!0,hasChild:!1},{path:"/home/placards/site",icon:"el-icon-setting",name:"分站公告",isShow:!0,hasChild:!1}]},{path:"/home/sites",icon:"el-icon-setting",name:"分站管理",isShow:!0,hasChild:!1},{path:"/home/feedback",icon:"el-icon-setting",name:"问题反馈",isShow:!0,hasChild:!0,children:[{path:"/home/feedback/site",icon:"el-icon-setting",name:"站点反馈",isShow:!0,hasChild:!1},{path:"/home/feedback/user",icon:"el-icon-setting",name:"用户反馈",isShow:!0,hasChild:!1}]},{path:"/home/admins",icon:"el-icon-setting",name:"系统管理员",isShow:!0,hasChild:!0,children:[{path:"/home/admins/role",icon:"el-icon-setting",name:"角色管理",isShow:!0,hasChild:!1},{path:"/home/admins/list",icon:"el-icon-setting",name:"管理员列表",isShow:!0,hasChild:!1}]},{path:"/home/test",icon:"el-icon-setting",name:"测试",isShow:!0,hasChild:!1}]}),methods:{selected(e,t){this.$router.push(e)}},computed:{}},h=(n(245),{name:"platform-home",components:{HeaderMenu:a,SideMenu:Object(s.a)(o,function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("el-menu",{staticClass:"el-menu-vertical-demo",attrs:{router:"","default-active":e.$route.path,"unique-opened":""},on:{select:e.selected}},[e._l(e.menus,function(t,i){return t.isShow?[t.hasChild?n("el-submenu",{attrs:{index:t.path}},[n("template",{slot:"title"},[n("i",{class:t.icon}),e._v(" "),n("span",{attrs:{slot:"title"},slot:"title"},[e._v(e._s(t.name))])]),e._v(" "),e._l(t.children,function(t,i){return n("el-menu-item",{key:i,attrs:{index:t.path}},[e._v("\n                "+e._s(t.name)+"\n            ")])})],2):n("el-menu-item",{attrs:{index:t.path}},[n("i",{class:t.icon}),e._v(" "),n("span",{attrs:{slot:"title"},slot:"title"},[e._v(e._s(t.name))])])]:e._e()})],2)},[],!1,null,null,null).exports}}),l=(n(243),Object(s.a)(h,function(){var e=this.$createElement,t=this._self._c||e;return t("el-container",{staticStyle:{height:"inherit"}},[t("el-header",{staticStyle:{padding:"0"},attrs:{height:"50px"}},[t("header-menu")],1),this._v(" "),t("el-container",{staticStyle:{overflow:"hidden"}},[t("el-aside",{staticStyle:{"border-right":"solid 1px #e6e6e6"},attrs:{width:"260px"}},[t("side-menu")],1),this._v(" "),t("el-main",[t("router-view")],1)],1)],1)},[],!1,null,"be78a6b4",null));t.default=l.exports},6:function(e,t,n){"use strict";function i(e,t,n,i,s,a,o,h){var l,c="function"==typeof e?e.options:e;if(t&&(c.render=t,c.staticRenderFns=n,c._compiled=!0),i&&(c.functional=!0),a&&(c._scopeId="data-v-"+a),o?(l=function(e){(e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),s&&s.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(o)},c._ssrRegister=l):s&&(l=h?function(){s.call(this,this.$root.$options.shadowRoot)}:s),l)if(c.functional){c._injectStyles=l;var r=c.render;c.render=function(e,t){return l.call(t),r(e,t)}}else{var d=c.beforeCreate;c.beforeCreate=d?[].concat(d,l):[l]}return{exports:e,options:c}}n.d(t,"a",function(){return i})}}]);
//# sourceMappingURL=17.f4fcec1224625ea72f67.js.map