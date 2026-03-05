package hexagon

import (
	"os"
	"path/filepath"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("hexagon command", func() {
	It("creates a hexagonal architecture folder structure", func() {
		dir, err := os.MkdirTemp("", "")
		Expect(err).ToNot(HaveOccurred())
		defer os.RemoveAll(dir)

		cmd := Cmd()
		cmd.SetArgs([]string{"server", "--dir", dir})
		Expect(cmd.Execute()).To(Succeed())

		Expect(filepath.Join(dir, "server/adapter/in")).To(BeADirectory())
		Expect(filepath.Join(dir, "server/adapter/out")).To(BeADirectory())
		Expect(filepath.Join(dir, "server/application/domain/service")).To(BeADirectory())
		Expect(filepath.Join(dir, "server/application/port/in")).To(BeADirectory())
		Expect(filepath.Join(dir, "server/application/port/out")).To(BeADirectory())
	})
})
