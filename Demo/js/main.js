;(function () {
    'use strict';

    var Event=new Vue();

    var alert_sound=document.getElementById("alert-sound")

    //assign()将所有可枚举属性的值从一个或多个源对象复制到目标对象。它将返回目标对象。
    //因为用的多，所进行封装
    function copy(obj) {
        return Object.assign({},obj);
    }

    Vue.component('task',{
        template:'#task-tpl',
        props:['todo'],
        methods:{
            action:function (name,params) {
                //触发当前实例上的事件。附加参数都会传给监听器回调
                Event.$emit(name,params);
            }
        }
    })

    new Vue({
        el:'#main',
        data:{
            list:[],
            last_id:0,
            current:{},
        },

        mounted:function(){
            var me=this;
            this.list=ms.get('list')||this.list;
            this.last_id=ms.get('last_id')||this.last_id;

            //刷新页面后重复检测,多次提醒
            setInterval(function () {
                me.check_alerts();
            },1000);

            Event.$on('remove',function (id) {
                if(id)
                    me.remove(id);
            });

            Event.$on('toggle_complete',function (id) {
                if(id)
                    me.toggle_complete(id);
            });

            Event.$on('set_current',function (id) {
                if(id)
                    me.set_current(id);
            })
            Event.$on('toggle_detail',function (id) {
                if(id)
                    me.toggle_detail(id);
            })
        },

        methods:{
            check_alerts:function(){
                var me=this;
                this.list.forEach(function (row,i) {
                    var alert_at=row.alert_at;
                    if(!alert_at||row.alert_confirmed)
                        return;

                    var alert_at=(new Date(alert_at)).getTime();
                    var now=(new Date()).getTime();

                    if(now>=alert_at){
                        alert_sound.play();
                        var confirmed=confirm(row.title);
                        Vue.set(me.list[i],'alert_confirmed',confirmed);
                    }
                })
            },
            //新增和修改数据
            merge:function () {
                var is_update,id;
                is_update=id=this.current.id;
                if(is_update){
                   var index=this.find_index(id);
                   Vue.set(this.list,index,copy(this.current));
                }
                else {
                    var title = this.current.title;
                    if (!title && title != 0)
                        return;
                    var todo = copy(this.current);
                    this.last_id++;
                    todo.id=this.last_id;
                    ms.set('last_id',this.last_id);

                    this.list.push(todo);
                }
                this.reset_current();
            },

            toggle_detail:function(id){
                var index=this.find_index(id);
                this.list[index].show_detail;
                Vue.set(this.list[index],'show_detail',!this.list[index].show_detail)
        },

            remove:function (id) {
                //移除一个所选id的元素
                //splice()有替换，删除，增加功能，贼牛逼
                var index=this.find_index(id);
                this.list.splice(index,1);
            },

            set_current:function (todo) {
                this.current=copy(todo);
            },
            
            reset_current:function () {
                //清空输入栏
                this.set_current({});
            },
            
            find_index:function (id) {
                //item作用：向匿名函数里传递你当前点击的元素
                return this.list.findIndex(function (item) {
                    return item.id==id;
                })
            },
            
            toggle_complete:function (id) {
                var i=this.find_index(id);
                Vue.set(this.list[i],'completed',!this.list[i].completed);
            }
        },
        watch:{
            list:{
                deep:true,
                handler:function (new_val,old_val) {
                    if(new_val){
                        ms.set('list',new_val);
                    }else {
                        ms.set('list',[]);
                    }
                }
            }
        }
    });
})();