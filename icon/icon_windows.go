//go:build windows

package icon

import (
	_ "embed"
)

//go:embed online.ico
var Online []byte

//go:embed offline.ico
var Offline []byte
