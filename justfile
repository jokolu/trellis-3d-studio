set shell := ["powershell", "-NoLogo", "-Command"]

default:
  just --list

dev:
  npm run dev

build:
  npm run build

preview:
  npm run preview

check:
  npm run check

lint:
  npm run check
