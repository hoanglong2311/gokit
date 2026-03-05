package utils

import (
	"fmt"
	"regexp"
)

var componentNameRegex = regexp.MustCompile(`^[a-z0-9]+([-_][a-z0-9]+)*$`)

func ValidateComponentName(name string) error {
	if !componentNameRegex.MatchString(name) {
		return fmt.Errorf("component name must be lowercase alphanumeric and can contain hyphens or underscores")
	}
	return nil
}
