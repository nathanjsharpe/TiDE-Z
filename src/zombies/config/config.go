package config

import (
	"encoding/json"
	"os"
)

type Configuration struct {
	Token string
}

func Read() (config Configuration, err error) {
	file, _ := os.Open("config.json")
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&config)
	return
}
