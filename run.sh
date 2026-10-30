#!/bin/sh
# Build (if needed) and start FairFare.
[ -d out ] || ./build.sh
java -cp out fairfare.Main
