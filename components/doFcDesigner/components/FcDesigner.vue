<template>
  <a-layout class="_fc-designer">
    <a-layout-sider hide-trigger class="_fc-l" width="266" style="background: #ffffff">
      <div v-for="(item, index) in menuList" class="_fc-l-group" :key="index">
        <h4 class="_fc-l-title">{{ item.title }}</h4>
        <draggable
          :group="{ name: 'default', pull: 'clone', put: false }"
          :sort="false"
          item-key="name"
          :list="item.list"
        >
          <template #item="{ element, index }">
            <div class="_fc-l-item" :key="index">
              <div class="_fc-l-icon">
                <i class="fc-icon" :class="element.icon || 'icon-input'"></i>
              </div>
              <span class="_fc-l-name">{{ element.label }}</span>
            </div>
          </template>
        </draggable>
      </div>
    </a-layout-sider>
    <a-layout-content class="_fc-m">
      <div class="_fc-m-tools">
        <slot name="btns"></slot>
      </div>
      <div class="_fc-dragBox">
        <div class="_fc-m-drag">
          <form-create :rule="dragForm.rule" :option="form.value" v-model:api="dragForm.api" />
        </div>
      </div>
    </a-layout-content>
    <a-layout-sider hide-trigger class="_fc-r" width="320" style="background: #ffffff">
      <div style="height: 100%; overflow: auto">
        <div height="40px" class="_fc-r-tabs">
          <div
            class="_fc-r-tab"
            :class="{ active: activeTab === 'props' }"
            v-if="!!activeRule"
            @click="activeTab = 'props'"
          >
            组件配置
          </div>
          <div
            class="_fc-r-tab"
            :class="{ active: activeTab === 'form' && !!activeRule }"
            @click="activeTab = 'form'"
          >
            表单配置
          </div>
        </div>
        <div v-show="activeTab === 'form'" style="padding: 20px">
          <form-create :rule="form.rule" :option="form.option" v-model="form.value.form" />
        </div>
        <div
          v-show="activeTab === 'props'"
          style="padding: 20px"
          :key="activeRule ? activeRule.id : ''"
        >
          <div>
            <!-- <a-divider v-if="showBaseRule">基础配置</a-divider> -->
            <form-create
              v-if="showBaseRule"
              v-model:api="baseForm.api"
              v-model="baseForm.value"
              :rule="baseForm.rule"
              :option="baseForm.options"
              @change="baseChange"
            />
            <!-- <a-divider>属性配置</a-divider> -->
            <form-create
              v-model:api="propsForm.api"
              v-model="propsForm.value"
              :rule="propsForm.rule"
              :option="propsForm.options"
              @change="propChange"
            />
            <!-- @removeField="propRemoveField" -->
            <!-- <a-divider v-if="showBaseRule">验证规则</a-divider> -->
            <form-create
              v-if="showBaseRule"
              v-model:api="validateForm.api"
              v-model="validateForm.value"
              :rule="validateForm.rule"
              :option="validateForm.options"
              @change="validateChange"
            />
          </div>
        </div>
      </div>
    </a-layout-sider>
  </a-layout>
</template>

<script>
import { defineComponent, ref, reactive, toRefs, provide, nextTick, onMounted } from 'vue';
import form from '../config/base/form';
import field from '../config/base/field';
import validate from '../config/base/validate';
import { deepCopy } from '@form-create/utils/lib/deepextend';
import is from '@form-create/utils/lib/type';
import { lower } from '@form-create/utils/lib/tocase';
import ruleList from '../config/rule';
import draggable from 'vuedraggable/src/vuedraggable';
import formCreate from '@form-create/ant-design-vue';
import createMenu from '../config/menu';
import { upper } from '../utils/index';
import uniqueId from '@form-create/utils/lib/unique';

