<!--
 * @Author: zjh
 * @Date: 2023-07-04 15:20:04
 * @LastEditors: zjh
 * @LastEditTime: 2024-10-29 17:26:42
 * @FilePath: \vue3-my-utils\src\views\table\MergeTable.vue
 * @Description: 
-->
<template>
  <div class="wrap">
    <div class="btns">
      <div v-for="btn in btns" :key="btn.handle" :class="{
        btn,
        disable: disabledHandles.includes(btn.disHandle),
      }" @click="handleFn(btn)">
        {{ btn.name }}
      </div>
    </div>
    <table class="table">
      <tr v-for="(row, rowIndex) in tableRows" :key="rowIndex">
        <td v-for="(td, colIndex) in row" :key="colIndex" :style="getCellStyle(td)"
          :class="getCellClass(rowIndex, colIndex)" @click="handleSelectCell(rowIndex, colIndex)" :rowspan="td.rowspan"
          :colspan="td.colspan"></td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import TableUtil from "./table-cell-util";
import type TableUtilClass from "./table-cell-util";

let tableRows = ref(TableUtil.init({ rows: 4, cols: 4 }));
let table = new TableUtil(tableRows.value);
let disabledHandles = ref(table.getDisabledHandles());

const getCellStyle = (cell: any) => {
  return {
    width: `${cell.width}px`,
    height: `${cell.height}px`,
    lineHieght: `${cell.height}px`,
    border: "1px solid black",
  };
};
let selectCell = reactive({
  row: -1,
  col: -1,
});
type BtnItem = {
  name: string;
  handle: string;
  disHandle: string;
};
const btns = [
  { name: "向上添加行", handle: "addTopRow", disHandle: "insertRow" },
  { name: "向下添加行", handle: "addBottomRow", disHandle: "insertRow" },
  { name: "向左添加列", handle: "addLeftCol", disHandle: "insertCol" },
  { name: "向右添加列", handle: "addRightCol", disHandle: "insertCol" },
  { name: "删除行", handle: "delRow", disHandle: "delRow" },
  { name: "删除列", handle: "delCol", disHandle: "delCol" },
  { name: "水平拆分", handle: "splitH", disHandle: "splitH" },
  { name: "垂直拆分", handle: "splitV", disHandle: "splitV" },
  { name: "向左合并", handle: "leftMerge", disHandle: "leftMerge" },
  { name: "向右合并", handle: "rightMerge", disHandle: "rightMerge" },
  { name: "向上合并", handle: "topMerge", disHandle: "topMerge" },
  { name: "向下合并", handle: "bottomMerge", disHandle: "bottomMerge" },
];

const getCellClass = (row: any, col: any) => {
  if (row === selectCell.row && col === selectCell.col) {
    return "cell active";
  }
  return "cell";
};
const handleSelectCell = (row: any, col: any) => {
  Object.assign(selectCell, { row, col });
  console.log(selectCell);
  disabledHandles.value = table.getDisabledHandles(
    selectCell.row,
    selectCell.col
  );
};

const handleFn = (btn: BtnItem) => {
  if (selectCell.row > -1 && selectCell.col > -1) {
    switch (btn.handle) {
      case "addTopRow": {
        let res = table.insertRow(selectCell.row, selectCell.col, 0);
        handleSelectCell(res.row, res.col);
        break;
      }
      case "addBottomRow": {
        let res = table.insertRow(selectCell.row, selectCell.col, 1);
        handleSelectCell(res.row, res.col);
        break;
      }

      case "addLeftCol": {
        let res = table.insertCol(selectCell.row, selectCell.col, 0);
        handleSelectCell(res.row, res.col);
        break;
      }
      case "addRightCol": {
        let res = table.insertCol(selectCell.row, selectCell.col, 1);
        handleSelectCell(res.row, res.col);
        break;
      }
      default: {
        let handle = btn.handle as keyof TableUtilClass;
        let fn = (table[handle] as Function).bind(table);
        if (fn) {
          let res = fn(selectCell.row, selectCell.col);
          if (res) {
            handleSelectCell(res.row, res.col);
          }
        }
      }
    }
  }
};
</script>

<style scoped>
.wrap {
  display: flex;
  align-items: start;
}

.btns {
  margin-right: 20px;
}

.btn {
  margin-bottom: 10px;
  width: 100px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  color: #fff;
  background: #6363f5;
  cursor: pointer;

}
.btn.disable {
  background: #9696ab;
  cursor: not-allowed;
}

.table {
  border-collapse: collapse;
}

.cell {
  margin: 0;
  padding: 0;
}

.cell.active {
  background: #6363f5;
}
</style>
