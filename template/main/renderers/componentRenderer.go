package renderers

import (
	"bytes"
	"context"

	"github.com/a-h/templ"
)

// Component Renderer
func ComponentRender(s templ.Component) (string, error) {

	content := new(bytes.Buffer)
	err := s.Render(context.Background(), content)
	if err != nil {
		return "", err
	}
	return content.String(), nil

}
