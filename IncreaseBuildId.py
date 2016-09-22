#!/usr/bin/python2
import sys
import json
import subprocess


versionConfig = './version.json'
gitBranch = 'master'

print "--------------read version config file--------------"
with open(versionConfig, 'r') as f1:
	version = json.load(f1)
	print "--------------last build id is " +  version['id'] + "--------------"

if version['id']:
	currentId = str(int(version['id']) + 1)
	tagName = version['number'] + "-" + currentId
	commitComment = "[Auto build]:current build id is " + tagName
	print "--------------" + commitComment + "--------------"

	# tag or re-tag current build number
	isTagExist = subprocess.check_output(["git", "tag", "-l", tagName])
	if isTagExist:
		subprocess.call(["git", "tag", "-d", tagName])
		subprocess.call(["git", "push", "--delete", "origin", tagName])
	subprocess.call(["git", "tag", "-a", tagName, "-m", "AM Browser"])
	
	# checkout branch and modify version config file
	subprocess.call(["git", "checkout", gitBranch])
	with open(versionConfig, 'w') as f2:
		json.dump({"number":version['number'], "id":currentId}, f2)
	subprocess.call(["git", "add", versionConfig])
	subprocess.call(["git", "commit", "-m", commitComment])
	subprocess.call(["git", "push", "origin", gitBranch, tagName])
else:
	print "-------------can not fetch version id, exit--------------"
	sys.exit(1)