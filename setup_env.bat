@echo off
REM filepath: /c:/Users/chege/WiMaN/setup_env.bat

echo Checking if virtual environment exists...
IF EXIST venv (
    echo Virtual environment already exists. Skipping creation.
) ELSE (
    echo Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo Failed to create virtual environment.
        exit /b 1
    )
)

echo Activating virtual environment...
call venv\Scripts\activate

if "%VIRTUAL_ENV%"=="" (
    echo Failed to activate virtual environment.
    exit /b 1
) else (
    echo Virtual environment activated.
)

echo Ensuring pip is installed...
venv\Scripts\python.exe -m ensurepip --upgrade

if %errorlevel% neq 0 (
    echo Failed to install pip.
    exit /b 1
)

echo Upgrading pip...
venv\Scripts\python.exe -m pip install --upgrade pip

if %errorlevel% neq 0 (
    echo Failed to upgrade pip.
    exit /b 1
)

echo Installing required packages...
venv\Scripts\python.exe -m pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo Failed to install required packages.
    exit /b 1
)

echo Setup complete. Virtual environment is ready.

echo Running the application...
venv\Scripts\python.exe app.py
