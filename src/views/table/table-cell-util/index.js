import {
  getTableInfo,
  getCellOffset,
  findLeftRightCell,
  findTopBottomCell,
} from "./util";

const CELL_DEFAULT_CONFIG = {
  rowspan: 1,
  colspan: 1,
  width: 100,
  height: 40,
};

class TableUtil {
  rows = [];
  static init({ rows, cols, ...rest }) {
    return Array.from({ length: rows }, () => {
      return Array.from({ length: cols }, () => ({
        ...CELL_DEFAULT_CONFIG,
        ...rest,
      }));
    });
  }
  constructor(rows) {
    this.rows = rows;
  }

  getDisabledHandles(row = -1, col = -1) {
    let disabledHandles = [];
    let curCell = this.rows[row] && this.rows[row][col];
    if (curCell) {
      // 删除行：该行rospan需小于总行数
      if (curCell.rowspan >= this.rows.lenght) {
        disabledHandles.push("delRow");
      }
      // 删除列：该列copspan需小于总列数
      const totalCols = this.rows[0].reduce(
        (total, cur) => total + cur.colspan,
        0
      );
      if (curCell.colspan >= totalCols) {
        disabledHandles.push("delCol");
      }

      // 水平拆分
      if (curCell.colspan <= 1) {
        disabledHandles.push("splitH");
      }
      // 垂直拆分
      if (curCell.rowspan <= 1) {
        disabledHandles.push("splitV");
      }

      // 向左合并：该行左边单元格与当前rowspan需相等&colsapn范围相邻
      if (!findLeftRightCell(this.rows, row, col, -1)) {
        disabledHandles.push("leftMerge");
      }
      // 向右合并
      if (!findLeftRightCell(this.rows, row, col, 1)) {
        disabledHandles.push("rightMerge");
      }
      // 向上合并
      if (!findTopBottomCell(this.rows, row, col, -1).targetCell) {
        disabledHandles.push("topMerge");
      }
      // 向下合并
      if (!findTopBottomCell(this.rows, row, col, 1).targetCell) {
        disabledHandles.push("bottomMerge");
      }
    } else {
      disabledHandles = [
        "insertRow",
        "insertCol",
        "delRow",
        "delCol",
        "splitH",
        "splitV",
        "leftMerge",
        "rightMerge",
        "topMerge",
        "bottomMerge",
      ];
    }
    return disabledHandles;
  }
  /**
   * insertRow 单元格上|下方插入行
   * @param {*} row
   * @param {*} col
   * @param {*} offset  0:上方 1：下方
   */
  insertRow(row, col, offset) {
    const { _rows } = getTableInfo(this.rows);
    const curCell = this.rows[row][col];
    // 目标行
    const targetRowIndex = offset ? row + curCell.rowspan : row; // 上方：当前row位置插入 下方：当前row位置+cur.rowspan

    // 找到目标单元格
    if (targetRowIndex < _rows.length) {
      _rows.forEach((rowData, rowIndex) => {
        if (rowIndex < targetRowIndex) {
          // 1.小于目标行的行: 找到每一行所有跨行到目标行的单元格
          rowData.forEach((item) => {
            // 注：此时无需获取具体目标单元格 let {_startRow，_endRow } = rows[targetRowIndex][props.activeCell.col]
            const _offset = getCellOffset(
              item._startRow,
              item._endRow,
              targetRowIndex,
              targetRowIndex
            );
            if (_offset) {
              // 该单元格与目标单元格rowspan范围有交叉
              // item.rowspan++
              // item.height += ?
              this.rows[item._row][item._col].rowspan++;
            }
          });
        }
      });
      // 2.目标行位置拷贝行（a.直接复制当前行；b.可以计算设置col=1，设置每列宽和该行总列?）
      const newRow = this.rows[targetRowIndex].map((item) => ({
        ...CELL_DEFAULT_CONFIG,
        width: item.width,
        colspan: item.colspan,
      }));
      this.rows.splice(targetRowIndex, 0, newRow);
    } else {
      // 最后一行向下添加: 复制最后一行数据？
      const newRow = this.rows[this.rows.length - 1].map((item) => ({
        ...CELL_DEFAULT_CONFIG,
        width: item.width,
        colspan: item.colspan,
      }));
      this.rows.splice(targetRowIndex, 0, newRow);
    }
    const resultRow = offset ? row : row + 1;

    return {
      rows: this.rows,
      row: resultRow,
      col,
      disabledHandles: this.getDisabledHandles(resultRow, col),
    };
  }

