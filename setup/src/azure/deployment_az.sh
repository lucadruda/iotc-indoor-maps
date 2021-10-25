apk update
apk add nodejs npm
npm install -g npm
git clone "$GIT_REPO"

cd ${GIT_REPO##*/}

if [[ ! -z $GIT_BRANCH ]]
then
    git checkout "$GIT_BRANCH"
fi

cd "$SITE_FOLDER"
rm package-lock.json
npm ci &> logs.txt
npm run build

az storage blob service-properties update --account-name "$STORAGE_ACCOUNT_NAME" --static-website --404-document error.html --index-document index.html
az storage blob upload-batch --account-name "$STORAGE_ACCOUNT_NAME" -d "\$web" -s build

