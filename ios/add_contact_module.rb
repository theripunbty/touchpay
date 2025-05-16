#!/usr/bin/env ruby
require 'xcodeproj'

# Path to your .xcodeproj file
project_path = 'client.xcodeproj'

# Open the Xcode project
project = Xcodeproj::Project.open(project_path)

# Get the main target
target = project.targets.first

# Files to add
files_to_add = ['ContactModule.h', 'ContactModule.m']

# Create a group for the files if it doesn't exist
main_group = project.main_group
files_group = main_group.find_subpath('client')

# Get file references
file_refs = files_to_add.map do |file_name|
  # Check if the file is already in the project
  existing_ref = main_group.files.find { |f| f.path == file_name }
  next existing_ref if existing_ref

  # If not, create a new reference
  file_ref = main_group.new_file(file_name)
  
  # Add to build phase if it's a .m file
  if file_name.end_with?('.m')
    target.add_file_references([file_ref])
  end
  
  file_ref
end

# Save the project
project.save

puts "Added ContactModule files to Xcode project" 