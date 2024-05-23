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
func (s *pageRenderer) Render() (string, error) {
	content := new(bytes.Buffer)
	component := pages.App(s.component, s.language, s.title, s.description)
	err := component.Render(context.Background(), content)
	if err != nil {
		return "", err
	}

	return content.String(), nil
}

// Instantiate pageRenderer
func PageRender(component templ.Component, language, title, description string) *pageRenderer {
	return &pageRenderer{component, language, title, description}
}
