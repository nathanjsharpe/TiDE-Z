package client

import (
	//"fmt"
	"crypto"
	"fmt"
	"math/rand"
	"time"
	"zombies/messages"
)

func RecvMsgThread(survivor messages.Survivor, starttime int, token string, pubkey *crypto.PublicKey) {
	for starttime > time.Now().Second() {
		time.Sleep(5 * time.Second)
	}
	for survivor.Alive == true {
		msgs := messages.GetForAsset(survivor.Asset_id)
		for _, m := range *msgs {
			//this is fairly advanced, skipped for first tests
			survivor.Alive = messages.VerifySent(m, pubkey)
			fmt.Println(m)
		}
		time.Sleep(5 * time.Second)
	}
}

func SendMsgThread(survivor messages.Survivor, starttime int, token string, c chan messages.Survivor) {
	for starttime > time.Now().Second() {
		time.Sleep(5 * time.Second)
	}

	for survivor.Alive == true {
		survivor = messages.CreateTiMsg(survivor, token, c)
		time.Sleep(5 * time.Second)
		fmt.Println("sending data")
	}

	//post the initial fence
	fenceid := messages.PostGeoFenceMessage(survivor.Asset_id, survivor.Lat, survivor.Lng, token)
	//put, move random fences
	for survivor.Alive == false {
		survivor.Lat += (rand.Float64()*2.0 - 1.0) * .00032
		survivor.Lng += (rand.Float64()*2.0 - 1.0) * .00032
		messages.PutGeoFenceMessage(survivor.Asset_id, survivor.Lat, survivor.Lng, token, fenceid)
		messages.CreateTiMsg(survivor, token, c)
		time.Sleep(5 * time.Second)
		fmt.Println("sending fence data")
	}

}

func Create_New_Survivor(goalLat float64, goalLng float64, initialLat float64, initialLng float64, starttime int, asset_id string, token string, pubkey *crypto.PublicKey, c chan messages.Survivor) {
	survivor := messages.Survivor{}
	survivor.Asset_id = asset_id
	survivor.Alive = true
	survivor.Lat = initialLat
	survivor.Lng = initialLng
	survivor.GoalLat = goalLat
	survivor.GoalLng = goalLng

	// go RecvMsgThread(survivor, starttime, token, pubkey)
	go SendMsgThread(survivor, starttime, token, c)
}
