package messages

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/md5"
	"crypto/rand"
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"
	"zombies/config"
)

type Message struct {
	Tiid      int    `json:"id,omitempty"`
	AssetId   string `json:"asset_id"`
	Timestamp string `json:"timestamp"`
	Message   string `json:"message"`
	Sender    string `json:"sender"`
	Sent      bool   `json:"sent"`
}

// Sends a message to an asset.
// assetId pertains to data api, equivalent to deviceAddress on assets in app api.
func Send(assetId string, msg string) (successful bool) {
	client := &http.Client{}
	config, _ := config.Read()

	message := Message{AssetId: assetId, Message: msg, Sender: "Dude"}
	msgJson, _ := json.Marshal(message)

	req, _ := http.NewRequest("POST", "https://api.trakit.io/message", bytes.NewBuffer(msgJson))
	req.Header.Add("X-Auth-Token", config.Token)
	req.Header.Add("Content-Type", "application/json")

	resp, _ := client.Do(req)

	defer resp.Body.Close()

	return resp.StatusCode < 300
}

// Gets all of the messages for the asset with the matching id.
func GetForAsset(assetId string) (messages *[]Message) {
	client := &http.Client{}
	config, _ := config.Read()

	req, _ := http.NewRequest("GET", "https://api.trakit.io/message/"+assetId, nil)
	req.Header.Add("X-Auth-Token", config.Token)
	req.Header.Add("Content-Type", "application/json")

	resp, _ := client.Do(req)

	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	json.Unmarshal(body, &messages)

	return messages
}

// Gets all messages for all assets.
func GetAll() (messages *[]Message) {
	return GetForAsset("*")
}

// Sends message encrypted with given private key
func SendEncrypted(assetId string, msg string, priv *ecdsa.PrivateKey) (successful bool) {
	h := md5.New()
	io.WriteString(h, "Die"+assetId)

	r, s, _ := ecdsa.Sign(rand.Reader, priv, h.Sum(nil))

	return Send(assetId, r.String()+"|"+s.String())
}
