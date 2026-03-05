package main

import (
	_ "embed"
	"fmt"
	"os"
	"strings"

	"github.com/hoanglong2311/gokit/cmd/gen"
	"github.com/spf13/cobra"
)

//go:embed VERSION
var version string

func main() {
	cmd := &cobra.Command{
		Use:     "gokit",
		Short:   "A CLI tool for generating code from templates",
		Version: strings.TrimSpace(version),
	}

	cmd.AddCommand(gen.Cmd(strings.TrimSpace(version)))

	if err := cmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
}
