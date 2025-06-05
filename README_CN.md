# Resume Analyser

[English](README.md) | [简体中文](README_CN.md)

本项目用于上传 PDF 格式的简历，并借助 GPT 解析内容、匹配职位并给出反馈。

## 快速开始
1. 复制 `.envtemp` 为 `.env`，填写 `OPENAI_API_KEY` 与 `OPENAI_URL`。
2. 安装后端依赖并创建虚拟环境：
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows 使用 venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. 安装前端依赖：
   ```bash
   cd frontend
   npm install
   ```

## 启动方式
- 仅启动 Flask 后端：
  ```bash
  python run.py
  ```
- 前后端同时启动：
  ```bash
  python run_all.py --check-deps
  ```

前端默认运行在 [http://localhost:3000](http://localhost:3000)，后端 API 默认运行在 [http://localhost:5000](http://localhost:5000)。