export default defineComponent({
  name: 'FcDesigner',
  components: {
    draggable,
    FormCreate: formCreate.$form(),
  },
  props: ['menu'],
  setup(props) {
    provide(
      'fcx',
      ref({
        active: null,
      })
    );
    const { menu } = toRefs(props);
    const data = reactive({
      cacheProps: {}, // 缓存属性
      moveRule: null,
      addRule: null,
      added: null,
      activeTab: 'form',
      activeRule: null,
      children: [],
      menuList: menu.value || createMenu(),
      showBaseRule: false,
      dragForm: {
        rule: [],
        api: {},
      },
      form: {
        rule: [],
        option: {
          form: {
            layout: 'vertical',
          },
          submitBtn: false,
        },
        value: {
          form: {
            layout: 'vertical',
          },
          submitBtn: false,
        },
      },
      baseForm: {
        rule: [],
        api: {},
        value: null,
        options: {
          form: {
            layout: 'vertical',
          },
          submitBtn: false,
          mounted: (fapi) => {
            fapi.activeRule = data.activeRule;
          },
        },
      },
      validateForm: {
        rule: [],
        api: {},
        value: null,
        options: {
          form: {
            layout: 'vertical',
          },
          submitBtn: false,
          mounted: (fapi) => {
            fapi.activeRule = data.activeRule;
          },
        },
      },
      propsForm: {
        rule: [],
        api: {},
        value: null,
        options: {
          form: {
            layout: 'vertical',
          },
          submitBtn: false,
          mounted: (fapi) => {
            fapi.activeRule = data.activeRule;
          },
        },
      },
    });

    // #region method 组件方法
    const methods = {
      getParent(rule) {
        let parent = rule.__fc__.parent.rule;
        const config = parent.config;
        if (config && config.config.inside) {
          rule = parent;
          parent = parent.__fc__.parent.rule;
        }
        return { root: parent, parent: rule };
      },
      makeDrag(group, tag, children, on) {
        return {
          type: 'DragBox',
          wrap: {
            show: false,
          },
          col: {
            show: false,
          },
          inject: true,
          props: {
            rule: {
              props: {
                group: group === true ? 'default' : group,
                ghostClass: 'ghost',
                animation: 150,
                handle: '._fc-drag-btn',
                emptyInsertThreshold: 0,
                direction: 'vertical',
                itemKey: 'type',
                modelValue: children,
              },
            },
            tag,
          },
          children,
          on,
        };
      },
      makeDragRule(children) {
        return [
          methods.makeDrag(true, 'draggable', children, {
            add: (inject, evt) => methods.dragAdd(children, evt),
            end: (inject, evt) => methods.dragEnd(children, evt),
            start: (inject, evt) => methods.dragStart(children, evt),
            unchoose: (inject, evt) => methods.dragUnchoose(children, evt),
          }),
        ];
      },
      dragAdd(children, evt) {
        const newIndex = evt.newIndex;
        const menu = evt.item._underlying_vm_;
        if (menu && menu.name) {
          const rule = methods.makeRule(ruleList[menu.name]);
          children.splice(newIndex, 0, rule);
        } else {
          if (data.addRule) {
            const rule = data.addRule.children.splice(data.addRule.oldIndex, 1);
            children.splice(newIndex, 0, rule[0]);
          }
        }
        data.added = true;
      },
      dragEnd(children, { newIndex, oldIndex }) {
        if (!data.added && !(data.moveRule === children && newIndex === oldIndex)) {
          const rule = data.moveRule.splice(oldIndex, 1);
          children.splice(newIndex, 0, rule[0]);
        }
        data.moveRule = null;
        data.addRule = null;
        data.added = false;
      },
      dragStart(children, evt) {
        data.moveRule = children;
        data.added = false;
      },
      dragUnchoose(children, evt) {
        data.addRule = {
          children,
          oldIndex: evt.oldIndex,
        };
      },
      toolActive(rule) {
        nextTick(() => {
          data.activeTab = 'props';
        });

        data.activeRule = rule;
        data.propsForm.rule = rule.config.config.props();
        // todo 以下代码为插件本地语言改造
        // if (!data.cacheProps[rule._id]) {
        //   data.cacheProps[rule._id] = rule.config.config.props(rule, { t, api: data.dragForm.api });
        // }
        // data.propsForm.rule = data.cacheProps[rule._id];

        const formData = { ...rule.props, formCreateChild: rule.children[0] };
        Object.keys(rule).forEach((k) => {
          if (['effect', 'config', 'payload', 'id', 'type'].indexOf(k) < 0)
            formData['formCreate' + upper(k)] = rule[k];
        });
        ['props', 'effect'].forEach((name) => {
          rule[name] &&
            Object.keys(rule[name]).forEach((k) => {
              formData['formCreate' + upper(name) + '>' + k] = rule[name][k];
            });
        });

        data.propsForm.value = deepCopy(formData);

        data.showBaseRule = !!rule.field;

        if (data.showBaseRule) {
          data.baseForm.value = {
            field: rule.field,
            title: rule.title,
            info: rule.info,
            _control: rule._control,
          };

          data.validateForm.value = {
            validate: rule.validate ? [...rule.validate] : [],
          };
        }
      },
      makeRule(config, _rule) {
        const rule = _rule || config.rule();
        if (rule?.config?.config) {
          config = rule.config.config;
        } else {
          rule.config = { config };
        }
        if (!rule.effect) rule.effect = {};
        rule.effect._fc = true;
        rule._fc_drag_tag = config.name;

        let drag;

        if (config.drag) {
          const children = reactive([]);
          drag = methods.makeDrag(config.drag, rule.type, children, {
            end: (inject, evt) => methods.dragEnd(children, evt),
            add: (inject, evt) => methods.dragAdd(children, evt),
            start: (inject, evt) => methods.dragStart(children, evt),
            unchoose: (inject, evt) => methods.dragUnchoose(children, evt),
          });
          rule.children.push(drag);
        }

        if (config.children && !_rule) {
          const child = methods.makeRule(ruleList[config.children], null);
          (drag || rule).children.push(child);
        }

        if (config.inside) {
          rule.children = [
            {
              type: 'DragTool',
              props: {
                dragBtn: config.dragBtn !== false,
                children: config.children,
              },
              effect: {
                _fc_tool: true,
              },
              inject: true,
              on: {
                delete: ({ self }) => {
                  methods.getParent(self).parent.__fc__.rm();
                  methods.clearActiveRule();
                },
                addComponent: ({ self }) => {
                  const top = methods.getParent(self);
                  top.root.children.splice(
                    top.root.children.indexOf(top.parent) + 1,
                    0,
                    methods.makeRule(top.parent.config.config)
                  );
                },
                addChild: ({ self }) => {
                  const top = methods.getParent(self);
                  const config = top.parent.config.config;
                  const item = ruleList[config.children];
                  if (!item) return;
                  (!config.drag ? top.parent : top.parent.children[0]).children[0].children.push(
                    methods.makeRule(item)
                  );
                },
                copy: ({ self }) => {
                  const top = methods.getParent(self),
                    copyParent = formCreate.copyRule(top.parent),
                    copyRule = methods.makeRule(top.parent.config.config);
                  methods.mergeCopyRule(copyRule, copyParent);
                  if (copyRule.slot) {
                    copyRule.slot = `slot-${uniqueId()}`;
                  }
                  top.root.children.splice(top.root.children.indexOf(top.parent) + 1, 0, copyRule);
                },
                active: ({ self }) => {
                  methods.toolActive(methods.getParent(self).parent);
                },
              },
              children: rule.children,
            },
          ];
          return rule;
        } else {
          return {
            type: 'DragTool',
            props: {
              dragBtn: config.dragBtn !== false,
              children: config.children,
            },
            effect: {
              _fc_tool: true,
            },
            inject: true,
            slot: `slot-${rule.field ? rule.field : uniqueId()}`,
            on: {
              delete: ({ self }) => {
                self.__fc__.rm();
                methods.clearActiveRule();
              },
              addComponent: ({ self }) => {
                const top = methods.getParent(self);
                top.root.children.splice(
                  top.root.children.indexOf(top.parent) + 1,
                  0,
                  methods.makeRule(self.children[0].config.config)
                );
              },
              addChild: ({ self }) => {
                const config = self.children[0].config.config;
                const item = ruleList[config.children];
                if (!item) return;
                (!config.drag ? self : self.children[0]).children[0].children.push(
                  methods.makeRule(item)
                );
              },
              copy: ({ self }) => {
                const top = methods.getParent(self),
                  copyParent = formCreate.copyRule(top.parent),
                  copyRule = methods.makeRule(self.children[0].config.config);
                if (copyRule.slot) {
                  copyRule.slot = `slot-${uniqueId()}`;
                }
                methods.mergeCopyRule(copyRule, copyParent);
                top.root.children.splice(top.root.children.indexOf(top.parent) + 1, 0, copyRule);
              },
              active: ({ self }) => {
                methods.toolActive(self.children[0]);
              },
            },
            children: [rule],
          };
        }
      },
      mergeCopyRule(copyRule, parentRule, isChildren) {
        let isTrue = false;
        if (!isTrue) {
          if (copyRule.children) {
            copyRule.children.forEach((cr, index) => {
              if (cr.type === 'DragBox') {
                isTrue = true;
                cr.children.push(...parentRule.children[index].children);
              } else {
                isTrue = methods.mergeCopyRule(cr, parentRule.children[index], true);
              }
            });
          }
        }
        if (isChildren && isTrue) {
          return true;
        } else if (!isChildren && !isTrue) {
          copyRule.children = parentRule.children;
        }
        return isTrue;
      },
      loadRule(rules) {
        const loadRuleValue = [];
        rules.forEach((rule) => {
          if (is.String(rule)) {
            return loadRuleValue.push(rule);
          }
          const config = ruleList[rule._fc_drag_tag] || ruleList[rule.type];
          const _children = rule.children;
          rule.children = [];
          if (rule.control) {
            rule._control = rule.control;
            delete rule.control;
          }
          if (config) {
            rule = methods.makeRule(config, rule);
            if (_children) {
              let children = rule.children[0].children;

              if (config.drag) {
                children = children[0].children;
              }
              children.push(...loadRule(_children));
            }
          } else if (_children) {
            rule.children = methods.loadRule(_children);
          }
          loadRuleValue.push(rule);
        });
        return loadRuleValue;
      },
      parseRule(children) {
        return [...children].reduce((initial, rule) => {
          if (is.String(rule)) {
            initial.push(rule);
            return initial;
          } else if (rule.type === 'DragBox') {
            initial.push(...parseRule(rule.children));
            return initial;
          } else if (rule.type === 'DragTool') {
            rule = rule.children[0];
            if (rule.type === 'DragBox') {
              initial.push(...parseRule(rule.children));
              return initial;
            }
          }
          if (!rule) return initial;
          rule = { ...rule };
          if (rule.children.length) {
            rule.children = methods.parseRule(rule.children);
          }

          delete rule.id;
          if (rule.config) {
            delete rule.config.config;
          }
          if (rule.effect) {
            delete rule.effect._fc;
            delete rule.effect._fc_tool;
          }
          if (rule._control) {
            rule.control = rule._control;
            delete rule._control;
          }
          Object.keys(rule)
            .filter(
              (k) =>
                (Array.isArray(rule[k]) && rule[k].length === 0) ||
                (is.Object(rule[k]) && Object.keys(rule[k]).length === 0)
            )
            .forEach((k) => {
              delete rule[k];
            });
          initial.push(rule);
          return initial;
        }, []);
      },
      baseChange(field, value, _, fapi, flag) {
        if (!flag && data.activeRule && fapi.activeRule === data.activeRule) {
          data.activeRule[field] = value;
        }
      },
      propRemoveField(field, _, fapi) {
        if (data.activeRule && fapi.activeRule === data.activeRule) {
          data.dragForm.api.sync(data.activeRule);
          if (field.indexOf('formCreate') === 0) {
            field = field.replace('formCreate', '');
            if (!field) return;
            field = lower(field);
            if (field.indexOf('effect') === 0 && field.indexOf('>') > -1) {
              delete data.activeRule.effect[field.split('>')[1]];
            } else if (field.indexOf('props') === 0 && field.indexOf('>') > -1) {
              delete data.activeRule.props[field.split('>')[1]];
            } else if (field === 'child') {
              data.activeRule.children.splice(0, 1);
            } else if (field) {
              data.activeRule[field] = undefined;
            }
          } else {
            delete data.activeRule.props[field];
          }
        }
      },
      propChange(field, value, _, fapi, flag) {
        if (!flag && data.activeRule && fapi.activeRule === data.activeRule) {
          if (field.indexOf('formCreate') === 0) {
            field = field.replace('formCreate', '');
            if (!field) return;
            field = lower(field);
            if (field.indexOf('effect') === 0 && field.indexOf('>') > -1) {
              data.activeRule.effect[field.split('>')[1]] = value;
            } else if (field.indexOf('props') === 0 && field.indexOf('>') > -1) {
              data.activeRule.props[field.split('>')[1]] = value;
            } else if (field === 'child') {
              data.activeRule.children[0] = value;
            } else {
              data.activeRule[field] = value;
            }
          } else {
            data.activeRule.props[field] = value;
          }
        }
      },
      validateChange(field, value, _, fapi, flag) {
        if (data.activeRule && fapi.activeRule === data.activeRule) {
          data.activeRule.validate = value;
        }
      },
      addMenu(config) {
        if (!config.name || !config.list) return;
        let flag = true;
        data.menuList.forEach((v, i) => {
          if (v.name === config.name) {
            v.list = [].concat(v.list, config.list);
            flag = false;
          }
        });
        if (flag) {
          data.menuList.push(config);
        }
      },
      removeMenu(name) {
        [...data.menuList].forEach((v, i) => {
          if (v.name === name) {
            data.menuList.splice(i, 1);
          }
        });
      },
      setMenuItem(name, list) {
        data.menuList.forEach((v) => {
          if (v.name === name) {
            v.list = list;
          }
        });
      },
      appendMenuItem(name, item) {
        data.menuList.forEach((v) => {
          if (v.name === name) {
            v.list.push(item);
          }
        });
      },
      removeMenuItem(item) {
        data.menuList.forEach((v) => {
          let idx;
          if (is.String(item)) {
            [...v.list].forEach((menu, idx) => {
              if (menu.name === item) {
                v.list.splice(idx, 1);
              }
            });
          } else {
            if ((idx = v.list.indexOf(item)) > -1) {
              v.list.splice(idx, 1);
            }
          }
        });
      },
      addComponent(data) {
        if (Array.isArray(data)) {
          data.forEach((v) => {
            ruleList[v.name] = v;
          });
        } else {
          ruleList[data.name] = data;
        }
      },
      getRule() {
        return methods.parseRule(deepCopy(data.dragForm.api.rule[0].children));
      },
      getJson() {
        return formCreate.toJson(getRule());
      },
      getOption() {
        const option = deepCopy(data.form.value);
        delete option.submitBtn;
        return option;
      },
      setRule(rules) {
        data.children = methods.loadRule(is.String(rules) ? formCreate.parseJson(rules) : rules);
        methods.clearActiveRule();
        data.dragForm.rule = methods.makeDragRule(data.children);
      },
      clearActiveRule() {
        data.activeRule = null;
        data.activeTab = 'form';
      },
      setOption(option) {
        const _ = option;
        _.submitBtn = false;
        delete _.resetBtn;
        data.form.value = _;
      },
    };

    // #endriong
    data.dragForm.rule = methods.makeDragRule(data.children);
    data.form.rule = form();
    data.baseForm.rule = field();
    data.validateForm.rule = validate();

    onMounted(() => {
      document.body.ondrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };
    });

    return {
      ...toRefs(data),
      ...methods,
    };
  },
});
</script>
<style>
._fc-designer {
  height: 100%;
  min-height: 500px;
  overflow: hidden;
  cursor: default;
  position: relative;
}

