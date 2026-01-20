@echo off
REM DevMaker wrapper for Windows
powershell -ExecutionPolicy Bypass -File "%~dp0dev-maker.ps1" %*
