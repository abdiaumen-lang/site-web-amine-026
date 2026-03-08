#!/bin/bash
find src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i '' 's/const { data: { user } } = await supabase.auth.getUser();/const { data, error: authError } = await supabase.auth.getUser();\n            const user = data?.user;/g' {} +
find src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i '' 's/const { data: { user }, error } = await supabase.auth.getUser();/const { data, error } = await supabase.auth.getUser();\n    const user = data?.user;/g' {} +
