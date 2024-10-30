/**
 * 标记table单元格行和列的范围、收集列数据
 * @param rows 二维数组（标题行|合计行）
 * @return _rows: 带标记的表格数据  _cols：每一列组成的数组
 */
function getTableInfo(tableRows) {
  let _rows = JSON.parse(JSON.stringify(tableRows)); // 标记了列和行范围的二维数据
  let colsLength = _rows[0].reduce((total, cur) => total + cur.colspan, 0); // 总列数
  let colsHeight = Array.from({ length: colsLength }, () => 0); // 每列的rowspan和
  let _cols = Array.from({ length: colsLength }, () => []); // 每一列的数据

  _rows.forEach((rows, rowI) => {
    rows.forEach((item, colI) => {
      // 标记原始位置坐标（二维数组中的坐标）
      item._row = rowI;
      item._col = colI;
      // 标记格子所占行范围[_srartRow, _endRow]
      item._startRow = rowI;
      item._endRow = rowI + item.rowspan - 1;

      // 瀑布流方式找到最左最短的列（rowspan最小的列）
      let { index } = colsHeight.reduce(
        (min, col, i) => {
          return col < min.height ? { index: i, height: col } : min;
        },
        { index: 0, height: colsHeight[0] }
      );

      // colspan>1的跨列：视图上属于多个列
      let offset = item.colspan;
      while (offset > 0) {
        let _index = index + offset - 1;
        if (_index < colsLength) {
          // 单元格存入对应的列中
          _cols[_index].push({ ...item });
          colsHeight[_index] += item.rowspan;
        }
        offset--;
      }

      // 标记格子所占列范围[_startCol, _endCol]
      item._startCol = index;
      item._endCol = item._startCol + item.colspan - 1;
    });
  });
  // console.log(colsHeight)
  // console.log(_cols)
  return { _rows, _cols };
}

/**
 * 标记数据行格子的列范围
 * @param dataRows 一维数组(数据行)
 * @return _data:带标记的数据行
 */
function getTableDataInfo(dataRows) {
  let _dataRows = JSON.parse(JSON.stringify(dataRows));
  let startCol = 0;

  _dataRows.forEach((item, index) => {
    item._startCol = startCol;
    item._endCol = startCol + item.colspan - 1;
    item._col = index;

    startCol = item._endCol + 1;
  });
  return { _dataRows };
}

/**
 * 判断2个范围相交的状态 start<=end targetStart<=targetEnd
 * @param {*} start
 * @param {*} end
 * @param {*} targetStart
 * @param {*} targetEnd
 * @return false:不相交 | {}
 */
function getCellOffset(start, end, targetStart, targetEnd) {
  if (end < targetStart || start > targetEnd) {
    return false;
  }
  let result = {
    start: start === targetStart, // 起始对齐
    end: end === targetEnd, // 结束对齐
    pass: start >= targetStart && end <= targetEnd, // 目标范围完全包含待比较的范围
    common: Math.min(end, targetEnd) - Math.max(start, targetStart) + 1, // 重叠的列数
    comCol: [Math.max(start, targetStart), Math.min(end, targetEnd)], // 重叠的列范围
  };
  return result;
}

/**
 * 获取表格二维数组指定列范围相交的所有单元格
 * @param {*} rows
 * @param {*} startCol
 * @param {*} enCol
 * @return []
 */
function findCols(rows, startCol, enCol) {
  let { _rows } = getTableInfo(rows);
  let targetCells = [];
  _rows.forEach((rowData, rowIndex) => {
    let colIndex = rowData.findIndex((item) =>
      getCellOffset(item._startCol, item._endCol, startCol, enCol)
    );
    if (colIndex > -1) {
      targetCells.push(rows[rowIndex][colIndex]);
    }
  });
  return targetCells;
}

/**
 * 找到所选单元格左右可合并的单元格[同一行&colspan范围相邻列&相同rowspan]
 * @param {*} rows
 * @param {*} row
 * @param {*} col
 * @param {*} offset -1左侧 1右侧
 */
function findLeftRightCell(rows, row, col, offset) {
  let { _rows } = getTableInfo(rows);
  const curCell = _rows[row][col];
  const targetCell = _rows[row][col + offset];
  let isLeft =
    targetCell &&
    targetCell.rowspan === curCell.rowspan &&
    offset === -1 &&
    targetCell._endCol + 1 === curCell._startCol;
  let isRight =
    targetCell &&
    targetCell.rowspan === curCell.rowspan &&
    offset === 1 &&
    targetCell._startCol - 1 === curCell._endCol;
  if (isLeft || isRight) {
    return rows[row][col + offset];
  }
  return null;
}

/**
 * 找到所选单元格上下可合并的单元格[rowspan范围相邻&相同colspan]
 * @param {*} rows
 * @param {*} row
 * @param {*} col
 * @param {*} offset  -1上一行 1下一行
 */
function findTopBottomCell(rows, row, col, offset) {
  let { _rows } = getTableInfo(rows);
  const curCell = _rows[row][col];
  let targetCell = null;
  let _row = null;
  let _col = null;
  _rows.forEach((rowData, ri) => {
    rowData.forEach((item, ci) => {
      const colResult = getCellOffset(
        item._startCol,
        item._endCol,
        curCell._startCol,
        curCell._endCol
      );
      if (colResult.start && colResult.end) {
        if (offset === -1 && item._endRow + 1 === curCell._startRow) {
          targetCell = rows[ri][ci];
          _row = ri;
          _col = ci;
        } else if (offset === 1 && item._startRow - 1 === curCell._endRow) {
          targetCell = rows[ri][ci];
          _row = ri;
          _col = ci;
        }
      }
    });
  });
  return { targetCell, row: _row, col: _col };
}

/**
 * 修正每一行单元格rowspan从1开始?
 * @param {*} rows
 */
function updateRowspan(rows) {
  rows.forEach((row) => {
    if (row.length > 1) {
      const minRowspan = row.reduce(
        (min, cur) => Math.min(min, cur.rowspan),
        row[0].rowspan
      );
      const disRowspan = minRowspan - 1;
      if (disRowspan > 0) {
        row.forEach((item) => (item.rowspan -= disRowspan));
      }
    }
  });
}

export {
  getTableInfo,
  getTableDataInfo,
  getCellOffset,
  findCols,
  findLeftRightCell,
  findTopBottomCell,
  updateRowspan,
};