._fc-m .form-create ._fc-l-item {
  background: #2e73ff;
  width: 100%;
  height: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
}

._fc-l,
._fc-m,
._fc-r {
  border-top: 1px solid #ececec;
  box-sizing: border-box;
  position: relative;
}

._fc-l-group {
  padding: 0 12px;
}

._fc-l-title {
  font-weight: 600;
  font-size: 14px;
  margin: 18px 0px 5px;
}

._fc-l-item {
  display: inline-block;
  background: #fff;
  color: #000;
  min-width: 70px;
  width: 33.33%;
  height: 70px;
  line-height: 1;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

._fc-l-item i {
  font-size: 21px;
  display: inline-block;
}

._fc-l-item ._fc-l-name {
  font-size: 12px;
}

._fc-l-item ._fc-l-icon {
  padding: 10px 5px 12px;
}

._fc-l-item:hover {
  background: #2e73ff;
  color: #fff;
}

._fc-m-tools {
  height: 40px;
  align-items: center;
  display: flex;
  justify-content: flex-end;
  border: 1px solid #ececec;
  border-top: 0 none;
  background: #ffffff;
  padding: 0 20px;
}

._fc-m-tools .fc-icon {
  font-size: 14px;
  margin-right: 2px;
}

._fc-r .el-tabs__nav-wrap::after {
  height: 1px;
  background-color: #ececec;
}

._fc-r ._fc-r-tabs {
  display: flex;
  padding: 0;
  border-bottom: 1px solid #ececec;
}

._fc-r ._fc-r-tab {
  height: 40px;
  box-sizing: border-box;
  line-height: 40px;
  display: inline-block;
  list-style: none;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  position: relative;
  flex: 1;
  text-align: center;
}

._fc-r ._fc-r-tab.active {
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

.drag-box,
.ivu-col.drag-box {
  min-height: 60px;
}

._fc-m-drag {
  overflow: auto;
  padding: 2px;
  box-sizing: border-box;
}

._fc-m-drag,
.draggable-drag {
  background: #fff;
  width: 100%;
  height: 100%;
  position: relative;
}

._fc-m-drag > form,
._fc-m-drag > form > .ant-row {
  height: 100%;
}

._fc-dragBox {
  background: #f5f5f5;
  padding: 20px;
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  bottom: 0;
}

.div-tools + .div-tools {
  margin-top: 5px;
}

.ant-layout-sider-children {
  overflow: auto;
}
</style>
