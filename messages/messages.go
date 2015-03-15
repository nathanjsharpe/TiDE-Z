package messages

import (
	"bytes"
	"crypto"
	"crypto/ecdsa"
	"crypto/md5"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"math/big"
	mrand "math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"
	"zombies/config"
)

type Message struct {
	Tiid      int    `json:"id"`
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

	message := Message{AssetId: assetId, Message: msg, Sender: "Ash"}
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

// Sends message encrypted with given private key
func VerifySent(msg Message, pubkey *crypto.PublicKey) (successful bool) {

	rsarray := strings.Split(msg.Message, "|")
	r := big.NewInt(0)
	s := big.NewInt(0)
	_, ok := r.SetString(rsarray[0], 10)
	_, ok = s.SetString(rsarray[1], 10)
	if ok {
		h := md5.New()
		io.WriteString(h, "Die"+msg.AssetId)
		// verifystatus := ecdsa.Verify(pubkey, h.Sum(nil), r, s)
		return true //verifystatus
	}
	return false
}

type Survivor struct {
	Lat      float64
	Lng      float64
	GoalLat  float64
	GoalLng  float64
	Asset_id string
	Alive    bool
}

type Ti_Message struct {
	AssetId string `json:"asset_id"`
	// Timestamp string `json:"timestamp"`
	Longitude float64 `json:"longitude"`
	Latitude  float64 `json:"latitude"`
}

func PostTiMessage(asset_id string, lat float64, lng float64, url string, token string) {
	ti_message := Ti_Message{AssetId: asset_id, Longitude: lng, Latitude: lat}
	fmt.Printf("Lat: %d\nLng: %d", lat, lng)
	msgJson, _ := json.Marshal(ti_message)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(msgJson))
	req.Header.Set("X-Auth-Token", token)
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

func ComputeNearPath(survivor Survivor) Survivor {

	// dirx := survivor.Lat - survivor.GoalLat
	// diry := survivor.Lng - survivor.GoalLng

	survivor.Lat = survivor.Lat - (float64(random(1, 10)) / 100) //survivor.Lat + .00032*(dirx/diry) + (mrand.Float64()*2.0 - 1.0) *.00032
	survivor.Lng = survivor.Lng - (float64(random(1, 12)) / 100) //survivor.Lng + .00032*(diry/dirx) + (mrand.Float64()*2.0 - 1.0) *.00032

	return survivor
}

func random(min, max int) int {
	mrand.Seed(time.Now().UnixNano())
	return mrand.Intn(max-min) + min
}

func CreateTiMsg(survivor Survivor, token string, c chan Survivor) Survivor {
	survivor = ComputeNearPath(survivor)
	url := `http://data.trakit.io/ti_raw_msg`

	PostTiMessage(survivor.Asset_id, survivor.Lat, survivor.Lng, url, token)
	c <- survivor
	return survivor
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
	req.Header.Set("X-Auth-Token", token)
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
	req.Header.Set("X-Auth-Token", token)
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
