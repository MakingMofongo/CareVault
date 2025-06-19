@echo off
echo Compiling CareVault Thesis...

REM Check if pdflatex is available
where pdflatex >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: pdflatex not found. Please install a LaTeX distribution like MiKTeX or TeX Live.
    pause
    exit /b 1
)

REM Compile the document
echo Running pdflatex...
pdflatex -interaction=nonstopmode CareVault_Thesis.tex

REM Run bibliography if needed
if exist CareVault_Thesis.bbl (
    echo Running pdflatex again for bibliography...
    pdflatex -interaction=nonstopmode CareVault_Thesis.tex
)

REM Run one more time for cross-references
echo Final compilation for cross-references...
pdflatex -interaction=nonstopmode CareVault_Thesis.tex

echo.
echo Compilation complete! Check CareVault_Thesis.pdf for the output.
echo.
pause 