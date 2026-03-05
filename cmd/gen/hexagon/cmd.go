package hexagon

import (
	"os"
	"path/filepath"

	"github.com/hoanglong2311/gokit/cmd/utils"
	"github.com/spf13/cobra"
)

func Cmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "hexagon COMPONENT_NAME",
		Short: "Generate an application folder structure that follows clean architecture",
		Args:  cobra.ExactArgs(1),
	}

	getDir := utils.SetupDirectoryFlag(cmd, "The directory to create the hexagon structure in")

	cmd.RunE = func(cmd *cobra.Command, args []string) error {
		component := args[0]
		if err := utils.ValidateComponentName(component); err != nil {
			return err
		}

		dir := getDir()

		for _, path := range []string{
			"adapter/in",
			"adapter/out",
			"application/domain/service",
			"application/port/in",
			"application/port/out",
		} {
			if err := os.MkdirAll(filepath.Join(dir, component, path), 0755); err != nil {
				return err
			}
		}

		return nil
	}

	return cmd
}
