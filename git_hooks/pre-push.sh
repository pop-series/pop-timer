#!/bin/bash


init() {
    VALIDATION_FAILURES=0
    TOP_LEVEL_DIR="$(git rev-parse --show-toplevel)"
    DEV_LINKS=$TOP_LEVEL_DIR/.devlinks
    RUN_CMD="npm run"
}

validate() {
    ($RUN_CMD --prefix $TOP_LEVEL_DIR check) || VALIDATION_FAILURES="$((VALIDATION_FAILURES+1))"

    ($RUN_CMD --prefix $TOP_LEVEL_DIR lint) || VALIDATION_FAILURES="$((VALIDATION_FAILURES+1))"
}


echo "executing pre-push checks"
init
validate
echo -e "\nTotal [$VALIDATION_FAILURES] validation failures were observed"
if [[ "$VALIDATION_FAILURES" -ne "0" ]]; then
  echo -e "❌ please rectify failures before proceeding ahead\n"
  exit 1
fi
echo -e "✅ all pre-push validations passed\n"
exit 0
