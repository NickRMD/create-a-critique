package main

import (
	"backend/components"
	"backend/pages"
	"backend/renderers"
	"fmt"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {

	// Get PORT from environment variable.
	port := os.Getenv("PORT")
	if port == "" {
		// If variable is not found, use port 3000 by default.
		port = ":3000"
	} else {
		// If variable is found, put ":" before the number,
		// so the framework can identify which port to use.
		port = fmt.Sprintf(":%s", port)
	}

	// Static pages are rendered just one time, at the start of the program
	rendered404Page := renderers.PageRender(pages.Error404(), "pt-br", "Index", "Test").Render()

	// Start simple counter
	counter := 0

	// Instantiate Echo
	e := echo.New()

	// Use CORS so HTMX can catch data from server.
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:8000", "http://localhost:3000"},
		// AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
	}))

	// Use some compression and limit to contents bigger than 300 bytes.
	// Compression can have levels from -1 through 9.
	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level:     5,
		MinLength: 300,
	}))

	// Middleware to decompress content from outside.
	e.Use(middleware.Decompress())

	// Serve static assets from the "public" directory, which is accessible at the "/public" URL path.
	// This setup is typically used to serve files like images, CSS, and JavaScript that don't change often.
	e.Static("/public", "./public")

	// Index page
	e.GET("/", func(c echo.Context) error {
		// Dynamic pages are rendered each time the page is loaded, so the content is loaded dynamically
		renderedPage := renderers.PageRender(pages.Index(counter), "pt-br", "Index", "Test").Render()
		return c.HTML(http.StatusOK, renderedPage)
	})

	// Count endpoint
	e.POST("/count", func(c echo.Context) error {
		// This is a simple example of how to update the state in the server side
		// and send the updated content to the frontend.
		counter++
		component := renderers.ComponentRender(components.Count(counter))
		return c.String(http.StatusOK, component)
	})

	// Robots.txt
	e.GET("/robots.txt", func(c echo.Context) error {
		// You should add your own robots.txt!
		return c.String(http.StatusNotFound, "")
	})

	// If endpoint is not found, show this by default if using GET method.
	e.GET("*", func(c echo.Context) error {
		// 404 Page
		return c.HTML(http.StatusNotFound, rendered404Page)
	})

	// Start server
	e.Logger.Fatal(e.Start(port))
}
