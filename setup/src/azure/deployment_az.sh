declare -A confs
confs=(
  [__REACT_APP_MAP_SUBSCRIPTION_KEY__]="\"$REACT_APP_MAP_SUBSCRIPTION_KEY\""
  [__REACT_APP_MAP_TILESET_ID__]="\"$REACT_APP_MAP_TILESET_ID\""
  [__REACT_APP_MAP_STATESET_ID__]="\"$REACT_APP_MAP_STATESET_ID\""
  [__REACT_APP_MAP_LAT__]="\"$REACT_APP_MAP_LAT\""
  [__REACT_APP_MAP_LON__]="\"$REACT_APP_MAP_LON\""
  [__REACT_APP_IOTC_API_KEY__]="\"$REACT_APP_IOTC_API_KEY\""
  [__REACT_APP_IOTC_APP_URL__]="\"$REACT_APP_IOTC_APP_URL\""
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

# login using injected managed identity
az login --identity

# output account info
az storage account show -g "$RESOURCE_GROUP_NAME" -n "$STORAGE_ACCOUNT_NAME" > "$AZ_SCRIPTS_OUTPUT_PATH"

# use "--auth-mode key" to leverage authentication with current credentials provided by managed identity
az storage blob service-properties update --auth-mode key --account-name "$STORAGE_ACCOUNT_NAME" --static-website --404-document error.html --index-document index.html
az storage blob upload-batch --auth-mode key --account-name "$STORAGE_ACCOUNT_NAME" -d "\$web" -s build

