package assets

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"
	"zombies/config"
)

type Asset struct {
	Id            int    `json:"id"`
	DeviceAddress string `json:"deviceAddress"`
	Name          string `json:"name"`
	Group         string `json:"group"`
	Notes         string `json:"notes"`
	Color         string `json:"color"`
	Icon          string `json:"icon"`
}

func Create(asset Asset) (id int) {
	client := &http.Client{}
	config, _ := config.Read()

	msgJson, _ := json.Marshal(asset)

	req, _ := http.NewRequest("POST", "https://api.trakit.io/asset", bytes.NewBuffer(msgJson))
	req.Header.Add("X-Auth-Token", config.Token)
	req.Header.Add("Content-Type", "application/json")

	resp, _ := client.Do(req)

	defer resp.Body.Close()

	// body, _ := ioutil.ReadAll(resp.Body)
	buf := new(bytes.Buffer)
	buf.ReadFrom(resp.Body)

	id, _ = strconv.Atoi(buf.String())

	return
}

// Gets all assets
func GetAll() (assets *[]Asset) {
	client := &http.Client{}
	config, _ := config.Read()

	req, _ := http.NewRequest("GET", "https://api.trakit.io/asset", nil)
	req.Header.Add("X-Auth-Token", config.Token)
	req.Header.Add("Content-Type", "application/json")

	resp, _ := client.Do(req)

	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	json.Unmarshal(body, &assets)

	return assets
}
