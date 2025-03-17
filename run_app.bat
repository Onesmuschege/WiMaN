REM filepath: /c:/Users/chege/WiMaN/run_app.bat
@echo off
echo Activating virtual environment...
call venv\Scripts\activate

if "%VIRTUAL_ENV%"=="" (
    echo Failed to activate virtual environment.
    exit /b 1
) else (
    echo Virtual environment activated.
)

echo Running the application...
venv\Scripts\python.exe app.py
