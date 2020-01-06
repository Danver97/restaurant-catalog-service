docker run -d -p 9200:9200 -e "discovery.type=single-node" -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" --name es751 elasticsearch:7.5.1
sleep 30
npm test

docker stop es751
docker rm es751