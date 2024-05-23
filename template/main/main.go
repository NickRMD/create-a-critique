package main

import (
	"backend/components"
	"backend/pages"
	"backend/renderers"
	"fmt"
	"net/http"
	"os"
	"time"

	// "github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
	"github.com/rs/zerolog"
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
	rendered404Page, err404 := renderers.PageRender(pages.Error404(), "pt-br", "Index", "Test").Render()

	// Start simple counter
	counter := 0

	// Instantiate Echo
	e := echo.New()

	// Create zerolog instance
	logger := zerolog.New(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339}).Level(zerolog.TraceLevel).With().Timestamp().Caller().Logger()

	// Middleware to recover from panic
	e.Use(middleware.RecoverWithConfig(middleware.RecoverConfig{
		StackSize: 4 << 10, // 4 KB
		LogLevel:  log.ERROR,
		LogErrorFunc: func(c echo.Context, err error, stack []byte) error {

			// Prepare a JSON message to be sent to the client
			// Specifying the time and the error message.
			fatal := map[string]string{
				"Time":    time.Now().String(),
				"Panic!":  "Something bad happened.",
				"Error":   err.Error(),
				"Please,": "copy all this page content and send to the site owner!",
			}

			// Get URL endpoint from where the Panic happened
			URL := c.Request().URL

			// Log the error complete with stack included
			logger.Error().
				Time("time", time.Now()).
				Str("URI", URL.String()).
				Int("status", c.Response().Status).
				Err(err).
				Str("stack", string(stack)).
				Msg("Recovered from Error")

			// Send JSON with status code 500
			c.JSON(http.StatusInternalServerError, fatal)

			return nil
		},
	}))

	// Cross-Site Request Forgery middleware.
	// It gets the CSRF token directly from the cookie it make.
	e.Use(middleware.CSRFWithConfig(middleware.CSRFConfig{
		CookieHTTPOnly: true,
		TokenLength:    32,
		TokenLookup:    "cookie:_csrf",
		CookieSameSite: http.SameSiteStrictMode,
		CookieSecure:   true,
		// TokenLookup:    "header:X-CSRF-Token,query:csrf,cookie:_csrf",
	}))

	// Log with middleware using Zerolog backend
	e.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogURI:    true,
		LogStatus: true,
		LogValuesFunc: func(c echo.Context, v middleware.RequestLoggerValues) error {
			logger.Info().
				Str("URI", v.URI).
				Int("status", v.Status).
				Msg("request")

			return nil
		},
	}))

	// Set logger level to "0" where even c.Logger().Print("") are shown, can be changed to show only warnings, errors or even just panics.
	e.Logger.SetLevel(0)

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
		renderedPage, err := renderers.PageRender(pages.Index(counter), "pt-br", "Index", "Test").Render()
		if err != nil {
			c.Logger().Error(err)
			err := map[string]string{
				"error": err.Error(),
			}
			return c.JSON(http.StatusInternalServerError, err)
		}
		return c.HTML(http.StatusOK, renderedPage)
	})

	// Count endpoint
	e.POST("/count", func(c echo.Context) error {
		// This is a simple example of how to update the state in the server side
		// and send the updated content to the frontend.
		counter++
		component, err := renderers.ComponentRender(components.Count(counter))
		if err != nil {
			c.Logger().Error(err)
			err := map[string]string{
				"error": err.Error(),
			}
			return c.JSON(http.StatusInternalServerError, err)
		}
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
		if err404 != nil {
			c.Logger().Error(err404)
			err := map[string]string{
				"error": err404.Error(),
			}
			return c.JSON(http.StatusInternalServerError, err)
		}
		return c.HTML(http.StatusNotFound, rendered404Page)
	})

	// Start server
	e.Logger.Fatal(e.Start(port))
}
