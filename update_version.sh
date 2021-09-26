#!/bin/sh

# This script updates the version number accross the different files of the project

shopt -s lastpipe
cat app.json | grep version | sed 's/\"version\"\: \"\([0-9\.]*\)\",/\1/g' | read version

cat ios/bdovore.xcodeproj/project.pbxproj | grep CURRENT_PROJECT_VERSION | sed 's/CURRENT\_PROJECT\_VERSION = \([0-9]*\);/\1/g' | read projectVersion

echo Current version: $version

echo Enter the new version number:
read version

echo $version | sed 's/\.//g' | read versionCode
((projectVersion+=1))

sed -i "s/\"version\"\: \"[0-9\.]*\"/\"version\": \"$version\"/g" app.json
sed -i "s/\"version\"\: \"[0-9\.]*\"/\"version\": \"$version\"/g" package.json

sed -i "s/        versionCode [0-9]*/        versionCode $versionCode/g" android/app/build.gradle
sed -i "s/        versionName \"[0-9\.]*\"/        versionName \"$version\"/g" android/app/build.gradle

sed -i "s/CURRENT_PROJECT_VERSION = [0-9]*/CURRENT_PROJECT_VERSION = $projectVersion/g" ios/bdovore.xcodeproj/project.pbxproj
sed -i "s/MARKETING_VERSION = [0-9\.]*/MARKETING_VERSION = $version/g" ios/bdovore.xcodeproj/project.pbxproj

sed -i "s/bdovore-v[0-9\.]*-/bdovore-v$version-/g" android/make.bat

echo New version: $version
echo New versionCode: $versionCode
echo New projectVersion: $projectVersion
echo Done.
