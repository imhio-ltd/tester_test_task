package main

import (
	"flag"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg"
	"github.com/go-pg/pg/orm"
	"github.com/mssola/user_agent"
	"github.com/pkg/errors"
	"log"
	"net/http"
	"path/filepath"
)

var db *pg.DB

const Version = "0.0.01-in-prod-yesterday"

type TRequest struct {
	Rate    int    `json:"user_action,string"`
	Comment string `json:"feedback"`
}

type TFeedbackModel struct {
	ID      int    `sql:"id"`
	Rate    int    `sql:"result"`
	Comment string `sql:"feedback,type:varchar(255)"`
	Device  string `sql:"device"`
}

func connectOrm() error {

	conn := pg.Connect(&pg.Options{
		Addr:     "postgres:5432",
		User:     "postgres",
		Database: "core",
		Password: "devpass",
	})

	err := conn.
		CreateTable(&TFeedbackModel{}, &orm.CreateTableOptions{
			IfNotExists: true,
		})
	if err != nil {
		return err
	}

	err = conn.
		Model(&TFeedbackModel{}).
		ColumnExpr("max(id)+1 as id").
		Select(&lastId)
	if err != nil {
		return err
	}

	db = conn
	return nil
}

func main() {
	pBoolVersion := flag.Bool("version", false,
		"show version and exit")

	flag.Parse()

	if *pBoolVersion {
		fmt.Printf("Version is %v\n", Version)
		return
	}

	err := connectOrm()
	if err != nil {
		log.Fatal(err)
	}

	router := gin.Default()

	router.StaticFile("/", "./static/index.html")

	dir, err := filepath.Glob("./static/*")
	if err != nil {
		log.Fatal(err)
	}

	for _, staticFile := range dir {
		router.StaticFile(filepath.Base(staticFile), staticFile)
	}

	ajaxGroup := router.Group("/")

	ajaxGroup.Use(func(c *gin.Context) {
		c.Next()

		if len(c.Errors) > 0 {
			c.JSON(http.StatusBadRequest, map[string]interface{}{
				"status": "error",
				"errors": c.Errors.Errors(),
			})
		}
	})

	ajaxGroup.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"POST"},
	}))

	ajaxGroup.POST("/nps", addNps)

	log.Println("Starting listening")
	err = router.Run(":58001")
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func addNps(c *gin.Context) {

	// parse request
	var request TRequest
	err := c.BindJSON(&request)
	if err != nil {
		_ = c.Error(err)
		return
	}

	// validate request
	if request.Rate < 0 || request.Rate > 10 {
		_ = c.Error(errors.New("Invalid rate"))
		return
	}

	defer nextId()

	// create a model
	toinsert := TFeedbackModel{
		ID:      lastId,
		Rate:    request.Rate,
		Comment: request.Comment,
		Device:  GetUserQualifierDevice(c.Request),
	}

	// save it
	_, err = db.Model(&toinsert).Insert()
	if err != nil {
		_ = c.Error(err)
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"status": "ok",
	})
}

func GetUserQualifierDevice(r *http.Request) string {
	ua := user_agent.New(r.UserAgent())
	if ua.Mobile() {
		return "mobile"
	}

	return "desktop"
}

var lastId int

func nextId() {
	lastId += 1
}
