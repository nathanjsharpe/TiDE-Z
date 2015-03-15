package main

import (
	"crypto"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"github.com/julienschmidt/httprouter"
	"github.com/kellydunn/golang-geo"
	"log"
	"net/http"
	"sort"
	"strconv"
	"time"
	"zombies/assets"
	"zombies/client"
	"zombies/config"
	"zombies/events"
	"zombies/messages"
)

type Player struct {
	Id       int          `json:"id"`
	Asset    assets.Asset `json:"asset"`
	Lat      float64      `json:"lat"`
	Lng      float64      `json:"lng"`
	Distance float64      `json:"distance"`
	Alive    bool         `json:"alive"`
}

var data = struct {
	assets        []assets.Asset
	players       []Player
	deadAssets    []string
	privKey       *ecdsa.PrivateKey
	pubKey        crypto.PublicKey
	deviceAddress int
}{
	deviceAddress: 0,
}

func main() {
	// Create public and private key
	data.privKey, _ = ecdsa.GenerateKey(elliptic.P384(), rand.Reader)
	data.pubKey = data.privKey.Public()
	data.deviceAddress = 0

	// Start polling for events (interval based on config)
	_ = pollForEvents()

	// HTTP server
	router := httprouter.New()
	router.POST("/survivors", createSurvivor)
	router.GET("/survivors", leaderboard)
	router.Handle("OPTIONS", "/survivors", leaderboard)

	log.Fatal(http.ListenAndServe(":3000", router))
}

func createSurvivor(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	decoder := json.NewDecoder(r.Body)
	config, _ := config.Read()

	var survivor assets.Asset
	var c chan messages.Survivor = make(chan messages.Survivor)

	err := decoder.Decode(&survivor)
	if err != nil {
		http.Error(w, err.Error(), 500)
	}

	createdAsset := createAsset(survivor)
	data.assets = append(data.assets, createdAsset)

	player := Player{Id: createdAsset.Id, Asset: createdAsset, Lat: 36.131, Lng: -115.151, Alive: true}
	go client.Create_New_Survivor(34.05, -118.25, player.Lat, player.Lng, 0, createdAsset.DeviceAddress, config.Token, &data.pubKey, c)
	data.players = append(data.players, player)
	go monitorSurvivorLocations(c)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Methods", "POST, HEAD, OPTIONS")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Add("Access-Control-Allow-Headers", "X-Auth-Token")
}

func monitorSurvivorLocations(c chan messages.Survivor) {
	for {
		survivor := <-c
		for i, player := range data.players {
			if survivor.Asset_id == player.Asset.DeviceAddress {
				data.players[i].Lat = survivor.Lat
				data.players[i].Lng = survivor.Lng
				break
			}
		}
	}
}

func leaderboard(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	for i, player := range data.players {
		p := geo.NewPoint(player.Lat, player.Lng)
		p2 := geo.NewPoint(34.05, -118.25) // Los Angeles
		data.players[i].Distance = p.GreatCircleDistance(p2)
	}

	sort.Sort(ByDistance(data.players))

	playersJson, _ := json.Marshal(data.players)

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers",
		"Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, X-Auth-Token, Authorization")
	w.Write(playersJson)
}

func pollForEvents() (eventsTicker *time.Ticker) {
	config, _ := config.Read()
	eventsTicker = time.NewTicker(config.EventsInterval * time.Second)

	go func() {
		for range eventsTicker.C {
			processEvents()
			fmt.Printf("data: %+v\n\n", data)
			fmt.Printf("messages: %-v\n\n", messages.GetForAsset("klsjdlfkjsl"))
		}
	}()

	return
}

func createAsset(asset assets.Asset) assets.Asset {
	data.deviceAddress++
	asset.DeviceAddress = strconv.Itoa(data.deviceAddress)
	asset.Group = "survivors"
	asset.Icon = "user"
	asset.Color = "red"
	asset.Id = assets.Create(asset)
	return asset
}

func processEvents() {
	events := events.GetAll()
	fmt.Printf("Events: %+v\n\n", events)

	for _, event := range *events {
		if stillAlive(event.AssetId) {
			messages.SendEncrypted(event.AssetId, "Die"+event.AssetId, data.privKey)
			data.deadAssets = append(data.deadAssets, event.AssetId)
		}
	}
}

func stillAlive(deviceAddress string) (isDead bool) {
	for _, da := range data.deadAssets {
		if da == deviceAddress {
			return false
		}
	}
	return true
}

type ByDistance []Player

func (a ByDistance) Len() int           { return len(a) }
func (a ByDistance) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByDistance) Less(i, j int) bool { return a[i].Distance < a[j].Distance }
