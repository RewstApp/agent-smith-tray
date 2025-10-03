; --------------------------
; Custom NSIS Macros
; --------------------------

; Runs after app files are copied
!macro customInstall
  ; Install agent smith httpd plugin
  SetDetailsPrint both
  InitPluginsDir
  CreateDirectory "$PLUGINSDIR\agent-smith-plugins"
  SetOutPath "$PLUGINSDIR\agent-smith-plugins"
  File "${BUILD_RESOURCES_DIR}\agent-smith-httpd.win.exe"
  nsExec::ExecToLog '"$PLUGINSDIR\agent-smith-plugins\agent-smith-httpd.win.exe" --install'

  ; Force start with Windows
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}" "$INSTDIR\${PRODUCT_FILENAME}.exe"
!macroend
