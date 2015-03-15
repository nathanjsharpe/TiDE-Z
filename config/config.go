package config

import (
	"encoding/json"
	"os"
	"time"
)

type Configuration struct {
	Token          string
	EventsInterval time.Duration
}

func Read() (config Configuration, err error) {
	file, _ := os.Open("config/config.json")
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&config)
	return
}
