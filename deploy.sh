#!/bin/bash
set -e # exit with nonzero exit code if anything fails

mkdir -p "gh-pages"
cp -a "src/." "gh-pages/"
cd "gh-pages"

mv script.js tmp-script.js
mv style.css tmp-style.css

yui-compressor --type js tmp-script.js -o script.js 
yui-compressor --type css tmp-style.css -o style.css

git init
git config user.name "Travis CI"
git config user.email "none@none.no"
git add .
git commit -m "Deploy to GitHub Pages"
git push --quiet --force "https://djeffou:${GH_TOKEN}@github.com/djeffou/SuuntoGhostRunner.git" "master:gh-pages" > /dev/null