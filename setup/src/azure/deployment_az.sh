declare -A confs
confs=(
  [__REACT_APP_MAP_SUBSCRIPTION_KEY__]="\"$REACT_APP_MAP_SUBSCRIPTION_KEY\""
  [__REACT_APP_MAP_TILESET_ID__]="\"$REACT_APP_MAP_TILESET_ID\""
  [__REACT_APP_MAP_STATESET_ID__]="\"$REACT_APP_MAP_STATESET_ID\""
  [__REACT_APP_IOTC_API_KEY__]="\"$REACT_APP_IOTC_API_KEY\""
  [__REACT_APP_IOTC_APP_SUBDOMAIN__]="\"$REACT_APP_IOTC_APP_SUBDOMAIN\""
)

configurer() {
  # Loop through the conf array
  cp "$1" "$1.bak"
  for i in "${!confs[@]}"
  do
    search=$i
    replace=${confs[$i]}

    sed -i "s/${search}/${replace}/g" "$1"
  done
}

cd /tmp
git clone "$GIT_REPO"

cd ${GIT_REPO##*/}

if [[ ! -z $GIT_BRANCH ]]
then
    git checkout "$GIT_BRANCH"
fi

cd "$SITE_FOLDER"
configurer build/index.html

az login --identity
az storage account show -r "$RESOURCE_GROUP_NAME" -n "$STORAGE_ACCOUNT_NAME" > "$AZ_SCRIPTS_OUTPUT_PATH"
az storage blob service-properties update --account-name "$STORAGE_ACCOUNT_NAME" --static-website --404-document error.html --index-document index.html
az storage blob upload-batch --account-name "$STORAGE_ACCOUNT_NAME" -d "\$web" -s build

