<template>
  <div class="_fc_table_opt">
    <a-table
      :data-source="modelValue"
      bordered
      size="small"
      :pagination="false"
      style="width: 100%"
    >
      <template v-for="(col, idx) in column" :key="col.label + idx">
        <a-table-column :title="col.label" data-index="dataIndex">
          <template #default="{ record }">
            <a-form-item>
              <a-input
                size="small"
                v-bind:value="record[col.key]"
                @Update:value="(n) => ((record[col.key] = n), onInput(record))"
              ></a-input
            ></a-form-item>
          </template>
        </a-table-column>
      </template>
      <a-table-column minWidth="50" align="center" fixed="right" title="操作">
        <template #default="{ record }">
          <i class="fc-icon icon-delete" @click="del(record.$index)"></i>
        </template>
      </a-table-column>
    </a-table>
    <a-button type="link" @click="add"> <i class="fc-icon icon-add"></i> 添加 </a-button>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TableOptions',
  inheritAttrs: false,
  props: {
    modelValue: [Object, Array, String],
  },
  data() {
    return {
      column: [
        { label: 'label', key: 'label' },
        { label: 'value', key: 'value' },
      ],
    };
  },
  created() {
    if (!Array.isArray(this.modelValue)) {
      this.$emit('input', []);
    }
  },
  methods: {
    handleModelValue(n, record) {
      record[col.key] = n;
      onInput(record);
      console.log(n, record);
    },
    onInput(item) {
      if (item.label && item.value) {
        this.input();
      }
    },
    input() {
      // 更新表单中的数据
      this.$emit('update:modelValue', this.modelValue);
    },
    add() {
      this.modelValue.push(
        this.column.reduce((initial, v) => {
          initial[v.key] = '';
          return initial;
        }, {})
      );
    },
    del(idx) {
      this.modelValue.splice(idx, 1);
      this.input(this.modelValue);
    },
  },
});
</script>

<style scoped>
._fc_table_opt {
  width: 100%;
}
</style>
