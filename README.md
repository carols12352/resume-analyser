# Resume Analyser

[English](README.md) | [简体中文](README_CN.md)

## Overview
Upload a PDF resume and use GPT to parse it, match jobs, and provide feedback.

## Quick Start
1. Copy `.envtemp` to `.env` and fill in `OPENAI_API_KEY` and `OPENAI_URL`.
2. Install backend dependencies and create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Running
- Start Flask backend only:
  ```bash
  python run.py
  ```
- Start backend and frontend together:
  ```bash
  python run_all.py --check-deps
  ```

The frontend runs at [http://localhost:3000](http://localhost:3000) and the backend API at [http://localhost:5000](http://localhost:5000).
