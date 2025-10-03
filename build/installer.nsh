!macro customInstall
  ; Install agent smith httpd plugin
  SetDetailsPrint both
  InitPluginsDir
  CreateDirectory "$PLUGINSDIR\agent-smith-plugins"
  SetOutPath "$PLUGINSDIR\agent-smith-plugins"
  File "${BUILD_RESOURCES_DIR}\agent-smith-httpd.win.exe"
  nsExec::ExecToLog '"$PLUGINSDIR\agent-smith-plugins\agent-smith-httpd.win.exe" --install'

  ; Force start with Windows
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}" "$INSTDIR\${PRODUCT_FILENAME}.exe"
!macroend

!macro customUnInstall
  ; Remove auto start registry key
  DeleteRegValue HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}"
!macroend