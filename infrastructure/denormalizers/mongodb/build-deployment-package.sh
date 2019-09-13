DIRNAME=$(dirname $0)
# mkdir $DIRNAME/node_modules
CWD=$(pwd)
cd $DIRNAME
npm install
zip -r mongodb.zip .
rm -r ./node_modules
cd $CWD
mv $DIRNAME/mongodb.zip $CWD
