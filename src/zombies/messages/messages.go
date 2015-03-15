package messages

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/md5"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"math/big"
	"net/http"
	// "strconv"
	mrand "math/rand"
	"strconv"
	"strings"
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

func GetForAsset(assetId string) (messages *[]Message) {
	client := &http.Client{}
	config, _ := config.Read()

	req, _ := http.NewRequest("GET", "https://api.trakit.io/message/"+assetId, nil)
	req.Header.Add("X-Auth-Token", config.Token)
	req.Header.Add("Content-Type", "application/json")

	resp, _ := client.Do(req)

	// defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println(body)
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

// Sends message encrypted with given private key
func VerifySent(msg Message, pubkey *ecdsa.PublicKey) (successful bool) {

	rsarray := strings.Split(msg.Message, "|")
	r := big.NewInt(0)
	s := big.NewInt(0)
	_, ok := r.SetString(rsarray[0], 10)
	_, ok = s.SetString(rsarray[1], 10)
	if ok {
		h := md5.New()
		io.WriteString(h, "Die"+msg.AssetId)
		verifystatus := ecdsa.Verify(pubkey, h.Sum(nil), r, s)
		return verifystatus
	}
	return false
}

type Survivor struct {
	X        float64
	Y        float64
	Goalx    float64
	Goaly    float64
	Asset_id string
	Alive    bool
}

type Ti_Message struct {
	AssetId string `json:"asset_id"`
	// Timestamp string `json:"timestamp"`
	Longitude float64 `json:"longitude"`
	Latitude  float64 `json:"latitude"`
}

func PostTiMessage(asset_id string, lng float64, lat float64, url string, token string) {
	ti_message := Ti_Message{AssetId: asset_id, Longitude: lng, Latitude: lat}
	msgJson, _ := json.Marshal(ti_message)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(msgJson))
	req.Header.Set("X-Auth-Token", "12345")
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	fmt.Println("response Status:", resp.Status)
	fmt.Println("response Headers:", resp.Header)
	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println("response Body:", string(body))
}

func ComputeNearPath(survivor Survivor) (float64, float64) {

	dirx := survivor.X - survivor.Goalx
	diry := survivor.Y - survivor.Goaly

	survivor.X = survivor.X + .00032*(dirx/diry) + (mrand.Float64()*2.0-1.0)*.00032
	survivor.Y = survivor.Y + .00032*(diry/dirx) + (mrand.Float64()*2.0-1.0)*.00032

	return survivor.X, survivor.Y
}

func CreateTiMsg(survivor Survivor, token string) {
	nex, ney := ComputeNearPath(survivor)
	url := `http://data.trakit.io/ti_raw_msg`

	PostTiMessage(survivor.Asset_id, nex, ney, url, token)
}

func PostGeoFenceMessage(asset_id string, lng float64, lat float64, token string) (fenceid string) {
	url := `http://data.trakit.io/geoFence`
	var fencestrings = `{"name": "`
	fencestrings += asset_id
	fencestrings += `","description":"","inclusive": "true", "asset_ids": [ "*"],"geometry": {"coordinates": [[`
	fencestrings += strconv.FormatFloat((lat+.00032), 'f', 6, 64) + "," + strconv.FormatFloat((lng+.00032), 'f', 6, 64) + "],["
	fencestrings += strconv.FormatFloat((lat+.00032), 'f', 6, 64) + "," + strconv.FormatFloat((lng+.00032), 'f', 6, 64) + "],["
	fencestrings += strconv.FormatFloat((lat+.00032), 'f', 6, 64) + "," + strconv.FormatFloat((lng+.00032), 'f', 6, 64) + "],["
	fencestrings += strconv.FormatFloat((lat+.00032), 'f', 6, 64) + "," + strconv.FormatFloat((lng+.00032), 'f', 6, 64) + "]],"
	fencestrings += `"type": "MultiPoint"}}`
	msgJson, _ := json.Marshal(fencestrings)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(msgJson))
	req.Header.Set("X-Auth-Token", "12345")
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	fmt.Println("response Status:", resp.Status)
	fmt.Println("response Headers:", resp.Header)
	body, _ := ioutil.ReadAll(resp.Body)

	var objmap map[string]*json.RawMessage
	err = json.Unmarshal(body, &objmap)

	var idstr string
	err = json.Unmarshal(*objmap["id"], &idstr)
	fenceid = idstr
	fmt.Println("response Body:", string(body))

	return fenceid
}

func PutGeoFenceMessage(asset_id string, lng float64, lat float64, token string, fenceid string) {
	url := `http://data.trakit.io/geoFence`
	var fencestrings = "{\"id\":" + fenceid
	fencestrings += `,"name": "` + asset_id
	fencestrings += `","description":"","inclusive": "true", "asset_ids": [ "*"],"geometry": {"coordinates": [[`
	fencestrings += strconv.FormatFloat((lat+.00032), 'f', 6, 64) + "," + strconv.FormatFloat((lng+.00032), 'f', 6, 64) + "],["
	fencestrings += strconv.FormatFloat((lat+.00032), 'f', 6, 64) + "," + strconv.FormatFloat((lng+.00032), 'f', 6, 64) + "],["
	fencestrings += strconv.FormatFloat((lat+.00032), 'f', 6, 64) + "," + strconv.FormatFloat((lng+.00032), 'f', 6, 64) + "],["
	fencestrings += strconv.FormatFloat((lat+.00032), 'f', 6, 64) + "," + strconv.FormatFloat((lng+.00032), 'f', 6, 64) + "]],"
	fencestrings += `"type": "MultiPoint"}}`

	msgJson, _ := json.Marshal(fencestrings)

	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(msgJson))
	req.Header.Set("X-Auth-Token", "12345")
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	fmt.Println("response Status:", resp.Status)
	fmt.Println("response Headers:", resp.Header)
	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println("response Body:", string(body))
}
