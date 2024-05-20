package renderers

import (
	"backend/pages"
	"bytes"
	"context"
	"github.com/a-h/templ"
)

// Page Renderer for easier rendering
type pageRenderer struct {
	component   templ.Component
	language    string
	title       string
	description string
}

// Render method
func (s pageRenderer) Render() string {
	content := new(bytes.Buffer)
	component := pages.App(s.component, s.language, s.title, s.description)
	component.Render(context.Background(), content)
	return content.String()
}

// Instantiate pageRenderer
func PageRender(component templ.Component, language string, title string, description string) pageRenderer {
	return pageRenderer{component, language, title, description}
}
