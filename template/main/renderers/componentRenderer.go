package renderers

import (
	"bytes"
	"context"

	"github.com/a-h/templ"
)

// Component Renderer
func ComponentRender(s templ.Component) string {

	content := new(bytes.Buffer)
	s.Render(context.Background(), content)
	return content.String()

}
