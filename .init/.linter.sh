#!/bin/bash
cd /tmp/kavia/workspace/code-generation/web-tic-tac-toe-arena-dec15a1f/tic_tac_toe_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

