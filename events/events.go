package events

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"zombies/config"
)

type Event struct {
	FenceId    int    `json:"fence_id"`
	AssetId    string `json:"asset_id"`
	Data       string `json:"data"`
	AssetTiid  int    `json:"asset_Tiid"`
	Fence_name string `json:"fence_Name"`
}

// Gets all events
func GetAll() (events *[]Event) {
	client := &http.Client{}
	config, _ := config.Read()

	req, _ := http.NewRequest("GET", "https://api.trakit.io/events", nil)
	req.Header.Add("X-Auth-Token", config.Token)
	req.Header.Add("Content-Type", "application/json")

	resp, _ := client.Do(req)

	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	json.Unmarshal(body, &events)

	return events
}
