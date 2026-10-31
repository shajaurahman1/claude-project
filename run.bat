@echo off
REM Build (if needed) and start FairFare.
if not exist out call build.bat
java -cp out fairfare.Main
