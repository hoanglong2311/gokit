package main

import (
	_ "embed"
	"fmt"
	"os"

	"github.com/hoanglong2311/gokit/cmd/gen"
	"github.com/spf13/cobra"
)

//go:embed VERSION
var version string

func main() {
	cmd := &cobra.Command{
		Use:     "gokit",
		Short:   "A CLI tool for generating code from templates",
		Version: version,
	}

	cmd.AddCommand(gen.Cmd(version))

	if err := cmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
}
