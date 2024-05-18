package main

import (
	"backend/components"
	"backend/pages"
	"bytes"
	"context"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
)

func main() {

	counter := 0

	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:8000", "http://localhost:3000"},
		// AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
	}))

	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 5,
	}))

	e.Use(middleware.Decompress())

	e.Static("/public", "./public")

	e.GET("/", func(c echo.Context) error {
		buf := new(bytes.Buffer)
		component := pages.App(pages.Index(counter), "pt-br", "Index", "Test")
		component.Render(context.Background(), buf)
		// c.Set("content-type", "text/html")
		return c.HTML(http.StatusOK, buf.String())
	})

	e.POST("/count", func(c echo.Context) error {
		buf := new(bytes.Buffer)
		counter++
		component := components.Count(counter)
		component.Render(context.Background(), buf)
		c.Set("content-type", "text/html")
		return c.HTML(http.StatusOK, buf.String())
	})

	e.GET("/robots.txt", func(c echo.Context) error {
		return c.String(http.StatusNotFound, "")
	})

	e.GET("*", func(c echo.Context) error {
		buf := new(bytes.Buffer)
		component := pages.App(pages.Error404(), "pt-br", "Error 404", "Test")
		component.Render(context.Background(), buf)
		return c.HTML(http.StatusNotFound, buf.String())
	})

	e.Logger.Fatal(e.Start(":3000"))
}
