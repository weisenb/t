interface cell {
  rowspan: number;
  colspan: number;
  width: number;
  height: number;
}

interface createTableOption {
  rows: number;
  cols: number;
  width?: number;
  height?: number;
}

interface handleRes {
  rows: cell[][];
  row: number;
  col: number;
  disabledHandles: string[];
}

declare class TableUtil {
  rows: cell[][];
  constructor(rows: cell[][]);
  static init(option: createTableOption): cell[][];
  getDisabledHandles(row?: number, col?: number): string[];
  insertCol(row: number, col: number, offset: number): handleRes;
  insertRow(row: number, col: number, offset: number): handleRes;
  delRow(row: number, col: number): handleRes;
  delCol(row: number, col: number): handleRes;
  splitH(row: number, col: number): handleRes;
  splitV(row: number, col: number): handleRes;
  leftMerge(row: number, col: number): handleRes | void;
  rightMerge(row: number, col: number): handleRes | void;
  topMerge(row: number, col: number): handleRes | void;
  bottomMerge(row: number, col: number): handleRes | void;
}

export default TableUtil;
