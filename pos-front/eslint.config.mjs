import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";


export default [
    {files: ["**/*.{js,mjs,cjs,jsx}"]},
    {languageOptions: { globals: {
        ...globals.browser, 
        ...globals.node
    } }},
    {rules: {
        indent: ["error", 4], // 设置缩进为4个空格
        "react/prop-types": "off" // 关闭prop-types检查
    }},
    {ignores:[
        'node_modules',
        'build',
        'dist',
        'src/components/TestDrag',
    ]},
    {settings: {
        react: {
            version: "detect" // 自动检测 React 版本
        }
    }}, 
    pluginJs.configs.recommended,
    pluginReact.configs.flat.recommended,
];


// import globals from "globals";
// import pluginJs from "@eslint/js";
// import pluginReact from "eslint-plugin-react";

// export default [
//     {
//         ignores: [
//             'node_modules',
//             'build',
//             'dist',
//             'src/components/TestDrag',
//         ],
//         files: ["**/*.{js,mjs,cjs,jsx}"],
//         languageOptions: {
//           globals: {
//             ...globals.browser,
//             ...globals.node,
//           },
//           parser: "@babel/eslint-parser", // 使用 Babel ESLint 解析器
//           parserOptions: {
//             ecmaVersion: "latest", // 指定 ECMAScript 版本
//             sourceType: "module", // 指定 source 类型
//             ecmaFeatures: {
//               jsx: true, // 启用 JSX 支持
//             },
//           },
//         },
//         rules: {
//             indent: ["error", 4], // 设置缩进为4个空格
//             "react/jsx-indent": ["error", 4], // 设置JSX缩进为4个空格
//             "react/jsx-indent-props": ["error", 4], // 设置JSX属性缩进为4个空格
//             "react/prop-types": "off", // 关闭prop-types检查
//         },
//         settings: {
//             react: {
//                 version: "detect", // 自动检测 React 版本
//             },
//         },
//     },
//     pluginJs.configs.recommended,
//     pluginReact.configs.flat.recommended,
// ];
