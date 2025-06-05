import subprocess
import sys
import os
import signal
import time
from pathlib import Path

def is_windows():
    return sys.platform.startswith('win')

def get_venv_python():
    return sys.executable

def get_npm():
    return 'npm.cmd' if is_windows() else 'npm'

class ProcessManager:
    def __init__(self):
        self.processes = []
        signal.signal(signal.SIGINT, self.signal_handler)
        if is_windows():
            signal.signal(signal.SIGTERM, self.signal_handler)

    def signal_handler(self, signum, frame):
        print("\n🛑 Shutting down all services...")
        self.cleanup()
        sys.exit(0)

    def cleanup(self):
        for process in self.processes:
            try:
                if is_windows():
                    subprocess.run(['taskkill', '/F', '/T', '/PID', str(process.pid)])
                else:
                    process.terminate()
                print(f"✓ Process {process.pid} terminated")
            except Exception as e:
                print(f"❌ Error terminating process: {e}")

    def print_banner(self):
        print("""
╔════════════════════════════════════════╗
║        Resume Analyzer Services        ║
╚════════════════════════════════════════╝
        """)

    def print_status(self, message, status="info"):
        symbols = {
            "info": "ℹ",
            "success": "✓",
            "error": "❌",
            "warning": "⚠",
            "loading": "⏳"
        }
        print(f"{symbols.get(status, 'ℹ')} {message}")

    def run(self, check_dependencies=False):
        self.print_banner()

        if not os.path.exists('frontend'):
            self.print_status("Frontend directory not found!", "error")
            sys.exit(1)

        if check_dependencies:
            self.print_status("Checking dependencies...", "loading")
            try:
                subprocess.run([get_npm(), 'install'], 
                             cwd='frontend', 
                             check=True, 
                             capture_output=True)
                self.print_status("Dependencies installed successfully", "success")
            except subprocess.CalledProcessError as e:
                self.print_status(f"Failed to install dependencies: {e}", "error")
                sys.exit(1)

        # 启动React前端
        self.print_status("Starting React frontend...", "loading")
        npm = get_npm()
        os.chdir('frontend')
        react_process = subprocess.Popen(
            [npm, 'start'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        self.processes.append(react_process)
        os.chdir('..')

        # 等待React启动
        time.sleep(3)
        self.print_status("React frontend is running", "success")

        # 启动Flask后端
        self.print_status("Starting Flask backend...", "loading")
        flask_env = os.environ.copy()
        flask_env['FLASK_APP'] = 'backend'
        flask_env['FLASK_ENV'] = 'development'
        
        flask_process = subprocess.Popen(
            [sys.executable, 'run.py'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            env=flask_env,

        )
        self.processes.append(flask_process)
        time.sleep(2)
        self.print_status("Flask backend is running", "success")

        print("\n" + "="*50)
        self.print_status("All services are running!", "success")
        print("""
📱 Frontend URL: http://localhost:3000
🔌 Backend API: http://localhost:5000

Press Ctrl+C to stop all services
""")
        print("="*50 + "\n")

        # 监控输出
        while True:
            try:
                # 检查进程是否还在运行
                if flask_process.poll() is not None:
                    self.print_status("Flask server stopped unexpectedly!", "error")
                    break
                if react_process.poll() is not None:
                    self.print_status("React server stopped unexpectedly!", "error")
                    break

                # 输出Flask日志
                flask_out = flask_process.stdout.readline()
                if flask_out:
                    print("[Flask]", flask_out.strip())
                
                flask_err = flask_process.stderr.readline()
                if flask_err and "WARNING" not in flask_err:
                    print("[Flask Error]", flask_err.strip())

                # 输出React日志
                react_out = react_process.stdout.readline()
                if react_out:
                    print("[React]", react_out.strip())
                
                react_err = react_process.stderr.readline()
                if react_err and "WARNING" not in react_err:
                    print("[React Error]", react_err.strip())

            except KeyboardInterrupt:
                self.print_status("\nShutting down services...", "warning")
                self.cleanup()
                break

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Run Resume Analyzer services')
    parser.add_argument('--check-deps', action='store_true', 
                      help='Check and install dependencies before starting')
    args = parser.parse_args()

    manager = ProcessManager()
    manager.run(check_dependencies=args.check_deps) 