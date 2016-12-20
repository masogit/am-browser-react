groupId=com.hpe.itsma.am
artifactId=am-browser
repositoryId=itsma-deploy
version=$(cat version.json | grep "number" | awk '{print $2}')
version=${version#*\"}
version=${version%\",}
echo version is $version
filename="am-browser-"$version".tar.gz"
echo deploy $package

mvn deploy:deploy-file -DgroupId=$groupId \
						-DartifactId=$artifactId \
                        -Dversion=$version-SNAPSHOT\
                        -Dpackaging=tar \
                        -Dfile="./gen/$filename" \
                        -DrepositoryId=$repositoryId \
                        -Durl='http://shc-nexus-repo.hpeswlab.net:8080/repository/itsma-snapshots/'