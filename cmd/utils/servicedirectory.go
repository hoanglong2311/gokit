package utils

import (
	"os"

	"github.com/spf13/cobra"
)

func SetupServiceDirectoryFlag() func(cmd *cobra.Command) func() string {
	return nil
}

func SetupDirectoryFlag(cmd *cobra.Command, description string) func() string {
	cmd.Flags().String("dir", "", description)
	return func() string {
		dir, err := cmd.Flags().GetString("dir")
		if err != nil {
			panic(err)
		}
		if dir == "" {
			dir, err = os.Getwd()
			if err != nil {
				panic(err)
			}
		}
		return dir
	}
}
