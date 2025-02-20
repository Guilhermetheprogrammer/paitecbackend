yarn lint-staged
yarn ts:check

output=$(yarn dead:code)
if echo "$output" | grep -q "src/"; then
  echo "🚧 Code not used detected. Please verify:"
  echo "$output" | grep "src/"
  echo ""
fi