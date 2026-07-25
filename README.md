<p align="center">
  <img src="public/app-icon.png" alt="Deck" width="64" />
</p>

<h1 align="center">Deck</h1>

<p align="center">
  <strong>轻量级 PC 工具箱</strong> — 硬件监控 · 系统优化 · 显示增强 · 实用工具
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-2.x-blue" alt="Tauri" />
  <img src="https://img.shields.io/badge/React-19-61dafb" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Windows-10/11-0078d6" alt="Windows" />
  <img src="https://img.shields.io/github/license/Bai-un/Deck" alt="License" />
</p>

---

## 简介

Deck 是一款基于 Tauri 2 + React 19 构建的轻量级 Windows 桌面工具箱，集硬件监控、系统优化、显示增强和实用工具于一体。界面简洁、启动迅速、资源占用低。

## 功能一览

### 硬件监控
- CPU / GPU / 内存 / 磁盘实时监控
- 温度、频率、占用率实时数据流
- 支持 NVIDIA NVML 获取显卡详细数据
- 悬浮窗 & 悬浮面板两种显示模式

### 快捷启动器
- 自定义添加常用程序，自动提取程序图标
- 卡片式布局，支持拖拽排序
- 支持 UAC 提权启动和 ShellExecute 降级

### 系统优化

**清理类：**
- 内存清理（释放工作集内存）
- 存储扫描（临时文件、缓存、日志等 6 大类）
- 着色器缓存清理（NVIDIA / AMD / Intel / DirectX）

**调优类：**
- 网络优化（Nagle 算法、TCP 自调节、DNS、ECN）
- 电源管理（查看/切换/创建电源计划）
- 启动项管理（注册表启动项增删改）
- 外设优化（鼠标加速、键盘响应、USB 电源管理）

### 显示增强
- 色彩滤镜（透明覆盖窗口，多种预设）
- DLSS 预设管理（NVIDIA 注册表配置）
- 分辨率切换（枚举/切换/自定义分辨率，15 秒自动恢复）
- 覆盖面板配置

### 实用工具
- 首页仪表盘（系统概览 + 快捷入口）
- 磁盘 SMART 健康检测
- GPU 重命名（注册表 DriverDesc）
- NVIDIA 驱动信息查询与更新检测
- 20+ 内置系统工具快捷入口

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | [Tauri 2](https://tauri.app/) |
| 前端 | React 19 + TypeScript + Vite 6 |
| UI 组件 | Chakra UI 2.x（暗色主题） |
| 状态管理 | Zustand |
| 国际化 | i18next（中文 / English） |
| 图表 | recharts |
| Rust 系统库 | sysinfo, nvml-wrapper, wmi, windows-sys, winreg |
| 打包 | NSIS 安装程序 |

## 下载

前往 [Releases](https://github.com/Bai-un/Deck/releases) 页面下载最新安装包。

## 从源码构建

### 前置要求

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) 1.70+
- [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)（Windows 10/11 通常已预装）

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri dev
```

### 构建安装包

```bash
npm run tauri build
```

构建完成后，安装包位于 `src-tauri/target/release/bundle/nsis/`。

## 项目结构

```
Deck/
├── public/                    # 静态资源
├── src/
│   ├── components/            # UI 组件
│   │   ├── layout/            # TitleBar / Sidebar / AppLayout
│   │   ├── hardware/          # 硬件监控卡片
│   │   ├── launcher/          # 启动器卡片
│   │   ├── cleanup/           # 清理相关组件
│   │   ├── display/           # 显示增强组件
│   │   ├── tuning/            # 调优相关组件
│   │   └── tools/             # 工具相关组件
│   ├── hooks/                 # 自定义 Hooks
│   ├── lib/                   # Tauri API 封装
│   ├── locales/               # 国际化语言文件
│   ├── pages/                 # 页面组件
│   ├── stores/                # Zustand 状态管理
│   └── types/                 # TypeScript 类型定义
├── src-tauri/
│   ├── src/
│   │   ├── commands/          # Tauri 命令（前端可调用的函数）
│   │   ├── models/            # 数据模型
│   │   ├── services/          # 业务逻辑服务
│   │   └── utils/             # 工具函数
│   ├── icons/                 # 应用图标
│   ├── capabilities/          # Tauri 权限配置
│   └── tauri.conf.json        # Tauri 配置
└── package.json
```

## 许可证

MIT License