  /**
   * insertCol 单元格左侧|右侧插入列
   * @param {*} row
   * @param {*} col
   * @param {*} offset 0:左侧 1：右侧
   */
  insertCol(row, col, offset) {
    const { _rows } = getTableInfo(this.rows);
    const curCell = _rows[row][col]; // 左侧右侧插入都以当前单元格为参照

    _rows.forEach((rowData, rowIndex) => {
      if (row === rowIndex) {
        // 1.当前行: 添加一个默认配置的单元格col:1
        this.rows[rowIndex].splice(col + offset, 0, {
          ...CELL_DEFAULT_CONFIG,
          rowspan: curCell.rowspan,
        });
      } else {
        if (offset) {
          // 2.1 向右添加：其他行找到最后一个在目标范围的单元格（与目标单元格纵向有交叉的单元格,col范围有重合）
          let _index = -1;
          rowData.forEach((item, index) => {
            if (
              getCellOffset(
                item._startCol,
                item._endCol,
                curCell._startCol,
                curCell._endCol
              )
            ) {
              _index = index;
            }
          });
          if (_index > -1) {
            const cell = rowData[_index];
            const { end } = getCellOffset(
              cell._startCol,
              cell._endCol,
              curCell._startCol,
              curCell._endCol
            );
            console.log(end);
            if (end) {
              // 右侧已对齐
              this.rows[rowIndex].splice(_index + offset, 0, {
                ...CELL_DEFAULT_CONFIG,
                rowspan: cell.rowspan,
                colspan: 1,
              });
            } else {
              // 右侧大于activeCell.col: cospan++ [最后一个在目标列范围的单元格右侧一定>=activeCell.col!]
              // cell.colspan++
              // cell.width += 100
              this.rows[cell._row][cell._col].colspan++;
              this.rows[cell._row][cell._col].width += 100;
            }
          }
        } else {
          // 2.2 向左添加：其他行找到第一个在目标列范围的单元格 (与目标单元格纵向有交叉的单元格,col范围有重合)
          const _index = rowData.findIndex((item) => {
            return getCellOffset(
              item._startCol,
              item._endCol,
              curCell._startCol,
              curCell._endCol
            );
          });
          if (_index > -1) {
            const cell = rowData[_index];
            const { start } = getCellOffset(
              cell._startCol,
              cell._endCol,
              curCell._startCol,
              curCell._endCol
            );
            if (start) {
              // 左侧已对齐: 添加一个默认配置的单元格col:1
              this.rows[rowIndex].splice(_index + offset, 0, {
                ...CELL_DEFAULT_CONFIG,
                rowspan: cell.rowspan,
                colspan: 1,
              });
            } else {
              // 左侧小于activeCell.col: cospan++ [第一个在目标列范围的单元格左侧一定<=activeCell.col!]
              // cell.colspan++
              // cell.width += 100
              this.rows[cell._row][cell._col].colspan++;
              this.rows[cell._row][cell._col].width += 100;
            }
          }
        }
      }
    });
    const resultCol = offset ? col : col + 1;

    return {
      rows: this.rows,
      row,
      col: resultCol,
      disabledHandles: this.getDisabledHandles(row, resultCol),
    };
  }

