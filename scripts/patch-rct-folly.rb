#!/usr/bin/env ruby

# Script to patch RCT-Folly Time.h typedef redefinition error
# This fixes the conflict between RCT-Folly's clockid_t definition and iOS 15.1+ SDK

puts "\n🔧 [RCT-Folly Patch] Starting Time.h patch script..."

# Find the iOS Pods directory
pods_dir = File.join(__dir__, '..', 'ios', 'Pods')

unless Dir.exist?(pods_dir)
  puts "⚠️  [RCT-Folly Patch] Pods directory not found at: #{pods_dir}"
  exit 0
end

puts "🔍 [RCT-Folly Patch] Searching in: #{pods_dir}"

# Find all possible Time.h files under Pods (covers different RN/Folly layouts)
time_headers = Dir.glob(File.join(pods_dir, '**', 'folly', '**', 'Time.h'))

if time_headers.empty?
  puts "⚠️  [RCT-Folly Patch] No Time.h files found under: #{pods_dir}"
  exit 0
end

patched_any = false

time_headers.each do |time_h_path|
  puts "🔎 [RCT-Folly Patch] Inspecting: #{time_h_path}"
  content = File.read(time_h_path)
  original_content = content.dup

  # 1) Aggressively bump any __IPHONE_X_Y macros in this header to __IPHONE_15_1
  #    This keeps Folly from defining its own clockid_t on newer SDKs
  if content.include?('__IPHONE_')
    content.gsub!(/__IPHONE_\d+_\d+/, '__IPHONE_15_1')
  end

  # 2) Comment-out any explicit clockid_t typedef/using lines to avoid redefinition.
  #    Safe because our deployment target is iOS 15.1, where clockid_t exists.
  typedef_patterns = [
    /^\s*typedef\s+uint8_t\s+clockid_t\s*;\s*$/,
    /^\s*using\s+clockid_t\s*=\s*unsigned\s+char\s*;\s*$/,
    /^\s*using\s+clockid_t\s*=\s*uint8_t\s*;\s*$/
  ]

  typedef_patterns.each do |pat|
    content.gsub!(pat) do |line|
      "#if 0 /* Lumbus patch: avoid typedef redefinition on iOS 15.1+ */\n#{line}\n#endif"
    end
  end

  if content != original_content
    File.write(time_h_path, content)
    patched_any = true
    puts "✅ [RCT-Folly Patch] Patched: #{time_h_path}"
  else
    puts "ℹ️  [RCT-Folly Patch] No changes needed in: #{time_h_path}"
  end
end

if patched_any
  puts "✅ [RCT-Folly Patch] Completed updates to Time.h headers."
else
  puts "ℹ️  [RCT-Folly Patch] No Time.h updates were required."
end

puts "\n✅ [RCT-Folly Patch] Patch script completed\n"

