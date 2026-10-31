#!/bin/sh
# Compile FairFare (Linux / macOS). Needs JDK 11 or newer.
set -e
rm -rf out
javac -d out $(find src test -name "*.java")
echo "Build OK. Run with: ./run.sh"
