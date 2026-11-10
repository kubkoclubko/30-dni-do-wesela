#!/usr/bin/env bash
# usage (from the wesele folder):
#   bash scripts/r.sh still   ep01 <frame> [scale=0.4]   -> out/ep01_f<frame>.jpg
#   bash scripts/r.sh preview ep01 [frames=0-299]        -> out/ep01_preview.mp4 (scale 0.5)
#   bash scripts/r.sh final   ep01                       -> out/ep01.mp4 (1080x1920, h264 crf 20) + QA
# All output goes to out/<ep>_<mode>.log; only the last 20 lines are printed.
set -e
mode=$1; ep=$2; mkdir -p out
export TEMP=C:/Users/ondri/remotion-tmp TMP=C:/Users/ondri/remotion-tmp
log=out/${ep}_${mode}.log
case $mode in
  still)   npx remotion still src/index.ts $ep out/${ep}_f$3.jpg --frame=$3 --scale=${4:-0.4} --gl=angle > $log 2>&1 ;;
  preview) npx remotion render src/index.ts $ep out/${ep}_preview.mp4 --frames=${3:-0-299} --scale=0.5 --gl=angle --concurrency 2 > $log 2>&1 ;;
  final)   npx remotion render src/index.ts $ep out/$ep.mp4 --codec h264 --crf 20 --gl=angle --concurrency 2 > $log 2>&1
           python scripts/short_qa.py out/$ep.mp4 out/${ep}_qa >> $log 2>&1 ;;
  *) echo "mode: still|preview|final"; exit 1 ;;
esac
tail -20 $log
