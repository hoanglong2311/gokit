package gen

import (
	"github.com/hoanglong2311/gokit/cmd/gen/hexagon"
	"github.com/spf13/cobra"
)

func Cmd(version string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "gen",
		Short: "Generate code from templates",
	}

	cmd.AddCommand(hexagon.Cmd())

	return cmd
}