  /**
   * delRow 删除单元格所在的行
   * @param {*} row
   * @param {*} col
   */
  delRow(row, col) {
    const { _rows } = getTableInfo(this.rows);
    const curCell = _rows[row][col];

    _rows.forEach((rowData, rowIndex) => {
      if (rowIndex < row) {
        // 1.1小于目标行: 找到每一行所有跨到该行的单元格
        rowData.forEach((item) => {
          const _offset = getCellOffset(
            item._startRow,
            item._endRow,
            curCell._startRow,
            curCell._endRow
          );
          if (_offset) {
            // 该单元格与所选单元格rowspan范围有交叉
            // item.rowspan--
            // item.height -= ?
            this.rows[item._row][item._col].rowspan -= _offset.common;
          }
        });
      } else if (rowIndex > row) {
        // 2.2大于目标行
        const delIndex = [];
        rowData.forEach((item, index) => {
          const _offset = getCellOffset(
            item._startRow,
            item._endRow,
            curCell._startRow,
            curCell._endRow
          );
          if (_offset) {
            delIndex.push(index);
            if (!_offset.pass) {
              // 未完全跨过删除后 下一行当前位置需要需新增未重叠部分！！！
              const nextRowAddCell = {
                ...this.rows[item._row][item._col],
                id: "",
                rowspan: item.rowspan - _offset.common,
              };
              // 找到单元格下方的单元格
              const { row: nextCellRow, col: nextCellCol } = findTopBottomCell(
                _rows,
                row,
                col,
                1
              );
              this.rows[nextCellRow].splice(nextCellCol + 1, 0, nextRowAddCell);
            }
          }
        });
        const rowNewCells = this.rows[rowIndex].filter(
          (item, index) => !delIndex.includes(index)
        );
        // 让不需要删除的单元格新组成一行 [禁止判断rowNewCells=0删除整行，改变rowindex]
        this.rows.splice(rowIndex, 1, rowNewCells);
      }
    });

    // 2.删除所选单元格的行
    // 找到单元格下方的单元格
    const { targetCell: curBottomCell, row: curCellnextCellRow } =
      findTopBottomCell(_rows, row, col, 1);
    if (curBottomCell) {
      // 当前行单元格
      _rows[row].forEach((item) => {
        // 当前行其他单元格rowspan>当前单元格: 删除该行后剩余rowspan需要填充到下一行 curCellnextCellRow
        if (item.rowspan > curCell.rowspan) {
          // 尝试寻找下一行目标位置右侧第一个[定位插入index]
          let targetCellCol = _rows[curCellnextCellRow].findIndex(
            (nextRowItem) => nextRowItem._startCol > item._endCol
          );
          if (targetCellCol === -1) {
            // 下一行目标位置左侧最后一个
            _rows[curCellnextCellRow].forEach((nextRowItem, index) => {
              if (nextRowItem._endCol < item._startCol) {
                targetCellCol = index + 1;
              }
            });
          }
          // 当前下一行插入
          this.rows[curCellnextCellRow].splice(targetCellCol, 0, {
            ...item,
            id: "",
            rowspan: item.rowspan - curCell.rowspan,
          });
        }
      });
    }
    // 删除当前行
    this.rows.splice(row, 1);
    // 统一过滤空行
    const resultRows = this.rows.filter((item) => item.length !== 0);
    this.rows.splice(0, this.rows.length, ...resultRows);

    return {
      rows: this.rows,
      row: -1,
      col: -1,
      disabledHandles: this.getDisabledHandles(-1, -1),
    };
  }

  /**
   * delCol 删除单元格所在的列
   * @param {*} row
   * @param {*} col
   */
  delCol(row, col) {
    const { _rows } = getTableInfo(this.rows);
    const curCell = _rows[row][col];

    // 删除每一行中有跨所选单元格的colspan范围
    _rows.forEach((rowData, rowIndex) => {
      const delIndex = [];
      rowData.forEach((item, index) => {
        const _offset = getCellOffset(
          item._startCol,
          item._endCol,
          curCell._startCol,
          curCell._endCol
        );
        if (_offset) {
          if (_offset.pass) {
            // 1.在范围完全跨过：需要删除
            delIndex.push(index);
          } else {
            // 2.在范围有交叉： colspan--
            // item.colspan -= _offset.common
            // TODO item.width-?
            this.rows[item._row][item._col].colspan -= _offset.common;
          }
        }
      });
      const rowNewCells = this.rows[rowIndex].filter(
        (item, index) => !delIndex.includes(index)
      );
      if (rowNewCells.length) {
        // 让不需要删除的单元格新组成一行
        if (rowIndex < this.rows.length) {
          this.rows.splice(rowIndex, 1, rowNewCells);
        } else {
          this.rows.splice(rowIndex - this.rows.length, 1, rowNewCells);
        }
      }
    });
    // 如果只有1列?
    if (this.rows.every((item) => item.length === 1)) {
      this.rows.forEach((row) => row.forEach((item) => (item.rowspan = 1)));
    }
    // 统一过滤空行
    const resultRows = this.rows.filter((item) => item.length !== 0);
    this.rows.splice(0, this.rows.length, ...resultRows);

    return {
      rows: this.rows,
      row: -1,
      col: -1,
      disabledHandles: this.getDisabledHandles(-1, -1),
    };
  }

