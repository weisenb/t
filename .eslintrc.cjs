/*
 * @Author: zjh
 * @Date: 2022-11-02 14:03:04
 * @LastEditors: zjh
 * @LastEditTime: 2024-10-29 16:39:58
 * @FilePath: \vue3-my-utils\.eslintrc.cjs
 * @Description:
 */
/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "vue/multi-word-component-names": "off", // 关闭多字组件
  },
};
