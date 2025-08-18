//go:build darwin

package icon

import (
	_ "embed"
)

//go:embed online.png
var Online []byte

//go:embed offline.png
var Offline []byte