  /**
   * splitH 水平拆分单元格(同一行)
   * @param {*} row
   * @param {*} col
   */
  splitH(row, col) {
    const { _rows, _cols } = getTableInfo(this.rows);
    const curCell = this.rows[row][col];
    const _curCell = _rows[row][col];
    if (curCell.colspan > 1) {
      // 跨列单元格拆分：只影响这一行

      // 更新当前单元格宽度和colspan
      const initColspan = _curCell.colspan;
      curCell.colspan -= Math.floor(initColspan / 2); // 尽可能平分：4=2+2 3=2+1
      let curCellStartCol = _curCell._startCol;
      const curCellEndCol = _curCell._startCol + curCell.colspan - 1;
      let curCellWidth = 0;
      while (curCellStartCol <= curCellEndCol) {
        const baseCell = _cols[curCellStartCol].find((i) => i.colspan === 1); // 找到colspan=1的单元格宽为基准 TODO: 每一列的宽度记录
        curCellWidth += baseCell.width;
        curCellStartCol++;
      }
      curCell.width = curCellWidth;

      // 右侧新增单元格
      const addCellColspan = initColspan - curCell.colspan;
      let addCellStartCol = curCellEndCol + 1;
      const addCellEndCol = addCellStartCol + addCellColspan - 1;
      let addCellWidth = 0;
      while (addCellStartCol <= addCellEndCol) {
        const baseCell = _cols[addCellStartCol].find((i) => i.colspan === 1);
        addCellWidth += baseCell.width;
        addCellStartCol++;
      }

      this.rows[row].splice(col + 1, 0, {
        ...CELL_DEFAULT_CONFIG,
        width: addCellWidth,
        colspan: addCellColspan,
        rowspan: curCell.rowspan,
      });
    } else {
      // 非跨列（colsspan=1）单元格拆分：影响这一列
      _rows.forEach((rowData, rowIndex) => {
        if (rowIndex === row) {
          // 当前行当前列向右加1列
          curCell.width /= 2;
          this.rows[row].splice(col + 1, 0, {
            ...CELL_DEFAULT_CONFIG,
            width: curCell.width,
            rowspan: curCell.rowspan,
          });
        } else {
          // 找到每一行的列范围在在当前(一行只有一个)
          const _colIndex = rowData.findIndex((item) =>
            getCellOffset(
              item._startCol,
              item._endCol,
              _curCell._startCol,
              _curCell._endCol
            )
          );
          this.rows[rowIndex][_colIndex].colspan += 1;
        }
      });
    }

    return {
      rows: this.rows,
      row,
      col,
      disabledHandles: this.getDisabledHandles(row, col),
    };
  }

