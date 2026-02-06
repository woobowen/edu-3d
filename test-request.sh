#!/bin/bash

# Configuration
API_URL="http://localhost:3000/api/generate"
OUTPUT_DIR="./test_results"

mkdir -p "$OUTPUT_DIR"

# Function to send request and check output
run_test() {
    local test_name=$1
    local concept=$2
    local lang=$3
    local expected_keyword=$4
    
    echo "---------------------------------------------------"
    echo "Running Test: $test_name"
    echo "Concept: $concept"
    echo "Language: $lang"
    
    # Construct JSON payload
    payload=$(cat <<EOF
{
  "concept": "$concept",
  "userProfile": {
    "age": 20,
    "gender": "male",
    "programmingLanguage": "$lang",
    "studyCycle": "3h/day",
    "difficulty": "intermediate",
    "learningGoal": "Test"
  }
}
EOF
)

    echo "Sending request..."
    # Send request and save output to file (capture SSE stream)
    # Using --no-buffer to see output immediately if needed, but saving to file is better for grep
    curl -s -X POST "$API_URL" \
         -H "Content-Type: application/json" \
         -d "$payload" > "$OUTPUT_DIR/${test_name}.txt"
    
    echo "Request complete. Analyzing response..."
    
    # Check for expected keyword in the generated content
    # Note: SSE format wraps data in "data: {...}". We look for content inside.
    if grep -q "$expected_keyword" "$OUTPUT_DIR/${test_name}.txt"; then
        echo "✅ PASS: Found keyword '$expected_keyword'"
    else
        echo "❌ FAIL: Keyword '$expected_keyword' not found in response."
        # Optional: Print the first few lines of response for debugging
        head -n 5 "$OUTPUT_DIR/${test_name}.txt"
    fi
}

# Test 1: C++ (Expect Pointer visualization instruction or specific C++ syntax)
# Note: Since we mock the prompt engine output in unit tests but here we hit the real API,
# the AI might not always output exactly 'ArrowHelper' unless prompted strongly.
# However, our prompt engine adds "必须展示指针操作", so we expect "指针" or "pointer".
run_test "cpp_test" "Linked List" "C++" "指针"

# Test 2: Python (Expect Slicing or Dynamic Type)
run_test "python_test" "Array Slicing" "Python" "切片"

# Test 3: Fallback (Input 'Fortran', Expect Python behavior/defaults)
# In the log, we might not see "Fallback" unless we check server logs.
# But we can check if it behaves like Python or standard.
run_test "fallback_test" "Loop" "Fortran" "Python"

echo "---------------------------------------------------"
echo "Tests completed. Results saved in $OUTPUT_DIR"
