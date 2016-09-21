#! /usr/bin/python2
import json
import subprocess


versionConfig = './version.json'

# read version config file, +1 , write back
with open(versionConfig, 'r') as f:
	version = json.load(f)
	print version
	currentId = str(int(version['id']) + 1)
if currentId:
	with open(versionConfig, 'w') as f:
		json.dump({"number":version['number'], "id":currentId}, f)
tagName = version['number'] + "-" + currentId
print "current build tag is " + tagName
subprocess.call(["git", "commit", "-a", "-m", tagName]) 

# tag or re-tag current build number 
isTagExist = subprocess.check_output(["git", "tag", "-l", tagName])
if isTagExist:
	subprocess.call(["git", "tag", "-d", tagName])
	subprocess.call(["git", "push", "--delete", "origin", tagName])
subprocess.call(["git", "tag", "-a", tagName, "-m", "AM Browser tagName"])
subprocess.call(["git", "push"]) 
subprocess.call(["git", "push", "origin", tagName])