  /**
   * splitV 垂直拆分单元格(同一列)
   * @param {*} row
   * @param {*} col
   */
  splitV(row, col) {
    let curCell = this.rows[row][col];
    if (curCell.rowspan > 1) {
      // 跨行单元格拆分
      const { _rows } = getTableInfo(this.rows);
      const targetCellrow = row + curCell.rowspan - 1; // 待加入的目标行index
      curCell.rowspan -= 1; // 当前单元格
      curCell = _rows[row][col]; // 有范围的当前单元格
      // 尝试寻找下一行目标位置右侧第一个[定位插入index]
      let targetCellCol = _rows[targetCellrow].findIndex(
        (item) => item._startCol > curCell._endCol
      );
      if (targetCellCol === -1) {
        // 下一行目标位置左侧最后一个
        _rows[targetCellrow].forEach((item, index) => {
          if (item._endCol < curCell._startCol) {
            targetCellCol = index;
          }
        });
        // 右侧无，可push
        this.rows[targetCellrow].splice(targetCellCol + 1, 0, {
          ...CELL_DEFAULT_CONFIG,
          colspan: curCell.colspan,
          width: curCell.width,
        });
      } else {
        this.rows[targetCellrow].splice(targetCellCol, 0, {
          ...CELL_DEFAULT_CONFIG,
          colspan: curCell.colspan,
          rowspan: 1,
          width: curCell.width,
        });
      }
    } else {
      // 非跨行单元格拆分
      let { _rows } = getTableInfo(this.rows);
      let _curCell = _rows[row][col];
      // 当前列当前行向下加1行
      curCell.height /= 2;
      this.rows.splice(
        row + 1,
        0,
        Array.from({ length: 1 }, () => ({
          ...CELL_DEFAULT_CONFIG,
          colspan: curCell.colspan,
          width: curCell.width,
          height: curCell.height,
        }))
      );
      // 其他列入侵到当前行rowspan++
      _rows.forEach((item, rowIndex) => {
        item.forEach((i, colIndex) => {
          if (rowIndex !== row || colIndex !== col) {
            let offset = getCellOffset(
              i._startRow,
              i._endRow,
              _curCell._startRow,
              _curCell._endRow
            );
            if (offset) {
              this.rows[i._row][i._col].rowspan++;
            }
          }
        });
      });
    }

    return {
      rows: this.rows,
      row,
      col,
      disabledHandles: this.getDisabledHandles(row, col),
    };
  }

  /**
   * leftMerge 向左合并单元格
   * @param {*} row
   * @param {*} col
   */
  leftMerge(row, col) {
    const leftCell = findLeftRightCell(this.rows, row, col, -1);

    if (leftCell) {
      const curCell = this.rows[row][col];
      // 设置左边单元格colspan、width
      leftCell.colspan += curCell.colspan;
      leftCell.width += curCell.width;
      // 删除当前单元格
      this.rows[row].splice(col, 1);

      return {
        rows: this.rows,
        row,
        col: col - 1,
        disabledHandles: this.getDisabledHandles(row, col - 1),
      };
    }
  }

  /**
   *  rightMerge 向右合并单元格
   * @param {*} row
   * @param {*} col
   */
  rightMerge(row, col) {
    const rightCell = findLeftRightCell(this.rows, row, col, 1);

    if (rightCell) {
      const curCell = this.rows[row][col];
      // 设置当前单元格colspan
      curCell.colspan += rightCell.colspan;
      curCell.width += rightCell.width;
      // 删除右边单元格
      this.rows[row].splice(col + 1, 1);

      return {
        rows: this.rows,
        row,
        col,
        disabledHandles: this.getDisabledHandles(row, col),
      };
    }
  }

  /**
   * topMerge 向上合并单元格
   * @param {*} row
   * @param {*} col
   */
  topMerge(row, col) {
    const {
      targetCell: topCell,
      row: _row,
      col: _col,
    } = findTopBottomCell(this.rows, row, col, -1);
    if (topCell) {
      if (this.rows[row].length === 1) {
        // 删除整行
        // rows.splice(props.activeCell.row, 1)
        this.delRow(this.rows, row, col);
      } else {
        // 设置当上边单元格rowspan
        const curCell = this.rows[row][col];
        topCell.rowspan += curCell.rowspan;
        // 删除当前单元格
        this.rows[row].splice(col, 1);
      }

      return {
        rows: this.rows,
        row: _row,
        col: _col,
        disabledHandles: this.getDisabledHandles(_row, _col),
      };
    }
  }

  /**
   * bottomMerge 向下合并单元格
   * @param {*} row
   * @param {*} col
   */
  bottomMerge(row, col) {
    const {
      targetCell: bottomCell,
      row: _row,
      col: _col,
    } = findTopBottomCell(this.rows, row, col, 1);
    if (bottomCell) {
      if (this.rows[_row].length === 1) {
        // 删除下一行
        // rows.splice(_row, 1)
        this.delRow(_row, _col);
      } else {
        const curCell = this.rows[row][col];
        // 设置当前单元格rowspan
        curCell.rowspan += bottomCell.rowspan;
        // 删除下方单元格
        this.rows[_row].splice(_col, 1);
      }

      return {
        rows: this.rows,
        row,
        col,
        disabledHandles: this.getDisabledHandles(row, col),
      };
    }
  }
}

export default TableUtil;
