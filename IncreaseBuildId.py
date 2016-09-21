#!/usr/bin/python2
import sys
import json
import subprocess


versionConfig = './version.json'
gitBranch = 'master'

# read version config file
with open(versionConfig, 'r') as f:
	version = json.load(f)
	print version

if version['id']:
	currentId = str(int(version['id']) + 1)
	tagName = version['number'] + "-" + currentId
	commitComment = "current build tag is " + tagName
	print commitComment

	# tag or re-tag current build number and push to git server
	isTagExist = subprocess.check_output(["git", "tag", "-l", tagName])
	if isTagExist:
		subprocess.call(["git", "tag", "-d", tagName])
		subprocess.call(["git", "push", "--delete", "origin", tagName])
	subprocess.call(["git", "tag", "-a", tagName, "-m", "AM Browser tagName"])
	
	# checkout branch and modify version config file
	subprocess.call(["git", "checkout", gitBranch])
	with open(versionConfig, 'w') as f:
		json.dump({"number":version['number'], "id":currentId}, f)
	subprocess.call(["git", "add", versionConfig])
	subprocess.call(["git", "commit", "-m", commitComment])
	subprocess.call(["git", "push", "--tags"])
else:
	print "can not fetch version id, exit"
	sys.exit(1)
