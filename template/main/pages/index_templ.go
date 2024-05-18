// Code generated by templ - DO NOT EDIT.

// templ: version: v0.2.680
package pages

//lint:file-ignore SA4006 This context is only used if a nested component is present.

import "github.com/a-h/templ"
import "context"
import "io"
import "bytes"

import (
	"backend/components"
)

func Index(counter int) templ.Component {
	return templ.ComponentFunc(func(ctx context.Context, templ_7745c5c3_W io.Writer) (templ_7745c5c3_Err error) {
		templ_7745c5c3_Buffer, templ_7745c5c3_IsBuffer := templ_7745c5c3_W.(*bytes.Buffer)
		if !templ_7745c5c3_IsBuffer {
			templ_7745c5c3_Buffer = templ.GetBuffer()
			defer templ.ReleaseBuffer(templ_7745c5c3_Buffer)
		}
		ctx = templ.InitializeContext(ctx)
		templ_7745c5c3_Var1 := templ.GetChildren(ctx)
		if templ_7745c5c3_Var1 == nil {
			templ_7745c5c3_Var1 = templ.NopComponent
		}
		ctx = templ.ClearChildren(ctx)
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("<h2>Technologies Used:</h2><div><a href=\"https://go.dev/\" target=\"_blank\"><img src=\"/public/golang.svg\" class=\"size-40 logo go\" alt=\"Go logo\"></a> <a href=\"https://templ.guide/\" target=\"_blank\"><img src=\"/public/templ.svg\" style=\"height: 10rem; width: 10rem;\" class=\"logo templ\" alt=\"Templ logo\"></a> <a href=\"https://htmx.org/\" target=\"_blank\"><img src=\"/public/htmx.svg\" class=\"size-40 logo htmx\" alt=\"HTMX logo\"></a> <a href=\"https://alpinejs.dev/\" target=\"_blank\"><img src=\"/public/alpinejs.svg\" class=\"size-40 logo alpine\" alt=\"Alpine.js logo\"></a><h1>Critique of the <span class=\"text-cyan-300\">Gotha</span> Program</h1><div class=\"card\"><button id=\"button\" hx-post=\"/count\" type=\"button\" hx-swap=\"innerHTML\">")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = components.Count(counter).Render(ctx, templ_7745c5c3_Buffer)
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("</button></div><p class=\"read-the-docs\">Click on the button and update the page to see the magic!</p></div>")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		if !templ_7745c5c3_IsBuffer {
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteTo(templ_7745c5c3_W)
		}
		return templ_7745c5c3_Err
	})
}
